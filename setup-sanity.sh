#!/bin/bash

# TechShop Sanity CMS Setup Script

echo "🚀 TechShop Sanity CMS Setup"
echo "=============================="

if [ -z "$1" ]; then
    echo "❌ Error: Project ID required"
    echo "Usage: ./setup-sanity.sh YOUR_PROJECT_ID"
    echo ""
    echo "To get your Project ID:"
    echo "1. Run: npx sanity@latest login"
    echo "2. Run: npx sanity@latest projects create"
    echo "3. Copy the Project ID from the output"
    exit 1
fi

PROJECT_ID=$1
echo "📦 Setting up with Project ID: $PROJECT_ID"

# Update Sanity Studio config files
echo "⚙️  Updating Sanity Studio configuration..."

# Update sanity.config.ts
sed -i "s/your-project-id/$PROJECT_ID/g" sanity-studio/sanity.config.ts

# Update sanity.cli.ts  
sed -i "s/your-project-id/$PROJECT_ID/g" sanity-studio/sanity.cli.ts

# Create environment variables for the main app
echo "🔧 Setting up environment variables..."

# Create .env file
cat > .env << EOF
# Sanity CMS Configuration
VITE_SANITY_PROJECT_ID=$PROJECT_ID
VITE_SANITY_DATASET=production
EOF

echo "✅ Configuration complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Your Sanity Studio is ready at: sanity-studio/"
echo "2. To deploy Studio: cd sanity-studio && npx sanity deploy"
echo "3. Your admin panel will be at: https://YOUR_STUDIO_NAME.sanity.studio"
echo "4. Your app will automatically use Sanity CMS!"
echo ""
echo "🔥 Your e-commerce site now has a professional admin panel!"