const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const clients = [];

app.post('/push', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  req.on('data', chunk => clients.forEach(c => { try { c.write(chunk); } catch(e) {} }));
  req.on('end', () => res.end('ok'));
});

app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  clients.push(res);
  console.log('Client verbunden:', clients.length);
  req.on('close', () => clients.splice(clients.indexOf(res), 1));
});

app.listen(process.env.PORT || 8080, () => console.log('Server läuft!'));
