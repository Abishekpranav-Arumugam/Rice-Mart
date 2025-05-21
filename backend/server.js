// Load environment variables from .env file at the very beginning
require('dotenv').config(); // IMPORTANT: This must be before any code that uses env variables

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the connectDB function
const orderRoutes = require('./routes/orderRoutes'); // Import your order routes
const stockRoutes = require('./routes/stockRoutes'); // Import your stock routes
const riceProductRoutes = require('./routes/riceProductRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Handle JSON body parsing

// ✅ CORS configuration - allow only specific origins
const allowedOrigins = ['http://localhost:3001', 'https://rice-mart.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api', orderRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api', riceProductRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('RiceShop API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
