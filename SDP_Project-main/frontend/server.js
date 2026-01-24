const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Start server
const PORT = 8000;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✓ Frontend Server running on port ${PORT}`);
  console.log(`✓ Open: http://localhost:${PORT}/login.html\n`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Try port ${PORT + 1}`);
  }
  process.exit(1);
});
