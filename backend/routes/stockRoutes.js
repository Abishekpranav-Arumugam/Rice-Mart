// backend/routes/stockRoutes.js (New File or add to existing routes)
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock'); // Import the Stock model
// const authMiddleware = require('../middleware/auth'); // Optional: Add auth for admin access

// GET all stock items
// Potentially protect with authMiddleware and check for admin role
router.get('/', async (req, res) => {
  try {
    console.log("BACKEND GET /api/stocks: Attempting to fetch all stock items.");
    const stocks = await Stock.find({}).sort({ name: 1 }); // Sort by name
    console.log(`BACKEND GET /api/stocks: Found ${stocks.length} stock items.`);
    res.status(200).json(stocks);
  } catch (error) {
    console.error("BACKEND GET /api/stocks - Error fetching stocks:", error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch stocks.' });
  }
});

// This PUT route is crucial for your Product.js to update stock AFTER a successful order
// You will call this from your `Product.js` or backend order creation logic.
router.put('/update-batch', async (req, res) => {
  // Expects req.body to be an array of items to update:
  // [{ name: "Basmati Rice", quantitySold: 2 }, { name: "Jasmine Rice", quantitySold: 1 }]
  const itemsToUpdate = req.body;

  if (!Array.isArray(itemsToUpdate) || itemsToUpdate.length === 0) {
    return res.status(400).json({ message: 'Invalid update data provided.' });
  }

  try {
    const operations = itemsToUpdate.map(item => ({
      updateOne: {
        filter: { name: item.name },
        update: { $inc: { available: -item.quantitySold } } // Decrement available stock
      }
    }));

    const result = await Stock.bulkWrite(operations);
    console.log("Stock update batch result:", result);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `${result.modifiedCount} stock items updated successfully.` });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      // This could happen if quantitySold was 0, or an item matched but didn't need updating (already 0).
      res.status(200).json({ message: "Stock items matched but no changes made (e.g., quantity sold was 0 or stock already at 0)." });
    } else {
      res.status(404).json({ message: 'No matching stock items found to update. Ensure product names are correct.' });
    }

  } catch (error) {
    console.error('Error updating stock in batch:', error);
    res.status(500).json({ message: 'Failed to update stock levels.' });
  }
});


module.exports = router;