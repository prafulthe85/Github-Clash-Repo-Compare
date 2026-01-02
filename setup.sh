#!/bin/bash

echo "🚀 Setting up GitHub Profile Comparer..."

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOF
PORT=5000
GITHUB_TOKEN=your_github_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
NODE_ENV=development
EOF
    echo "✅ Backend .env file created"
else
    echo "ℹ️  Backend .env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "This will start both frontend (http://localhost:3000) and backend (http://localhost:5000)"

