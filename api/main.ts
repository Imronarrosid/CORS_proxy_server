const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.all('*', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing "url" query parameter' });
    }

    const { method, headers, body } = req;
    const response = await axios({
      method,
      url: targetUrl,
      headers: { ...headers, host: new URL(targetUrl).host },
      data: body,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).send(error.response?.data || { error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
});
