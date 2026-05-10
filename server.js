const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const clients = [];
let buffer = Buffer.alloc(0);

app.use('/stream.mp3', (req, res, next) => {
  if (req.method === 'PUT' || req.method === 'SOURCE') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    req.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > 1024 * 1024) buffer = buffer.slice(-512 * 1024);
      clients.forEach(c => { try { c.write(chunk); } catch(e) {} });
    });
    req.on('end', () => res.end('ok'));
    req.on('close', () => console.log('OBS getrennt'));
    console.log('OBS verbunden!');
  } else if (req.method === 'GET') {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (buffer.length > 0) res.write(buffer.slice(-64 * 1024));
    clients.push(res);
    console.log('iPhone verbunden:', clients.length);
    req.on('close', () => {
      const i = clients.indexOf(res);
      if (i !== -1) clients.splice(i, 1);
    });
  } else next();
});

app.get('/', (req, res) => res.send('läuft!'));
app.listen(process.env.PORT || 8080, () => console.log('Server läuft!'));
