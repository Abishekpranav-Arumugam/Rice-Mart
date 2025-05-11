// Load environment variables from .env file at the very beginning
require('dotenv').config(); // IMPORTANT: This must be before any code that uses env variables

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the connectDB function
const orderRoutes = require('./routes/orderRoutes'); // Import your order routes
const stockRoutes = require('./routes/stockRoutes'); // Import your stock routes

// Initialize Express app
const app = express();

// Connect to MongoDB (Atlas)
// Call connectDB to establish the connection
connectDB();

// Middleware
app.use(express.json()); // Middleware to handle JSON body parsing

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from localhost:3000 (your frontend)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api', orderRoutes);         // Assuming orderRoutes handles things like /api/orders
app.use('/api/stocks', stockRoutes);

// Define a simple root route for testing if the server is up
app.get('/', (req, res) => {
  res.send('RiceShop API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});