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
app.use('/api/influencers', require('./routes/influencerRoutes'));

const {
  campaignRouter,
  applicationRouter,
} = require('./routes/campaignRoutes');

app.use('/api/campaigns', campaignRouter);
app.use('/api/applications', applicationRouter);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
