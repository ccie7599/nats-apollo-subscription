const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const app = express();
const PORT = 8443;

// Load TLS certificates
const privateKey = fs.readFileSync('/etc/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Define the /get route
app.get('/get', (req, res) => {
  const topic = req.query.topic;

  if (!topic) {
    return res.status(400).send('Bad Request: topic query parameter is required');
  }

  const filePath = path.join('/tmp/db', `${topic}`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Not Found: topic does not exist');
      } else {
        return res.status(500).send('Internal Server Error');
      }
    }

    res.send(data);
  });
});

// Define the /getlegacy route (duplicate of /get)
app.get('/getlegacy', (req, res) => {
  const topic = req.query.topic;

  if (!topic) {
    return res.status(400).send('Bad Request: topic query parameter is required');
  }

  const filePath = path.join('/tmp/db', `${topic}`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Not Found: topic does not exist');
      } else {
        return res.status(500).send('Internal Server Error');
      }
    }

    res.send(data);
  });
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);
// Set the keep-alive timeout to 300 seconds (300000 milliseconds)
httpsServer.keepAliveTimeout = 300000;

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
