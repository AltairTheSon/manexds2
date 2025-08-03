#!/bin/bash

echo "🔄 Merging changes to main branch..."

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge the feature branch
git merge cursor/create-angular-design-system-from-figma-60f7

# Push to main
git push origin main

echo "✅ Successfully merged to main branch!"