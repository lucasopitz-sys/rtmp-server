const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
 
const clients = [];
let buffer = Buffer.alloc(0);
 
app.options('/push', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.end();
});
 
app.post('/push', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  req.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    if (buffer.length > 1024 * 1024) buffer = buffer.slice(-512 * 1024);
    clients.forEach(c => { try { c.write(chunk); } catch(e) {} });
  });
  req.on('end', () => res.end('ok'));
});
 
app.get('/stream.mp3', (req, res) => {
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('icy-name', 'PC Audio Stream');
  if (buffer.length > 0) res.write(buffer.slice(-64 * 1024));
  clients.push(res);
  console.log('iPhone verbunden:', clients.length);
  req.on('close', () => {
    const i = clients.indexOf(res);
    if (i !== -1) clients.splice(i, 1);
  });
});
 
app.get('/', (req, res) => res.send('Stream läuft! Benutze /stream.mp3'));
 
app.listen(process.env.PORT || 8080, () => console.log('Server läuft!'));
