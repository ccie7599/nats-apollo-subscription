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

// Define the route
app.get('/app', (req, res) => {
  const topic = req.query.topic;

  if (!topic) {
    return res.status(400).send('Bad Request: topic query parameter is required'
);
  }

  const filePath = path.join('/tmp/db', `test.${topic}`);

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

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
