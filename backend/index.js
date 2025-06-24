// filepath: backend/index.js
require('dotenv').config(); // Load env variables
if (!process.env.JWT_SECRET){
  throw new Error('FATAL ERROR: JWT_SECRET is not set in the environment variables(.env file)');
}

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Load from .env
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

const cors= require('cors');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(rateLimit({
  windowsMs:15*60*1000,
  max:100
}));

//Global error handler
app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(500).json({message:'Something went wrong!'});
});

const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const nlpRoutes = require('./routes/nlp');
app.use('/api/nlp', nlpRoutes);

const jwt = require('jsonwebtoken');

//Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
