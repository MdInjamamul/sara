const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const heroConfigRoutes = require('./routes/heroConfigRoutes');
const trendingConfigRoutes = require('./routes/trendingConfigRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client build
app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/hero-config', heroConfigRoutes);
app.use('/api/trending-config', trendingConfigRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', userManagementRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SARA API is running' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
