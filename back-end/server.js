require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MicroConnect API is running ');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
<<<<<<< HEAD
app.use('/api/admin',  require('./routes/adminRoutes'));
console.log('✅ Admin routes loaded');
=======
app.use('/api/influencers', require('./routes/influencerRoutes'));
>>>>>>> d131bd1169f6768836327d957f1e8570808eaf1f

const {
  campaignRouter,
} = require('./routes/campaignRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

app.use('/api/campaigns', campaignRouter);
app.use('/api/applications', applicationRoutes);

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
