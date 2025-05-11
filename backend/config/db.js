const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
      process.exit(1);
    }
    // Log the URI to ensure it's what you expect (and doesn't have typos or old passwords)
    console.log("Attempting to connect to MongoDB Atlas with URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;