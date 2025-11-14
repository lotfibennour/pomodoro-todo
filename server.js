const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Get port from command line or default to 3000
const port = parseInt(process.argv[2] || '3000', 10);
const dev = false; // Always production mode in Tauri

// Point to the standalone build
const app = next({ 
  dev, 
  dir: __dirname,
  conf: {
    distDir: '.next',
  }
});

const handle = app.getRequestHandler();

console.log('Starting Next.js server...');

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Server ready on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });