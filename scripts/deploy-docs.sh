#!/bin/bash

# Deploy Documentation to GitHub Pages
# This script builds and deploys the Docusaurus documentation

set -e

echo "🚀 Deploying React Native Dynamic Activities Documentation"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if docs directory exists
if [ ! -d "docs" ]; then
    echo "❌ Error: docs directory not found"
    exit 1
fi

echo "📋 Copying latest documentation guides..."

# Create guides directory if it doesn't exist
mkdir -p docs/docs/guides

# Copy the latest guides from root to docs
cp -f ERROR_HANDLING.md docs/docs/guides/ 2>/dev/null || echo "⚠️  ERROR_HANDLING.md not found"
cp -f DISMISSAL_POLICIES.md docs/docs/guides/ 2>/dev/null || echo "⚠️  DISMISSAL_POLICIES.md not found"  
cp -f CLI_GUIDE.md docs/docs/guides/ 2>/dev/null || echo "⚠️  CLI_GUIDE.md not found"
cp -f ACTIVITYSTYLE_GUIDE.md docs/docs/guides/ActivityStyle.md 2>/dev/null || echo "⚠️  ACTIVITYSTYLE_GUIDE.md not found"

echo "✅ Documentation guides copied"

# Navigate to docs directory
cd docs

echo "📦 Installing documentation dependencies..."
bun install

echo "🔨 Building documentation..."
bun run build

# Check if build succeeded
if [ ! -d "build" ]; then
    echo "❌ Error: Documentation build failed"
    exit 1
fi

echo "✅ Documentation built successfully!"

# If we have the gh CLI tool, we can deploy directly
if command -v gh &> /dev/null; then
    echo "🚀 Deploying to GitHub Pages..."
    
    # Deploy using Docusaurus built-in deployment
    GIT_USER=$(git config user.name) bun run deploy
    
    echo "🎉 Documentation deployed to GitHub Pages!"
    echo "📖 Visit: https://pieczasz.github.io/react-native-dynamic-activities/"
else
    echo "💡 To deploy automatically, install GitHub CLI: https://cli.github.com/"
    echo "📁 Built documentation is in docs/build/"
    echo "🚀 You can manually deploy by:"
    echo "   1. Commit and push changes to main branch"
    echo "   2. GitHub Actions will automatically deploy"
    echo "   3. Or use: cd docs && GIT_USER=\$(git config user.name) bun run deploy"
fi