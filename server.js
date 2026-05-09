const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const clients = [];

app.options('/push', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.end();
});

app.post('/push', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  req.on('data', chunk => {
    clients.forEach(c => { try { c.write(chunk); } catch(e) {} });
  });
  req.on('end', () => res.end('ok'));
});

app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'audio/webm;codecs=opus');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  clients.push(res);
  console.log('Client verbunden:', clients.length);
  req.on('close', () => {
    const i = clients.indexOf(res);
    if (i !== -1) clients.splice(i, 1);
  });
});

app.listen(process.env.PORT || 8080, () => console.log('Server läuft!'));
