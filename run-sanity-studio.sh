#!/bin/bash

echo "🚀 Starting TechShop Sanity Studio..."
echo "=================================="

# Check if sanity-studio directory exists
if [ ! -d "sanity-studio" ]; then
    echo "❌ Error: sanity-studio directory not found"
    echo "Please run the setup first."
    exit 1
fi

# Navigate to sanity-studio directory
cd sanity-studio

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎯 Starting Sanity Studio on port 3333..."
echo "📝 Your admin panel will be available at: http://localhost:3333"
echo "🛑 Press Ctrl+C to stop the studio"
echo ""

# Start the development server
npm run dev