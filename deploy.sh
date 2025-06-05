#!/bin/bash

# K3 AR Safety Application Deployment Script
# This script automates the deployment process to GitHub and Netlify

echo "🛡️ K3 AR Safety Application - Deployment Script"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    read -p "Do you want to commit them first? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Adding all changes..."
        git add .
        read -p "Enter commit message: " commit_message
        git commit -m "$commit_message"
    fi
fi

# Build the application
echo "🔨 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to push to GitHub!"
    exit 1
fi

echo "✅ Successfully pushed to GitHub!"

# If Netlify CLI is installed, deploy directly
if command -v netlify &> /dev/null; then
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to Netlify!"
    else
        echo "⚠️  Netlify deployment failed. Please deploy manually."
    fi
else
    echo "📋 Netlify CLI not found. Please deploy manually:"
    echo "   1. Go to https://app.netlify.com/"
    echo "   2. Select your site"
    echo "   3. Drag and drop the 'dist' folder"
    echo "   4. Or set up auto-deploy from GitHub"
fi

echo ""
echo "🎉 Deployment process completed!"
echo "📱 Your app should be available at: https://k3ar-safety.netlify.app"
echo "📊 GitHub repository: https://github.com/nug31/K3-AR"
