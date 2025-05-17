// backend/controllers/riceProductController.js
const RiceProduct = require('../models/RiceProduct');
const Stock = require('../models/Stock'); // Import Stock model

// Get all rice products
const getAllRiceProducts = async (req, res) => {
  try {
    const productsFromDB = await RiceProduct.find({}).sort({ category: 1, name: 1 }).lean();
    const stockLevels = await Stock.find({}).lean();

    // Create a map for quick lookup of stock levels by product name
    const stockMap = new Map(stockLevels.map(stock => [stock.name, stock.available]));

    const productsWithStock = productsFromDB.map(product => {
      // Calculate effectivePrice manually since .lean() bypasses virtuals
      let effectivePrice = product.originalPrice;
      if (product.discountPercentage > 0) {
        effectivePrice = parseFloat((product.originalPrice * (1 - product.discountPercentage / 100)).toFixed(2));
      }

      return {
        ...product,
        effectivePrice: effectivePrice, // Manually add effectivePrice
        available: stockMap.get(product.name) || 0, // Add available stock, default to 0 if not found
      };
    });
    
    res.status(200).json(productsWithStock);
  } catch (error) {
    console.error("Error fetching rice products with stock:", error);
    res.status(500).json({ message: 'Failed to fetch rice products', error: error.message });
  }
};

// Get a single rice product by ID
const getRiceProductById = async (req, res) => {
  try {
    const product = await RiceProduct.findById(req.params.id).lean(); // Using lean
    if (!product) {
      return res.status(404).json({ message: 'Rice product not found' });
    }

    // Fetch stock for this specific product
    const stockItem = await Stock.findOne({ name: product.name }).lean();
    
    // Calculate effectivePrice manually
    let effectivePrice = product.originalPrice;
    if (product.discountPercentage > 0) {
      effectivePrice = parseFloat((product.originalPrice * (1 - product.discountPercentage / 100)).toFixed(2));
    }

    const productWithStock = {
      ...product,
      effectivePrice: effectivePrice,
      available: stockItem ? stockItem.available : 0,
    };
    
    res.status(200).json(productWithStock);
  } catch (error) {
    console.error("Error fetching rice product by ID with stock:", error);
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

    // **NEW**: Automatically create a stock entry for the new product
    await Stock.findOneAndUpdate(
        { name: newProduct.name }, // Filter
        { $setOnInsert: { name: newProduct.name, bought: 0, available: 0 } }, // Data to insert on creation
        { upsert: true, new: true, runValidators: true } // Options: create if not exist, return new doc
    );
    console.log(`Stock entry ensured for new product: ${newProduct.name}`);

    // Respond with the product object, Mongoose virtuals will be applied if not using .lean() for the response object
    res.status(201).json({ message: 'Rice product created successfully', product: newProduct.toObject({ virtuals: true }) });
  } catch (error) {
    console.error("Error creating rice product:", error);
    // Check for duplicate key error for the Stock model as well if you have unique constraints there
    if (error.code === 11000 && error.keyValue && error.keyValue.name) {
        return res.status(400).json({ message: `A product or stock item with the name "${error.keyValue.name}" already exists.` });
    }
    res.status(500).json({ message: 'Failed to create rice product or initial stock', error: error.message });
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
    } else if (req.body.hasOwnProperty('discountPercentage') && (discountPercentage === null || typeof discountPercentage === 'undefined')) { 
        updateData.discountPercentage = 0;
    }


    if (imageUrl) updateData.imageUrl = imageUrl;
    if (category) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No update data provided.' });
    }

    const productToUpdate = await RiceProduct.findById(req.params.id);
    if (!productToUpdate) {
        return res.status(404).json({ message: 'Rice product not found to update' });
    }
    
    const oldName = productToUpdate.name;

    // Check for name conflict if name is being changed
    if (name && oldName !== name) {
        const existingProductWithNewName = await RiceProduct.findOne({ name });
        if (existingProductWithNewName) {
            return res.status(400).json({ message: `Another product with the name "${name}" already exists.` });
        }
    }

    const updatedProduct = await RiceProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      // This case should ideally be caught by productToUpdate check, but as safeguard.
      return res.status(404).json({ message: 'Rice product not found after attempting update.' });
    }

    // **NEW**: If product name changed, update the corresponding Stock item's name
    if (name && oldName !== name) {
        await Stock.updateOne({ name: oldName }, { $set: { name: updatedProduct.name } });
        console.log(`Stock item name updated from ${oldName} to ${updatedProduct.name}`);
    }

    res.status(200).json({ message: 'Rice product updated successfully', product: updatedProduct.toObject({ virtuals: true }) });
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
    // **NEW**: Also delete the corresponding stock item
    await Stock.deleteOne({ name: deletedProduct.name });
    console.log(`Stock item for ${deletedProduct.name} also deleted.`);

    res.status(200).json({ message: 'Rice product deleted successfully', product: deletedProduct.toObject({ virtuals: true }) });
  } catch (error) {
    console.error("Error deleting rice product:", error);
    res.status(500).json({ message: 'Failed to delete rice product or its stock', error: error.message });
  }
};

module.exports = {
  getAllRiceProducts,
  getRiceProductById,
  createRiceProduct,
  updateRiceProduct,
  deleteRiceProduct,
};