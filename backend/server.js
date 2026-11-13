
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
  ...configuredOrigins,
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'MhruPath Backend API is running!',
    status: 'success',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'MhruPath',
    persistence: 'browser-local',
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status === 413 ? 413 : error.message === 'Origin is not allowed by CORS.' ? 403 : 400;
  res.status(status).json({
    status: 'error',
    message: status === 413 ? 'Request body is too large.' : status === 403 ? 'Origin is not allowed.' : 'Invalid request.',
  });
});

app.listen(PORT, () => {
  console.log(`MhruPath API running at http://localhost:${PORT}`);
});
