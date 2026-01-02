# 🚀 Quick Start Guide

## Initial Setup (One-Time)

### Option 1: Using Setup Script (Recommended)
```bash
./setup.sh
```

### Option 2: Manual Setup
```bash
# 1. Install all dependencies
npm run install-all

# 2. Create backend/.env file (copy from backend/.env.example and add your keys)
# The file should contain:
# PORT=5000
# GITHUB_TOKEN=your_github_token
# OPENROUTER_API_KEY=your_openrouter_key
# NODE_ENV=development
```

## Running the Application

### Development Mode (Frontend + Backend)
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run install-all` | Install all dependencies (root, backend, frontend) |
| `npm run dev` | Run both frontend and backend in development mode |
| `npm run server` | Run backend server only |
| `npm run client` | Run frontend development server only |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server |

## First Time Setup Checklist

- [ ] Run `npm run install-all` or `./setup.sh`
- [ ] Create `backend/.env` file with your API keys
- [ ] Run `npm run dev` to start the application
- [ ] Open http://localhost:3000 in your browser
- [ ] Test by comparing two GitHub usernames

## Troubleshooting

**Port already in use?**
- Change `PORT` in `backend/.env` to a different port (e.g., 5001)
- Update `proxy` in `frontend/package.json` to match

**Module not found errors?**
- Make sure you ran `npm run install-all`
- Delete `node_modules` folders and reinstall

**API errors?**
- Verify your API keys in `backend/.env`
- Check that GitHub token has proper permissions
- Ensure OpenRouter API key is valid

## Next Steps

1. Test the application locally
2. Deploy backend to a hosting service (Heroku, Railway, Render)
3. Deploy frontend to Netlify
4. Update `netlify.toml` with your backend URL

