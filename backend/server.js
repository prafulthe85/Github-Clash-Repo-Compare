const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*", // later you can restrict to Netlify domain
    credentials: true,
  })
);
app.use(express.json());

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const handleGitHubError = (error, username) => {
  if (error.response) {
    const status = error.response.status;
    if (status === 404) {
      return { error: `User "${username}" not found on GitHub`, status: 404 };
    } else if (status === 403) {
      const resetTime = error.response.headers["x-ratelimit-reset"];
      return {
        error: "GitHub API rate limit exceeded. Please try again later.",
        status: 403,
        resetTime: resetTime ? new Date(resetTime * 1000).toISOString() : null,
      };
    } else if (status === 401) {
      return {
        error: "Invalid GitHub token. Please check your configuration.",
        status: 401,
      };
    }
  }
  return {
    error: `Failed to fetch data for "${username}": ${error.message}`,
    status: 500,
  };
};

async function getUserData(username) {
  try {
    const query = `
      query getUserData($username: String!) {
        user(login: $username) {
          login
          name
          bio
          avatarUrl
          location
          company
          websiteUrl
          followers {
            totalCount
          }
          following {
            totalCount
          }
          createdAt
          updatedAt
          repositories(
            first: 50
            orderBy: {field: STARGAZERS, direction: DESC}
            ownerAffiliations: OWNER
          ) {
            totalCount
            nodes {
              name
              description
              stargazerCount
              forkCount
              watchers {
                totalCount
              }
              primaryLanguage {
                name
              }
              languages(first: 10) {
                edges {
                  size
                  node {
                    name
                  }
                }
              }
              updatedAt
            }
          }
          contributionsCollection(from: "2020-01-01T00:00:00Z") {
            totalCommitContributions
            totalRepositoryContributions
            restrictedContributionsCount
          }
        }
      }
    `;

    const response = await axios.post(
      GITHUB_GRAPHQL_API,
      {
        query: query,
        variables: { username: username },
      },
      {
        headers: {
          Authorization: `bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      const error = response.data.errors[0];
      if (error.type === "NOT_FOUND") {
        throw { error: `User "${username}" not found on GitHub`, status: 404 };
      }
      throw {
        error: error.message || "Failed to fetch GitHub data",
        status: 500,
      };
    }

    const user = response.data.data.user;
    if (!user) {
      throw { error: `User "${username}" not found on GitHub`, status: 404 };
    }

    const languageMap = {};
    let totalStars = 0;
    let totalForks = 0;
    let totalWatchers = 0;

    user.repositories.nodes.forEach((repo) => {
      totalStars += repo.stargazerCount;
      totalForks += repo.forkCount;
      totalWatchers += repo.watchers.totalCount;

      repo.languages.edges.forEach((edge) => {
        const langName = edge.node.name;
        languageMap[langName] = (languageMap[langName] || 0) + edge.size;
      });
    });

    const topLanguages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang, bytes]) => ({ language: lang, bytes }));

    console.log(`Fetched data from GitHub GraphQL for ${username} - FAST!`);

    return {
      username: user.login,
      name: user.name || user.login,
      bio: user.bio || "No bio available",
      avatar: user.avatarUrl,
      location: user.location || "Not specified",
      company: user.company || "Not specified",
      blog: user.websiteUrl || "",
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      publicRepos: user.repositories.totalCount,
      totalCommits:
        (user.contributionsCollection.totalCommitContributions || 0) +
        (user.contributionsCollection.restrictedContributionsCount || 0),
      totalStars: totalStars,
      totalForks: totalForks,
      totalWatchers: totalWatchers,
      accountCreated: user.createdAt,
      lastUpdated: user.updatedAt,
      languages: languageMap,
      topLanguages: topLanguages,
      repos: user.repositories.nodes.slice(0, 10).map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazerCount,
        forks: repo.forkCount,
        language: repo.primaryLanguage?.name || "N/A",
        updated: repo.updatedAt,
      })),
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    console.error("GraphQL Error:", error.response?.data || error.message);
    throw handleGitHubError(error, username);
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GitHub Comparer API is running" });
});

async function streamAIComparison(user1Data, user2Data, res) {
  try {
    const topLangs1 = user1Data.topLanguages
      .slice(0, 5)
      .map((l) => l.language)
      .join(", ");
    const topLangs2 = user2Data.topLanguages
      .slice(0, 5)
      .map((l) => l.language)
      .join(", ");

    const prompt = `Compare GitHub profiles:

${user1Data.username}: ${user1Data.name} | ${user1Data.followers} followers, ${
      user1Data.following
    } following | ${user1Data.publicRepos} repos | ${
      user1Data.totalStars
    } stars | ${user1Data.totalCommits} commits | Languages: ${
      topLangs1 || "None"
    }

${user2Data.username}: ${user2Data.name} | ${user2Data.followers} followers, ${
      user2Data.following
    } following | ${user2Data.publicRepos} repos | ${
      user2Data.totalStars
    } stars | ${user2Data.totalCommits} commits | Languages: ${
      topLangs2 || "None"
    }

Provide a concise comparison covering: commonalities, who leads in what areas, language expertise, and overall insights. Keep it friendly and conversational.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "GitHub profile comparison assistant. Provide concise, humanized comparisons.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github-profile-comparer.netlify.app",
          "X-Title": "GitHub Profile Comparer",
        },
        responseType: "stream",
      }
    );

    let fullText = "";

    response.data.on("data", (chunk) => {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || "";

            if (content) {
              fullText += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Skip that bluddy invalid JSON
          }
        }
      }
    });

    response.data.on("end", () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    response.data.on("error", (error) => {
      console.error("Streaming Error:", error);
      res.write(
        `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
      );
      res.end();
    });
  } catch (error) {
    console.error(
      "OpenRouter API Error:",
      error.response?.data || error.message
    );

    const errorMessage =
      error.response?.data?.error?.code === 402
        ? "Insufficient API credits. Please add credits to your OpenRouter account."
        : "Failed to generate AI comparison. Please try again.";

    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
}

async function streamAIRoast(user1Data, user2Data, roastType, res) {
  try {
    const topLangs1 = user1Data.topLanguages
      .slice(0, 5)
      .map((l) => l.language)
      .join(", ");
    const topLangs2 = user2Data.topLanguages
      .slice(0, 5)
      .map((l) => l.language)
      .join(", ");

    let prompt = "";

    if (roastType === "user1") {
      prompt = `You are a funny Indian roaster with a desi accent. Create a hilarious, savage roast of ${
        user1Data.username
      } while making ${
        user2Data.username
      } look like an absolute legend and hero.

${user1Data.username} Stats: ${user1Data.followers} followers | ${
        user1Data.publicRepos
      } repos | ${user1Data.totalStars} stars | ${
        user1Data.totalCommits
      } commits | Languages: ${topLangs1 || "None"}

${user2Data.username} Stats (THE HERO): ${user2Data.followers} followers | ${
        user2Data.publicRepos
      } repos | ${user2Data.totalStars} stars | ${
        user2Data.totalCommits
      } commits | Languages: ${topLangs2 || "None"}

Roast ${
        user1Data.username
      } brutally but humorously in Indian style (use phrases like "yaar", "bhai", "arre", etc.). Make ${
        user2Data.username
      } look amazing and superior. Be savage but funny. Make it long, detailed, and entertaining. Use Indian English expressions naturally.`;
    } else if (roastType === "user2") {
      prompt = `You are a funny Indian roaster with a desi accent. Create a hilarious, savage roast of ${
        user2Data.username
      } while making ${
        user1Data.username
      } look like an absolute legend and hero.

${user1Data.username} Stats (THE HERO): ${user1Data.followers} followers | ${
        user1Data.publicRepos
      } repos | ${user1Data.totalStars} stars | ${
        user1Data.totalCommits
      } commits | Languages: ${topLangs1 || "None"}

${user2Data.username} Stats: ${user2Data.followers} followers | ${
        user2Data.publicRepos
      } repos | ${user2Data.totalStars} stars | ${
        user2Data.totalCommits
      } commits | Languages: ${topLangs2 || "None"}

Roast ${
        user2Data.username
      } brutally but humorously in Indian style (use phrases like "yaar", "bhai", "arre", etc.). Make ${
        user1Data.username
      } look amazing and superior. Be savage but funny. Make it long, detailed, and entertaining. Use Indian English expressions naturally.`;
    } else {
      prompt = `You are a funny Indian roaster with a desi accent. Create a hilarious, savage roast comparing both ${
        user1Data.username
      } and ${
        user2Data.username
      }. Roast both of them but in a fun, competitive way. Make it entertaining and savage.

${user1Data.username} Stats: ${user1Data.followers} followers | ${
        user1Data.publicRepos
      } repos | ${user1Data.totalStars} stars | ${
        user1Data.totalCommits
      } commits | Languages: ${topLangs1 || "None"}

${user2Data.username} Stats: ${user2Data.followers} followers | ${
        user2Data.publicRepos
      } repos | ${user2Data.totalStars} stars | ${
        user2Data.totalCommits
      } commits | Languages: ${topLangs2 || "None"}

Roast both brutally but humorously in Indian style (use phrases like "yaar", "bhai", "arre", etc.). Compare them, roast their weaknesses, make fun of their stats. Be savage but funny. Make it long, detailed, and entertaining. Use Indian English expressions naturally.`;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'You are a hilarious Indian roaster with a desi accent. You roast people in a funny, savage way using Indian English expressions like "yaar", "bhai", "arre", "bro", etc. Make it entertaining, detailed, and humanized.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 1500,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github-profile-comparer.netlify.app",
          "X-Title": "GitHub Profile Comparer",
        },
        responseType: "stream",
      }
    );

    let fullText = "";

    response.data.on("data", (chunk) => {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || "";

            if (content) {
              fullText += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    });

    response.data.on("end", () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    response.data.on("error", (error) => {
      console.error("Streaming Error:", error);
      res.write(
        `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
      );
      res.end();
    });
  } catch (error) {
    console.error(
      "OpenRouter API Error:",
      error.response?.data || error.message
    );

    const errorMessage =
      error.response?.data?.error?.code === 402
        ? "Insufficient API credits. Please add credits to your OpenRouter account."
        : "Failed to generate roast. Please try again.";

    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
}

