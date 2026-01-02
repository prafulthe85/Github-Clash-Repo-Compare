# GitHub Profile Comparer

A modern web application that compares GitHub profiles and provides AI-powered insights using OpenRouter API. Built with React frontend and Node.js/Express backend.

## Features

- 🔍 Compare two GitHub profiles side-by-side
- 📊 Comprehensive metrics comparison (commits, repos, stars, forks, languages)
- 🤖 AI-powered humanized comparison analysis
- 🎨 Modern, responsive UI with gradient design
- ⚡ Fast and efficient data fetching
- 🛡️ Comprehensive error handling

## Tech Stack

- **Frontend**: React, SCSS
- **Backend**: Node.js, Express.js
- **APIs**: GitHub REST API, OpenRouter API
- **Deployment**: Netlify

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub API token
- OpenRouter API key

## Installation

### 1. Install all dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root package (concurrently for running both servers)
- Backend (Express, Axios, etc.)
- Frontend (React, SCSS, etc.)

### 2. Set up environment variables

The backend `.env` file is already configured with your API keys. For production, make sure to:

- Keep your `.env` file secure and never commit it to version control
- Set environment variables in your Netlify deployment settings

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### Production Build

Build the frontend for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
github-profile-comparer/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables (not committed)
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json      # Frontend dependencies
├── package.json          # Root package.json with scripts
└── README.md
```

## API Endpoints

### `GET /api/health`
Health check endpoint.

### `POST /api/compare`
Compare two GitHub profiles.

**Request Body:**
```json
{
  "username1": "octocat",
  "username2": "defunkt"
}
```

**Response:**
```json
{
  "success": true,
  "user1": { ... },
  "user2": { ... },
  "comparison": "AI-generated comparison text..."
}
```

## Deployment to Netlify

### Option 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the frontend:
```bash
cd frontend && npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=frontend/build
```

### Option 2: Netlify Dashboard

1. Connect your repository to Netlify
2. Set build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
3. Add environment variables:
   - `GITHUB_TOKEN`: Your GitHub API token
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `PORT`: 5000 (or your preferred port)

### Backend Deployment

For the backend, you'll need to deploy it separately (e.g., Heroku, Railway, or Render) and update the frontend API proxy configuration.

## Error Handling

The application handles various error scenarios:

- ❌ Invalid GitHub usernames (404)
- ⚠️ GitHub API rate limits (403)
- 🔐 Authentication errors (401)
- 🌐 Network errors
- 🤖 AI API failures

All errors are displayed to users in a user-friendly manner.

## Customization

### Colors

The app uses a modern gradient color scheme. To customize, edit:
- `frontend/src/App.scss` - Main gradient background
- `frontend/src/components/*.scss` - Component-specific styles

### AI Model

To change the AI model, edit `backend/server.js`:
```javascript
model: 'openai/gpt-4-turbo' // Change to your preferred model
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Support

For issues or questions, please open an issue on the repository.

