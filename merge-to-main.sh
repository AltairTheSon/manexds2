#!/bin/bash

echo "🔄 Merging changes to main branch..."

# Exit on any error
set -e

# Switch to main branch
echo "📂 Switching to main branch..."
git checkout main

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# Merge the feature branch
echo "🔗 Merging cursor branch..."
git merge cursor/create-angular-design-system-from-figma-60f7

# Push to main
echo "🚀 Pushing to main..."
git push origin main

echo "✅ Successfully merged to main branch!"