app.post("/api/compare", async (req, res) => {
  try {
    const { username1, username2 } = req.body;

    if (!username1 || !username2) {
      return res.status(400).json({
        error: "Both username1 and username2 are required",
      });
    }

    if (username1 === username2) {
      return res.status(400).json({
        error: "Please provide two different usernames",
      });
    }

    const [user1Data, user2Data] = await Promise.all([
      getUserData(username1),
      getUserData(username2),
    ]);

    // Return the github profile data for both users
    res.json({
      success: true,
      user1: user1Data,
      user2: user2Data,
    });
  } catch (error) {
    console.error("Comparison Error:", error);
    res.status(error.status || 500).json({
      error: error.error || "An error occurred while comparing profiles",
      details: error.details || error.message,
    });
  }
});

app.post("/api/compare/stream", async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
      return res.status(400).json({
        error: "Both user1 and user2 data are required",
      });
    }

    await streamAIComparison(user1, user2, res);
  } catch (error) {
    console.error("Stream Comparison Error:", error);
    res.write(
      `data: ${JSON.stringify({
        error: error.error || "An error occurred",
      })}\n\n`
    );
    res.end();
  }
});

app.post("/api/roast/stream", async (req, res) => {
  try {
    const { user1, user2, roastType } = req.body;

    if (!user1 || !user2 || !roastType) {
      return res.status(400).json({
        error: "user1, user2, and roastType are required",
      });
    }

    if (!["user1", "user2", "both"].includes(roastType)) {
      return res.status(400).json({
        error: 'roastType must be "user1", "user2", or "both"',
      });
    }

    await streamAIRoast(user1, user2, roastType, res);
  } catch (error) {
    console.error("Stream Roast Error:", error);
    res.write(
      `data: ${JSON.stringify({
        error: error.error || "An error occurred",
      })}\n\n`
    );
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});
