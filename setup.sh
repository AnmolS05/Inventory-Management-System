#!/bin/bash

echo "🏪 Inventory Management System Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 15+ or use Docker."
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Copy environment files
echo "📝 Setting up environment files..."
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your configuration:"
echo "   - Add your Gemini API key"
echo "   - Configure database connection"
echo "   - Add AWS S3 credentials (optional)"
echo ""
echo "2. Create PostgreSQL database:"
echo "   createdb inventory_db"
echo ""
echo "3. Start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For detailed setup instructions, see README.md"