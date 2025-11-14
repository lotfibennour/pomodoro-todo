const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const AdmZip = require('adm-zip');

const NODE_VERSION = 'v24.11.1';

// Platform-specific Node.js distributions
const PLATFORMS = {
  'win32-x64': {
    file: `node-${NODE_VERSION}-win-x64.zip`,
    binary: 'node.exe',
    folder: `node-${NODE_VERSION}-win-x64`
  },
  'darwin-x64': {
    file: `node-${NODE_VERSION}-darwin-x64.tar.gz`,
    binary: 'bin/node',
    folder: `node-${NODE_VERSION}-darwin-x64`
  },
  'darwin-arm64': {
    file: `node-${NODE_VERSION}-darwin-arm64.tar.gz`,
    binary: 'bin/node',
    folder: `node-${NODE_VERSION}-darwin-arm64`
  },
  'linux-x64': {
    file: `node-${NODE_VERSION}-linux-x64.tar.xz`,
    binary: 'bin/node',
    folder: `node-${NODE_VERSION}-linux-x64`
  },
};

async function downloadFile(url, dest) {
  await fs.ensureDir(path.dirname(dest));
  const file = createWriteStream(dest);
  
  return new Promise((resolve, reject) => {
    console.log(`⬇️  Downloading from: ${url}`);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
      }
      
      const totalBytes = parseInt(response.headers['content-length'], 10);
      let downloadedBytes = 0;
      
      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
        process.stdout.write(`\r📦 Progress: ${progress}%`);
      });
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download complete');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function extractZip(zipPath, destDir) {
  console.log('📦 Extracting ZIP...');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  console.log('✅ Extraction complete');
}

async function downloadNodeBinary() {
  const platform = `${process.platform}-${process.arch}`;
  const platformInfo = PLATFORMS[platform];
  
  if (!platformInfo) {
    throw new Error(`❌ Unsupported platform: ${platform}`);
  }
  
  console.log(`🌐 Downloading Node.js ${NODE_VERSION} for ${platform}...`);
  
  const url = `https://nodejs.org/dist/${NODE_VERSION}/${platformInfo.file}`;
  const srcTauriDir = path.join(__dirname, '..', 'src-tauri');
  const binariesDir = path.join(srcTauriDir, 'binaries');
  const downloadPath = path.join(binariesDir, platformInfo.file);
  const extractDir = path.join(binariesDir, 'node-extract');
  
  // Create binaries directory
  await fs.ensureDir(binariesDir);
  
  // Get the target triple for the binary name
  const getTargetTriple = () => {
    if (process.platform === 'win32') {
      return process.arch === 'x64' ? 'x86_64-pc-windows-msvc' : 'aarch64-pc-windows-msvc';
    } else if (process.platform === 'darwin') {
      return process.arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
    } else if (process.platform === 'linux') {
      return process.arch === 'x64' ? 'x86_64-unknown-linux-gnu' : 'aarch64-unknown-linux-gnu';
    }
    return 'unknown';
  };
  
  const targetTriple = getTargetTriple();
  const binaryExt = process.platform === 'win32' ? '.exe' : '';
  const finalBinaryName = `node-${targetTriple}${binaryExt}`;
  
  // Check if already exists
  const finalBinaryPath = path.join(binariesDir, finalBinaryName);
  
  if (await fs.pathExists(finalBinaryPath)) {
    console.log('✅ Node.js binary already exists at:', finalBinaryPath);
    console.log('ℹ️  Delete it if you want to re-download');
    return;
  }
  
  // Download Node.js
  await downloadFile(url, downloadPath);
  
  // Extract based on platform
  if (process.platform === 'win32') {
    // Windows ZIP extraction
    await extractZip(downloadPath, extractDir);
    
    // Copy node.exe to binaries directory
    const nodeSrc = path.join(extractDir, platformInfo.folder, 'node.exe');
    const nodeDest = path.join(binariesDir, 'node.exe');
    
    if (!(await fs.pathExists(nodeSrc))) {
      throw new Error(`Node.exe not found at ${nodeSrc}`);
    }
    
    await fs.copy(nodeSrc, nodeDest);
    console.log(`✅ Node.exe copied to ${nodeDest}`);
    
    // Clean up
    await fs.remove(extractDir);
    await fs.remove(downloadPath);
    
  } else {
    // macOS/Linux - user needs to extract manually or install tar package
    console.log('⚠️  For macOS/Linux, you need to install the tar package:');
    console.log('   npm install tar');
    console.log(`   Then extract ${downloadPath} manually`);
    console.log(`   And copy the node binary to ${binariesDir}/node`);
  }
  
  console.log(`✅ Node.js binary ready at ${binariesDir}/`);
}

// Run if called directly
if (require.main === module) {
  downloadNodeBinary().catch((err) => {
    console.error('❌ Error downloading Node.js binary:', err);
    process.exit(1);
  });
}

module.exports = { downloadNodeBinary };