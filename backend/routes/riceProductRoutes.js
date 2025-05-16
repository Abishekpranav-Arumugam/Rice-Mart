// backend/routes/riceProductRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllRiceProducts,
  getRiceProductById,
  createRiceProduct,
  updateRiceProduct,
  deleteRiceProduct,
} = require('../controllers/riceProductController');
const authMiddleware = require('../middleware/auth'); // You'll need this for admin actions

// Public route to get all products
router.get('/riceproducts', getAllRiceProducts);

// Public route to get a single product (if needed by frontend public pages)
router.get('/riceproducts/:id', getRiceProductById);

// Admin routes - protected by authMiddleware
// Further admin role check should ideally be inside the controller or a specific adminAuth middleware
router.post('/riceproducts', authMiddleware, createRiceProduct);
router.put('/riceproducts/:id', authMiddleware, updateRiceProduct);
router.delete('/riceproducts/:id', authMiddleware, deleteRiceProduct);

module.exports = router;