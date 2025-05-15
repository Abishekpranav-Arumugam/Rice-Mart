// backend/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock'); // Import the Stock model
const authMiddleware = require('../middleware/auth'); // Assuming you want to protect this for admins

// GET all stock items
router.get('/', async (req, res) => {
  try {
    console.log("BACKEND GET /api/stocks: Attempting to fetch all stock items.");
    const stocks = await Stock.find({}).sort({ name: 1 });
    console.log(`BACKEND GET /api/stocks: Found ${stocks.length} stock items.`);
    res.status(200).json(stocks);
  } catch (error) {
    console.error("BACKEND GET /api/stocks - Error fetching stocks:", error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch stocks.' });
  }
});

// PUT route to update stock AFTER a successful order (deduct stock)
router.put('/update-batch', async (req, res) => {
  const itemsToUpdate = req.body;
  if (!Array.isArray(itemsToUpdate) || itemsToUpdate.length === 0) {
    return res.status(400).json({ message: 'Invalid update data provided.' });
  }
  try {
    const operations = itemsToUpdate.map(item => ({
      updateOne: {
        filter: { name: item.name },
        update: { $inc: { available: -item.quantitySold } }
      }
    }));
    const result = await Stock.bulkWrite(operations);
    console.log("Stock update batch result:", result);
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `${result.modifiedCount} stock items updated successfully.` });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: "Stock items matched but no changes made." });
    } else {
      res.status(404).json({ message: 'No matching stock items found to update.' });
    }
  } catch (error) {
    console.error('Error updating stock in batch:', error);
    res.status(500).json({ message: 'Failed to update stock levels.' });
  }
});


// ▼▼▼ NEW ENDPOINT TO POPULATE STOCK MANUALLY ▼▼▼
router.put('/populate', authMiddleware, async (req, res) => { // Added authMiddleware for protection
  const { name, quantity } = req.body;

  console.log(`BACKEND PUT /api/stocks/populate: Request to populate ${name} with ${quantity}kg`);

  if (!name || typeof quantity !== 'number' || quantity <= 0) {
    console.warn(`BACKEND PUT /api/stocks/populate: Invalid data received. Name: ${name}, Quantity: ${quantity}`);
    return res.status(400).json({ message: 'Invalid input: Rice name and a positive quantity are required.' });
  }

  try {
    // Check if admin (example, you might have a more robust role check)
    // For now, authMiddleware just verifies a valid user.
    // You might want to extend authMiddleware or add another one to check `req.user.admin === true` if you set such a custom claim in Firebase.
    // For this example, any authenticated user can call this, which might not be desired for a production admin function.
    // Let's assume for now `authMiddleware` is enough or you'll enhance it.

    const stockItem = await Stock.findOne({ name: name });

    if (stockItem) {
      // Item exists, increment 'bought' and 'available'
      stockItem.bought += quantity;
      stockItem.available += quantity;
      await stockItem.save();
      console.log(`BACKEND PUT /api/stocks/populate: Successfully updated stock for ${name}. New bought: ${stockItem.bought}, New available: ${stockItem.available}`);
      res.status(200).json({
        message: `Successfully added ${quantity}kg to ${name}. Total bought: ${stockItem.bought}, Total available: ${stockItem.available}.`,
        stockItem,
      });
    } else {
      // Item does not exist, create it
      // This behavior (upsert) is consistent with how you might want to manage products.
      // If a product exists in productsData but not in Stock collection, admin can initialize it.
      const newStockItem = new Stock({
        name: name,
        bought: quantity,
        available: quantity,
      });
      await newStockItem.save();
      console.log(`BACKEND PUT /api/stocks/populate: Successfully created and populated new stock for ${name}. Bought: ${newStockItem.bought}, Available: ${newStockItem.available}`);
      res.status(201).json({
        message: `New stock item ${name} created and populated with ${quantity}kg.`,
        stockItem: newStockItem,
      });
    }
  } catch (error) {
    console.error(`BACKEND PUT /api/stocks/populate - Error populating stock for ${name}:`, error.message, error.stack);
    res.status(500).json({ message: 'Failed to populate stock.', error: error.message });
  }
});
// ▲▲▲ END OF NEW ENDPOINT ▲▲▲


module.exports = router;