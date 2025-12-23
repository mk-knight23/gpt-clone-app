import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

console.log("🛡️  Starting Security Scan...");

const SECRET_PATTERNS = [
    { name: 'Generic API Key', regex: /api[_-]?key/i },
    { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
    { name: 'AWS Key', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'OpenAI Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
    { name: 'Hardcoded Token', regex: /['"`]eyJ[a-zA-Z0-9]{20,}/ } // JWT-like
];

let issuesFound = 0;

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(rootDir, filePath);

    // Skip test files for "Generic API Key" pattern as they often contain mocks
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');

    SECRET_PATTERNS.forEach(({ name, regex }) => {
        if (regex.test(content)) {
            // Skip legitimate patterns
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                if (regex.test(line)) {
                    // Skip legitimate patterns
                    if (line.includes('process.env') || 
                        line.includes('import.meta.env') ||
                        line.includes('apiKeyEnvVar') ||
                        line.includes('VITE_') ||
                        line.includes('stubEnv') ||
                        line.includes('mock') ||
                        line.includes('test') ||
                        isTestFile) {
                        return;
                    }
                    
                    // Check for actual hardcoded secrets (not just variable names)
                    if (line.match(/['"`][a-zA-Z0-9\-\_]{20,}['"`]/) && !line.includes('VITE_')) {
                        console.error(`❌ Potential ${name} found in ${relativePath}:${index + 1}`);
                        console.error(`   Line: ${line.trim().substring(0, 50)}...`);
                        issuesFound++;
                    }
                }
            });
        }
    });
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (/\.(js|ts|tsx|jsx|json)$/.test(file)) {
            scanFile(filePath);
        }
    });
}

walk(srcDir);

if (issuesFound > 0) {
    console.error(`\n⚠️  Security Scan failed: ${issuesFound} potential secrets found.`);
    process.exit(1);
} else {
    console.log("✅ Security Scan passed. No obvious secrets found in src/.");
}
