#!/bin/bash

# Inventory Management System Setup Script
# This script sets up the development environment for local development

set -e

echo "🚀 Setting up Inventory Management System..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ All prerequisites detected"
echo ""

# Setup Backend
echo "📁 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -q -r requirements.txt
echo "✅ Backend dependencies installed"

cd ..

# Setup Frontend
echo "📁 Setting up Frontend..."
cd frontend
pnpm install -q
cd ..
echo "✅ Frontend dependencies installed"

echo ""
echo "✨ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "Option 1: Run with Docker (recommended)"
echo "  docker-compose up"
echo ""
echo "Option 2: Run manually"
echo "  Terminal 1 (Backend):"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && pnpm dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
