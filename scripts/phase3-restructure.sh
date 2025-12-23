#!/bin/bash

# CHUTES AI Chat - Phase 3: Minimalistic Folder Restructure
# Usage: bash scripts/phase3-restructure.sh

set -e

echo "🏗️  Starting Phase 3 Restructure..."

# 1. Create Production-Grade Directory Structure
echo "xB Creating directories..."
mkdir -p src/app/providers
mkdir -p src/app/routes
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/features/chat/components
mkdir -p src/features/chat/hooks
mkdir -p src/features/settings
mkdir -p src/lib
mkdir -p src/types

# 2. Move Entry Points & Global Configs
echo "📦 Moving core application files..."
# Move main entry files to app/
[ -f src/main.tsx ] && mv src/main.tsx src/app/
[ -f src/App.tsx ] && mv src/App.tsx src/app/
[ -f src/index.css ] && mv src/index.css src/app/
[ -f src/vite-env.d.ts ] && mv src/vite-env.d.ts src/app/

# 3. Consolidate Utilities
echo "🛠️  Consolidating utilities..."
# Move utils from root or old lib to new lib
[ -f src/utils.ts ] && mv src/utils.ts src/lib/

# 4. Handle Shadcn UI Components
echo "🎨 Organizing UI components..."
# Ensure shadcn components stay in components/ui
if [ -d src/components/ui ]; then
    # They are already in the right place, just ensuring structure
    echo "   - UI components detected in src/components/ui"
fi

# 5. Cleanup
echo "wm Cleaning up empty directories..."
rmdir src/hooks 2>/dev/null || true
rmdir src/pages 2>/dev/null || true

echo "✅ Restructure complete."
echo "⚠️  ACTION REQUIRED: Update imports in 'src/app/main.tsx' and 'src/app/App.tsx' to match the new structure."
echo "⚠️  RECOMMENDATION: Update 'tsconfig.json' paths to map '@/*' to 'src/*'."