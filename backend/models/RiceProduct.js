// backend/models/RiceProduct.js
const mongoose = require('mongoose');

const riceProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  originalPrice: { type: Number, required: true, min: 0 }, // Renamed from price
  discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
  imageUrl: { type: String, required: true, trim: true }, // Will store relative path e.g., /images/basmati.jpeg
  category: { type: String, required: true, trim: true, enum: ['Biryani', 'Idly', 'Dosa', 'General'] },
}, { timestamps: true });

// Optional: Add a virtual for effectivePrice for backend convenience if needed, though frontend will calculate for display.
riceProductSchema.virtual('effectivePrice').get(function() {
  if (this.discountPercentage > 0) {
    return parseFloat((this.originalPrice * (1 - this.discountPercentage / 100)).toFixed(2));
  }
  return this.originalPrice;
});

// Ensure virtuals are included when converting to JSON (e.g., for API responses if you use it)
riceProductSchema.set('toJSON', { virtuals: true });
riceProductSchema.set('toObject', { virtuals: true });


const RiceProduct = mongoose.model('RiceProduct', riceProductSchema);
module.exports = RiceProduct;