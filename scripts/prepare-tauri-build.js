const fs = require('fs-extra');
const path = require('path');

async function prepareTauriBuild() {
  console.log('🔨 Preparing Tauri build...');
  
  const srcTauriDir = path.join(__dirname, '..', 'src-tauri');
  const nextDir = path.join(__dirname, '..');
  
  // Paths
  const standalonePath = path.join(nextDir, '.next', 'standalone');
  const staticPath = path.join(nextDir, '.next', 'static');
  const publicPath = path.join(nextDir, 'public');
  
  const tauriResourcesDir = path.join(srcTauriDir, 'resources');
  const tauriNextAppDir = path.join(tauriResourcesDir, 'nextjs-app');
  
  // Clean up old resources
  console.log('🧹 Cleaning old resources...');
  await fs.remove(tauriResourcesDir);
  await fs.ensureDir(tauriNextAppDir);
  
  // Copy standalone build
  console.log('📦 Copying standalone build...');
  if (await fs.pathExists(standalonePath)) {
    await fs.copy(standalonePath, tauriNextAppDir, {
      filter: (src) => {
        // Exclude cache and unnecessary files
        return !src.includes('cache') && !src.includes('.git');
      }
    });
  } else {
    throw new Error('Standalone build not found. Run "npm run build" first.');
  }
  
  // Copy static files
  console.log('📁 Copying static files...');
  if (await fs.pathExists(staticPath)) {
    const destStatic = path.join(tauriNextAppDir, '.next', 'static');
    await fs.ensureDir(destStatic);
    await fs.copy(staticPath, destStatic);
  }
  
  // Copy public folder
  console.log('🖼️  Copying public folder...');
  if (await fs.pathExists(publicPath)) {
    const destPublic = path.join(tauriNextAppDir, 'public');
    await fs.copy(publicPath, destPublic);
  }
  
  // Copy server.js
  console.log('🚀 Copying server.js...');
  const serverSrc = path.join(nextDir, 'server.js');
  const serverDest = path.join(tauriNextAppDir, 'server.js');
  if (await fs.pathExists(serverSrc)) {
    await fs.copy(serverSrc, serverDest);
  } else {
    throw new Error('server.js not found in project root');
  }
  
  console.log('✅ Tauri build preparation complete!');
  console.log(`📍 Resources location: ${tauriResourcesDir}`);
}

prepareTauriBuild().catch((err) => {
  console.error('❌ Error preparing build:', err);
  process.exit(1);
});