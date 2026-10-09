const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder for listing images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Marketplace API is running smoothly' });
});

// Initialize Database & Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
