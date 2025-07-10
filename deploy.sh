#!/bin/bash

# RealEstateHub Deployment Script
echo "🚀 Deploying RealEstateHub to GitHub Pages..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from the real-estate-website directory"
    exit 1
fi

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy RealEstateHub website"

# Get repository URL from user
echo "🔗 Please enter your GitHub repository URL (e.g., https://github.com/username/real-estate-website):"
read repo_url

# Add remote if not exists
if ! git remote get-url origin &> /dev/null; then
    git remote add origin "$repo_url"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Deployment complete!"
echo "📝 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click Settings > Pages"
echo "3. Select 'Deploy from a branch'"
echo "4. Choose 'main' branch"
echo "5. Your site will be available at: https://YOUR_USERNAME.github.io/real-estate-website" 