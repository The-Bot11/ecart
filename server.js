import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// CORS للسماح بالطلبات من Edge Functions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Bamboo Proxy is running', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Bamboo API (supports multiple domains)
app.all('/bamboo/*', async (req, res) => {
  try {
    const bambooPath = req.params[0];
    // Support multiple Bamboo domains via query parameter
    const domain = req.query.domain || 'api.bamboocardportal.com';
    const bambooUrl = `https://${domain}/${bambooPath}`;

    console.log(`[${new Date().toISOString()}] Proxying: ${req.method} ${bambooUrl}`);

    // بناء الـ headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // نقل الـ Authorization header لو موجود
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // بناء الـ request options
    const options = {
      method: req.method,
      headers: headers,
    };

    // إضافة الـ body للطلبات غير GET
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    // إرسال الطلب لـ Bamboo
    const response = await fetch(bambooUrl, options);
    const data = await response.text();

    // إرجاع الرد
    res.status(response.status)
       .header('Content-Type', response.headers.get('content-type'))
       .send(data);

    console.log(`[${new Date().toISOString()}] Response: ${response.status}`);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bamboo Proxy running on port ${PORT}`);
  console.log(`📍 Forward requests to: /bamboo/{endpoint}`);
});
