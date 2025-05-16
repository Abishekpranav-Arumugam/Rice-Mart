// backend/controllers/riceProductController.js
const RiceProduct = require('../models/RiceProduct');

// Get all rice products
const getAllRiceProducts = async (req, res) => {
  try {
    const products = await RiceProduct.find({}).sort({ category: 1, name: 1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching rice products:", error);
    res.status(500).json({ message: 'Failed to fetch rice products', error: error.message });
  }
};

// Get a single rice product by ID
const getRiceProductById = async (req, res) => {
  try {
    const product = await RiceProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Rice product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching rice product by ID:", error);
    res.status(500).json({ message: 'Failed to fetch rice product', error: error.message });
  }
};

// Create a new rice product (Admin only)
const createRiceProduct = async (req, res) => {
  try {
    const { name, description, originalPrice, discountPercentage, imageUrl, category } = req.body;
    if (!name || !description || originalPrice == null || !imageUrl || !category) {
      return res.status(400).json({ message: 'All fields are required: name, description, originalPrice, imageUrl, category. Discount is optional.' });
    }
    if (parseFloat(originalPrice) <= 0) {
        return res.status(400).json({ message: "Original price must be positive." });
    }
    const disc = discountPercentage != null ? parseFloat(discountPercentage) : 0;
    if (disc < 0 || disc > 100) {
        return res.status(400).json({ message: "Discount percentage must be between 0 and 100."});
    }


    const existingProduct = await RiceProduct.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this name already exists.' });
    }

    const newProduct = new RiceProduct({
        name,
        description,
        originalPrice: parseFloat(originalPrice),
        discountPercentage: disc,
        imageUrl,
        category
    });
    await newProduct.save();
    res.status(201).json({ message: 'Rice product created successfully', product: newProduct });
  } catch (error) {
    console.error("Error creating rice product:", error);
    res.status(500).json({ message: 'Failed to create rice product', error: error.message });
  }
};

// Update an existing rice product (Admin only)
const updateRiceProduct = async (req, res) => {
  try {
    const { name, description, originalPrice, discountPercentage, imageUrl, category } = req.body;
     // Prepare update object selectively
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (originalPrice != null) {
        const op = parseFloat(originalPrice);
        if (op <= 0) return res.status(400).json({ message: "Original price must be positive."});
        updateData.originalPrice = op;
    }
    if (discountPercentage != null) {
        const disc = parseFloat(discountPercentage);
        if (disc < 0 || disc > 100) return res.status(400).json({ message: "Discount must be between 0-100."});
        updateData.discountPercentage = disc;
    } else { // If discountPercentage is explicitly sent as null or undefined, treat as 0
        updateData.discountPercentage = 0;
    }
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (category) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }


    // Check for name conflict if name is being changed
    if (name) {
        const productToUpdate = await RiceProduct.findById(req.params.id);
        if (productToUpdate && productToUpdate.name !== name) {
            const existingProductWithNewName = await RiceProduct.findOne({ name });
            if (existingProductWithNewName) {
                return res.status(400).json({ message: `Another product with the name "${name}" already exists.` });
            }
        }
    }

    const updatedProduct = await RiceProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Rice product not found to update' });
    }
    res.status(200).json({ message: 'Rice product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error("Error updating rice product:", error);
    if (error.code === 11000 && error.keyValue && error.keyValue.name) {
        return res.status(400).json({ message: `A product with the name "${error.keyValue.name}" already exists.` });
    }
    res.status(500).json({ message: 'Failed to update rice product', error: error.message });
  }
};

// Delete a rice product (Admin only)
const deleteRiceProduct = async (req, res) => {
  try {
    const deletedProduct = await RiceProduct.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Rice product not found to delete' });
    }
    res.status(200).json({ message: 'Rice product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error("Error deleting rice product:", error);
    res.status(500).json({ message: 'Failed to delete rice product', error: error.message });
  }
};

module.exports = {
  getAllRiceProducts,
  getRiceProductById,
  createRiceProduct,
  updateRiceProduct,
  deleteRiceProduct,
};