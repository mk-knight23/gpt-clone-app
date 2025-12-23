import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

console.log("🛡️  Starting Phase 4: Code Hardening & Import Fixes...");

// Helper to recursively walk directories
function* walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}

// 1. Fix Imports in src/app/
const appDir = path.join(srcDir, 'app');
if (fs.existsSync(appDir)) {
    console.log("🔧 Fixing imports in src/app/...");
    for (const filePath of walkSync(appDir)) {
        if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) continue;

        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;

        // Replace relative imports that are now broken with absolute aliases
        // e.g. import ... from './components/...' -> import ... from '@/components/...'
        content = content.replace(/from\s+['"]\.\/components\//g, "from '@/components/");
        content = content.replace(/from\s+['"]\.\.\/components\//g, "from '@/components/");
        
        content = content.replace(/from\s+['"]\.\/lib\//g, "from '@/lib/");
        content = content.replace(/from\s+['"]\.\.\/lib\//g, "from '@/lib/");
        
        content = content.replace(/from\s+['"]\.\/features\//g, "from '@/features/");
        content = content.replace(/from\s+['"]\.\.\/features\//g, "from '@/features/");

        // Fix CSS import in main.tsx if it was relative
        if (filePath.endsWith('main.tsx')) {
             content = content.replace(/import\s+['"]\.\/index\.css['"]/, "import './index.css'"); // Ensure this stays relative if in same dir
             content = content.replace(/import\s+['"]\.\.\/index\.css['"]/, "import './index.css'");
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`   - Fixed imports in ${path.relative(srcDir, filePath)}`);
        }
    }
}

// 2. Move Stranded Hooks to src/lib/hooks
const oldHooksDir = path.join(srcDir, 'hooks');
const newHooksDir = path.join(srcDir, 'lib', 'hooks');

if (fs.existsSync(oldHooksDir)) {
    console.log("📦 Consolidating stranded hooks...");
    if (!fs.existsSync(newHooksDir)) {
        fs.mkdirSync(newHooksDir, { recursive: true });
    }

    const files = fs.readdirSync(oldHooksDir);
    if (files.length > 0) {
        for (const file of files) {
            const srcPath = path.join(oldHooksDir, file);
            const destPath = path.join(newHooksDir, file);
            fs.renameSync(srcPath, destPath);
            console.log(`   - Moved ${file} to src/lib/hooks/`);
        }
        try {
            fs.rmdirSync(oldHooksDir);
            console.log("   - Removed empty src/hooks directory");
        } catch (e) {
            // Directory might not be empty if hidden files exist
        }
    } else {
        fs.rmdirSync(oldHooksDir);
    }
}

console.log("✅ Phase 4 Hardening Complete.");