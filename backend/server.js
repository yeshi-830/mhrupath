
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    database: 'not connected yet',
  });
});

app.listen(PORT, () => {
  console.log(`MhruPath API running at http://localhost:${PORT}`);
});
