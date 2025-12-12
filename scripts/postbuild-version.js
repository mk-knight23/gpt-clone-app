#!/usr/bin/env node

/**
 * CHUTES AI Chat v4 - Post-build Versioning Script
 *
 * This script runs after the build process to:
 * 1. Generate version.json with build metadata
 * 2. Update service worker cache version
 * 3. Create deployment manifest
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Get build information
const getBuildInfo = () => {
  const now = new Date();
  const timestamp = now.toISOString();

  let gitCommit = 'unknown';
  let gitBranch = 'unknown';

  try {
    gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  Could not get git information:', error.message);
  }

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version || '4.0.0';

  return {
    version,
    timestamp,
    gitCommit,
    gitBranch,
    buildId: `${version}-${Date.now()}`,
    nodeVersion: process.version,
    platform: process.platform
  };
};

// Generate version.json
const generateVersionFile = (buildInfo) => {
  const versionData = {
    ...buildInfo,
    app: 'CHUTES AI Chat',
    cacheVersion: `chutes-ai-chat-v${buildInfo.version.replace(/\./g, '-')}`,
    staticCache: `chutes-static-v${buildInfo.version.replace(/\./g, '-')}`,
    dynamicCache: `chutes-dynamic-v${buildInfo.version.replace(/\./g, '-')}`,
    apiCache: `chutes-api-v${buildInfo.version.replace(/\./g, '-')}`
  };

  const versionPath = path.join(DIST_DIR, 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

  console.log('✅ Generated version.json:', versionPath);
  return versionData;
};

// Update service worker with dynamic cache version
const updateServiceWorker = (versionData) => {
  const swPath = path.join(PUBLIC_DIR, 'sw.js');

  if (!fs.existsSync(swPath)) {
    console.warn('⚠️  Service worker not found, skipping update');
    return;
  }

  let swContent = fs.readFileSync(swPath, 'utf8');

  // Update cache version constants
  swContent = swContent.replace(
    /const CACHE_NAME = '[^']*';/,
    `const CACHE_NAME = '${versionData.cacheVersion}';`
  );

  swContent = swContent.replace(
    /const STATIC_CACHE = '[^']*';/,
    `const STATIC_CACHE = '${versionData.staticCache}';`
  );

  swContent = swContent.replace(
    /const DYNAMIC_CACHE = '[^']*';/,
    `const DYNAMIC_CACHE = '${versionData.dynamicCache}';`
  );

  swContent = swContent.replace(
    /const API_CACHE = '[^']*';/,
    `const API_CACHE = '${versionData.apiCache}';`
  );

  fs.writeFileSync(swPath, swContent);

  console.log('✅ Updated service worker cache versions');
};

// Generate deployment manifest
const generateDeploymentManifest = (buildInfo) => {
  const manifest = {
    ...buildInfo,
    deployment: {
      timestamp: buildInfo.timestamp,
      environment: process.env.NODE_ENV || 'production',
      buildCommand: process.env.npm_lifecycle_event || 'build',
      ci: process.env.CI || false
    },
    features: [
      'multi-provider-support',
      'encrypted-storage',
      'rate-limiting',
      'circuit-breaker',
      'offline-mode',
      'pwa-support',
      'model-comparison',
      'streaming-responses'
    ],
    providers: [
      'openrouter',
      'megallm',
      'agentrouter',
      'routeway'
    ],
    security: {
      encryption: 'AES-GCM',
      storage: 'IndexedDB + localStorage',
      rateLimiting: true,
      circuitBreaker: true
    }
  };

  const manifestPath = path.join(DIST_DIR, 'deployment-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('✅ Generated deployment manifest:', manifestPath);
};

// Create .env.example in dist for reference
const copyEnvExample = () => {
  const envExampleSrc = path.join(__dirname, '..', '.env.example');
  const envExampleDest = path.join(DIST_DIR, '.env.example');

  if (fs.existsSync(envExampleSrc)) {
    fs.copyFileSync(envExampleSrc, envExampleDest);
    console.log('✅ Copied .env.example to dist');
  }
};

// Main execution
const main = () => {
  console.log('🚀 CHUTES AI Chat v4 - Post-build versioning started');

  try {
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    const buildInfo = getBuildInfo();
    console.log('📊 Build Info:', buildInfo);

    const versionData = generateVersionFile(buildInfo);
    updateServiceWorker(versionData);
    generateDeploymentManifest(buildInfo);
    copyEnvExample();

    console.log('🎉 Post-build versioning completed successfully!');
    console.log(`📦 Build ID: ${buildInfo.buildId}`);
    console.log(`🏷️  Version: ${buildInfo.version}`);

  } catch (error) {
    console.error('❌ Post-build versioning failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
