require('dotenv').config({ quiet: true });
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── CORS ───────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HEALTH CHECK ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'MicroConnect API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── ROUTES ─────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/brands',       require('./routes/brandRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/influencers',  require('./routes/influencerRoutes'));
app.use('/api/campaigns',    require('./routes/campaignRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/reviews', require('./routes/brandReviewRoutes'));

// ── ERROR MIDDLEWARE (must be after all routes) ────────
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// ── START SERVER ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
  });
};

startServer();
