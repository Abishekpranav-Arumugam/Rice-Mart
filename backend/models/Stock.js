// backend/models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Rice name should be unique
  bought: { type: Number, required: true }, // Initial total quantity
  available: { type: Number, required: true }, // Current available quantity
});

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;