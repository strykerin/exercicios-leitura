import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/reading.js': ['reading.js', 'text/javascript'], '/library.js': ['library.js', 'text/javascript'], '/long-passages.js': ['long-passages.js', 'text/javascript'] };
http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try { res.setHeader('Content-Type', file[1]); res.end(await readFile(new URL(file[0], import.meta.url))); }
  catch { res.writeHead(500); res.end('Unable to load application'); }
}).listen(Number(process.env.PORT) || 5173, '127.0.0.1', () => console.log('Stride is ready at http://localhost:5173'));
