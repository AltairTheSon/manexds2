#!/bin/bash

echo "🚀 Quick merge to main branch..."

# Create all necessary directories
mkdir -p src/app/components/{dashboard,figma-connection,component-generator,design-tokens,stats,sync}
mkdir -p src/app/services
mkdir -p src/app/models
mkdir -p src/app/interfaces
mkdir -p src/environments

# Copy all files from feature branch
git show cursor/create-angular-design-system-from-figma-60f7:package.json > package.json
git show cursor/create-angular-design-system-from-figma-60f7:angular.json > angular.json
git show cursor/create-angular-design-system-from-figma-60f7:tsconfig.json > tsconfig.json
git show cursor/create-angular-design-system-from-figma-60f7:tsconfig.app.json > tsconfig.app.json
git show cursor/create-angular-design-system-from-figma-60f7:tsconfig.spec.json > tsconfig.spec.json
git show cursor/create-angular-design-system-from-figma-60f7:netlify.toml > netlify.toml
git show cursor/create-angular-design-system-from-figma-60f7:.gitignore > .gitignore
git show cursor/create-angular-design-system-from-figma-60f7:README.md > README.md

# Copy source files
git show cursor/create-angular-design-system-from-figma-60f7:src/main.ts > src/main.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/index.html > src/index.html
git show cursor/create-angular-design-system-from-figma-60f7:src/styles.scss > src/styles.scss

# Copy environment files
git show cursor/create-angular-design-system-from-figma-60f7:src/environments/environment.ts > src/environments/environment.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/environments/environment.prod.ts > src/environments/environment.prod.ts

# Copy app files
git show cursor/create-angular-design-system-from-figma-60f7:src/app/app.component.ts > src/app/app.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/app.module.ts > src/app/app.module.ts

# Copy components
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/dashboard/dashboard.component.ts > src/app/components/dashboard/dashboard.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/figma-connection/figma-connection.component.ts > src/app/components/figma-connection/figma-connection.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/component-generator/component-generator.component.ts > src/app/components/component-generator/component-generator.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/design-tokens/design-tokens.component.ts > src/app/components/design-tokens/design-tokens.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/stats/stats.component.ts > src/app/components/stats/stats.component.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/components/sync/sync.component.ts > src/app/components/sync/sync.component.ts

# Copy services
git show cursor/create-angular-design-system-from-figma-60f7:src/app/services/figma.service.ts > src/app/services/figma.service.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/services/design-system.service.ts > src/app/services/design-system.service.ts
git show cursor/create-angular-design-system-from-figma-60f7:src/app/services/code-generator.service.ts > src/app/services/code-generator.service.ts

# Copy interfaces
git show cursor/create-angular-design-system-from-figma-60f7:src/app/interfaces/figma.interface.ts > src/app/interfaces/figma.interface.ts

echo "✅ Files copied successfully!"
echo "📝 Now run: git add . && git commit -m 'Merge Figma Design System Generator to main' && git push origin main"