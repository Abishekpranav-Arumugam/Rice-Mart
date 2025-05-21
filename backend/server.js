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

// --- CORS Configuration ---
// Define your allowed origins
const allowedOrigins = [
    'http://localhost:3001',        // Your local React development server
    'https://rice-mart.vercel.app', // Your deployed Vercel frontend
    // Add any other frontend origins if necessary
];

const corsOptions = {
    origin: function (origin, callback) {
        // Log the incoming origin for debugging (check your Render logs)
        console.log('Request Origin:', origin);

        // Allow requests with no origin (like mobile apps, curl, Postman)
        // or if origin is in the allowedOrigins list
        if (!origin || allowedOrigins.includes(origin)) {
            if (origin) {
                console.log(`CORS: Allowed origin: ${origin}`);
            } else {
                console.log('CORS: Allowed (no origin)');
            }
            callback(null, true);
        } else {
            console.error(`CORS: Blocked origin: ${origin}. Not in allowed list: ${allowedOrigins.join(', ')}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly include OPTIONS for preflight, and PATCH if you use it
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Common headers; X-Requested-With can be useful
    credentials: true, // IMPORTANT: Set this to true if your frontend sends cookies or Authorization headers.
                       // Your frontend fetch/axios requests might also need `credentials: 'include'`.
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204 for OPTIONS requests
};

app.use(cors(corsOptions));
// --- End CORS Configuration ---


// API Routes
// Your routes are:
// /api/... (from orderRoutes, e.g., /api/orders)
// /api/stocks/... (from stockRoutes)
// /api/... (from riceProductRoutes, e.g., /api/riceproducts)
app.use('/api', orderRoutes);
app.use('/api', riceProductRoutes); // Make sure this doesn't have conflicting paths with orderRoutes if both use /api/
app.use('/api/stocks', stockRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('RiceShop API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // This localhost message is mainly for local development.
  // On Render, it will be accessible via its public URL (rice-mart2.onrender.com).
  if (process.env.NODE_ENV !== 'production') {
      console.log(`Development server accessible at http://localhost:${PORT}`);
  }
});
