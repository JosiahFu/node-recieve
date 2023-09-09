#!/usr/bin/env node

import http from 'http';
import formidable from 'formidable';
import fs from 'fs';

const server = http.createServer((req, res) => {
  const pathname = req.url ?? '';
  
  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>File Upload</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta charset=utf-8 />
        </head>
        <body>
          <h1>File Upload</h1>
          <form action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="file">
            <input type="submit" value="Upload">
          </form>
        </body>
      </html>
    `);
  } else if (req.method === 'POST' && pathname === '/upload') {
    const form = formidable();

    form.parse(req, (err, fields, files) => {
      const oldFilename = files.file?.[0].filepath!;
      const originalFilename = files.file?.[0].originalFilename ?? 'upload';

      let newFilename = originalFilename;
      if (fs.existsSync(newFilename)) {
        let i = 0;
        do {
          i++; // Start at 1
          newFilename = originalFilename + '_' + i;
        } while (fs.existsSync(newFilename));
      }

      fs.copyFileSync(oldFilename, newFilename);
      fs.rmSync(oldFilename);

      if (originalFilename === newFilename) {
        console.log(`Recieved file ${originalFilename}`);
      } else {
        console.log(`Recieved file ${originalFilename} as ${newFilename}`);
      }
      res.end('File successfully uploaded');
    });
} else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
