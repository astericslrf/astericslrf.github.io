// Node/Express verification example
// Replace YOUR_SECRET_KEY with the secret from Google reCAPTCHA
// Run: npm init -y && npm install express node-fetch body-parser
// Then: node server.js

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || 'YOUR_SECRET_KEY';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // serve index.html from ./public

app.post('/verify', async (req, res) => {
  try {
    const token = req.body['g-recaptcha-response'];
    const target = req.body.target || 'https://astericslrf.github.io';

    if (!token) {
      return res.status(400).send('Missing reCAPTCHA token.');
    }

    // Verify token with Google
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);
    // optionally append remoteip: params.append('remoteip', req.ip);

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params
    });
    const json = await verifyRes.json();

    if (json.success) {
      // Optionally check json.score (v3) or action (v3/invisible) or json.hostname
      // Redirect to the target site on successful verification
      return res.redirect(target);
    } else {
      // Failed verification — show error or log json['error-codes']
      console.error('reCAPTCHA verification failed', json['error-codes']);
      return res.status(403).send('reCAPTCHA verification failed. Please go back and try again.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during reCAPTCHA verification.');
  }
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
