import React, { useState } from "react";
import "./App.scss";
import ComparisonForm from "./components/ComparisonForm";
import ComparisonResults from "./components/ComparisonResults";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [disabledRoastButtons, setDisabledRoastButtons] = useState([]);

  const handleCompare = async (username1, username2) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setIsStreaming(false);

    try {
      // First, get user data
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username1, username2 }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to compare profiles");
      }

      // Set user data immediately
      setResults({ ...data, comparison: "" });
      setLoading(false);

      // Then stream the AI comparison automatically
      await streamComparison(data.user1, data.user2);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const streamComparison = async (user1, user2) => {
    setIsStreaming(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/compare/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user1, user2 }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to stream comparison");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let displayedText = "";
      let wordQueue = [];
      let isProcessingQueue = false;

      let streamDone = false;

      // Function to process word queue with 20ms delay
      const processWordQueue = () => {
        if (wordQueue.length === 0) {
          isProcessingQueue = false;
          // If stream is done and queue is empty, enable buttons
          if (streamDone) {
            setTimeout(() => {
              setIsStreaming(false);
              setDisabledRoastButtons([]);
            }, 100);
          }
          return;
        }

        isProcessingQueue = true;
        const word = wordQueue.shift();
        displayedText += word;

        // Update UI with displayed text
        setResults((prev) => ({
          ...prev,
          comparison: displayedText,
        }));

        // Continue processing queue
        setTimeout(() => {
          processWordQueue();
        }, 20);
      };

      // Function to add new content to queue
      const addToQueue = (newContent) => {
        // Split by spaces but keep spaces with words
        const words = newContent.split(/(\s+)/);
        wordQueue.push(...words);

        // Start processing if not already processing
        if (!isProcessingQueue) {
          processWordQueue();
        }
      };

      // Function to process a single line
      const processLine = (line) => {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              setError(parsed.error);
              setIsStreaming(false);
              return;
            }

            if (parsed.content) {
              // Add new content to word queue for word-by-word display
              addToQueue(parsed.content);
            }

            if (parsed.done) {
              // Mark stream as done - processWordQueue will handle enabling buttons when queue is empty
              streamDone = true;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        // Process each line
        for (const line of lines) {
          processLine(line);
        }
      }

      // Mark stream as done - processWordQueue will handle enabling buttons when queue is empty
      streamDone = true;

      // Ensure queue processing continues
      if (wordQueue.length > 0 && !isProcessingQueue) {
        processWordQueue();
      }

      // If queue is already empty and not processing, enable buttons immediately
      if (wordQueue.length === 0 && !isProcessingQueue) {
        setTimeout(() => {
          setIsStreaming(false);
          setDisabledRoastButtons([]);
        }, 100);
      }
      // Otherwise, processWordQueue will handle it when queue finishes
    } catch (err) {
      console.error("Streaming error:", err);
      setError("Failed to stream comparison. Please try again.");
      setIsStreaming(false);
      // Re-enable all buttons on error
      setDisabledRoastButtons([]);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setIsStreaming(false);
  };

  const handleRoast = async (roastType) => {
    if (!results || !results.user1 || !results.user2) return;

    setIsStreaming(true);
    setError(null);

    // Clear the current comparison before streaming new roast
    setResults((prev) => ({
      ...prev,
      comparison: "",
    }));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/roast/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user1: results.user1,
            user2: results.user2,
            roastType: roastType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to stream roast");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let displayedText = ""; // Start with empty text
      let wordQueue = [];
      let isProcessingQueue = false;
      let streamDone = false;

      // Function to process word queue with 20ms delay
      const processWordQueue = () => {
        if (wordQueue.length === 0) {
          isProcessingQueue = false;
          // If stream is done and queue is empty, enable buttons
          if (streamDone) {
            setTimeout(() => {
              setIsStreaming(false);
              // Disable only the clicked button, enable others
              setDisabledRoastButtons([roastType]);
            }, 100);
          }
          return;
        }

        isProcessingQueue = true;
        const word = wordQueue.shift();
        displayedText += word;

        // Update results with streaming text
        setResults((prev) => ({
          ...prev,
          comparison: displayedText,
        }));

        // Continue processing queue
        setTimeout(() => {
          processWordQueue();
        }, 20);
      };

      // Function to add new content to queue
      const addToQueue = (newContent) => {
        const words = newContent.split(/(\s+)/);
        wordQueue.push(...words);

        if (!isProcessingQueue) {
          processWordQueue();
        }
      };

      // Function to process a single line
      const processLine = (line) => {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              setError(parsed.error);
              setIsStreaming(false);
              return;
            }

            if (parsed.content) {
              addToQueue(parsed.content);
            }

            if (parsed.done) {
              streamDone = true;
              // Queue will finish processing and then enable buttons
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          processLine(line);
        }
      }

      // Mark stream as done - processWordQueue will handle enabling buttons when queue is empty
      streamDone = true;

      // Ensure queue processing continues
      if (wordQueue.length > 0 && !isProcessingQueue) {
        processWordQueue();
      }

      // If queue is already empty and not processing, enable buttons immediately
      if (wordQueue.length === 0 && !isProcessingQueue) {
        setTimeout(() => {
          setIsStreaming(false);
          // Disable only the clicked button, enable others
          setDisabledRoastButtons([roastType]);
        }, 100);
      }
      // Otherwise, processWordQueue will handle it when queue finishes
    } catch (err) {
      console.error("Roast streaming error:", err);
      setError("Failed to stream roast. Please try again.");
      setIsStreaming(false);
      // Re-enable all buttons on error
      setDisabledRoastButtons([]);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <span className="icon">⚡</span>
            GitHub Profile Comparer
          </h1>
          <p className="app-subtitle">
            Compare GitHub profiles and get AI-powered insights
          </p>
        </header>

        {!results && !loading && <ComparisonForm onCompare={handleCompare} />}

        {loading && <LoadingSpinner />}

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        {results && (
          <ComparisonResults
            results={results}
            onReset={handleReset}
            isStreaming={isStreaming}
            onRoast={handleRoast}
            disabledRoastButtons={disabledRoastButtons}
          />
        )}
      </div>
    </div>
  );
}

export default App;
