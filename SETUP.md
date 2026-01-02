# Quick Setup Guide

## Initial Setup Commands

### 1. Install All Dependencies

```bash
npm run install-all
```

### 2. Create Backend Environment File

Create a file named `.env` in the `backend/` directory with the following content:

```
PORT=5000
GITHUB_TOKEN=your_github_token_here
OPENROUTER_API_KEY=your_openrouter_key_here
NODE_ENV=development
```

**Note**: The `.env` file is already configured with your API keys. If it doesn't exist, create it manually.

### 3. Run the Application

**Development Mode (runs both frontend and backend):**

```bash
npm run dev
```

This will start:

- Backend server: http://localhost:5000
- Frontend app: http://localhost:3000

**Or run separately:**

Backend only:

```bash
npm run server
```

Frontend only:

```bash
npm run client
```

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

- If you get port conflicts, change the PORT in `backend/.env`
- Make sure all dependencies are installed before running
- Check that your API keys are correct in the `.env` file
