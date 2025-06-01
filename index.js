const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  if (pathname === '/create' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const { name, content } = JSON.parse(body);
        if (!name) {
          res.writeHead(400);
          return res.end('Missing "name" in request body.');
        }

        const filePath = path.join(__dirname, name);
        fs.writeFile(filePath, content || '', (err) => {
          if (err) {
            res.writeHead(500);
            res.end('Error creating file.');
          } else {
            res.writeHead(200);
            res.end(`File "${name}" created successfully.`);
          }
        });
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON in request body.');
      }
    });
  }

  else if (pathname === '/read' && req.method === 'GET') {
    if (!query.name) {
      res.writeHead(400);
      return res.end('Missing "name" query parameter.');
    }

    const filePath = path.join(__dirname, query.name);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found.');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
      }
    });
  }

  else if (pathname === '/delete' && req.method === 'GET') {
    if (!query.name) {
      res.writeHead(400);
      return res.end('Missing "name" query parameter.');
    }

    const filePath = path.join(__dirname, query.name);
    fs.unlink(filePath, (err) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found or error deleting file.');
      } else {
        res.writeHead(200);
        res.end(`File "${query.name}" deleted successfully.`);
      }
    });
  }

  else {
    res.writeHead(404);
    res.end('Route not found.');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
