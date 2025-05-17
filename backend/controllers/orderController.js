// D:\Rice Mart\Consultancy-Project\exp-10\backend\controllers\orderController.js
const Order = require('../models/Order'); // Adjust path if necessary
const Stock = require('../models/Stock'); // <<<--- ADDED: Import Stock model
const { sendLowStockNotification } = require('../services/emailService'); // Import email service

const LOW_STOCK_THRESHOLD = 50; // Define the threshold
const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Get admin email from .env for notifications

const createOrder = async (req, res) => {
  try {
    // Destructure what the frontend Product.js is sending (userDetails for form data)
    const { productName, description, totalPrice, quantity, userDetails: formSubmittedDetails, cartItems } = req.body;

    // --- Get the AUTHENTICATED user's email and UID from req.user (set by authMiddleware) ---
    const authenticatedUserEmail = req.user?.email;
    const authenticatedUserId = req.user?.uid; // Good to store UID as well

    // --- Validation ---
    if (!authenticatedUserEmail) {
      // This is a safeguard; authMiddleware should catch unauthenticated requests.
      console.error("createOrder Error: Authenticated user's email not found in req.user. Token might be invalid or not contain email.");
      return res.status(401).json({ message: "User authentication error: Email not found in token." });
    }

    // Validate essential fields from the form
    if (!formSubmittedDetails || !formSubmittedDetails.name || !formSubmittedDetails.phone || !formSubmittedDetails.address) {
      return res.status(400).json({ message: 'User details from form (name, phone, address) are required.' });
    }
    if ((!cartItems || cartItems.length === 0) && (!productName || typeof totalPrice === 'undefined' || typeof quantity === 'undefined')) {
      return res.status(400).json({ message: 'Please provide product details or cart items.' });
    }

    // --- Construct the new Order document ---
    const newOrder = new Order({
      productName: productName, // if single product order
      description: description, // if single product order
      totalPrice: totalPrice,
      quantity: quantity,       // if single product order
      userDetails: {
        email: authenticatedUserEmail,
        name: formSubmittedDetails.name,
        phone: formSubmittedDetails.phone,
        address: formSubmittedDetails.address,
      },
      cartItems: cartItems || [], 
      userId: authenticatedUserId, 
      status: 'Pending', 
    });

    await newOrder.save();

    console.log(`Order ${newOrder._id} created successfully for user: ${authenticatedUserEmail}`);

    // --- START: Stock update and low stock check logic ---
    console.log(`Initiating stock update for order ${newOrder._id}`);
    let productNamesForStockCheck = []; 

    try { 
      if (newOrder.cartItems && newOrder.cartItems.length > 0) {
          productNamesForStockCheck = newOrder.cartItems.map(item => item.name);
          const stockUpdateOperations = newOrder.cartItems.map(item => ({
              updateOne: {
                  filter: { name: item.name }, 
                  update: { $inc: { available: -Number(item.quantity || 0) } }
              }
          }));

          if (stockUpdateOperations.length > 0) {
              const bulkWriteResult = await Stock.bulkWrite(stockUpdateOperations);
              console.log(`Stock levels updated for cart items in order ${newOrder._id}. Result:`, bulkWriteResult);
          }
      } else if (newOrder.productName && newOrder.quantity > 0) {
          productNamesForStockCheck.push(newOrder.productName);
          const stockUpdateResult = await Stock.updateOne(
              { name: newOrder.productName }, 
              { $inc: { available: -Number(newOrder.quantity || 0) } }
          );
          console.log(`Stock level updated for single product order ${newOrder._id}. Result:`, stockUpdateResult);
      } else {
          console.log(`No cart items or single product info for stock update in order ${newOrder._id}.`);
      }

      // --- Check for low stock after updates ---
      if (productNamesForStockCheck.length > 0) {
        console.log('Checking final stock levels for:', productNamesForStockCheck.join(', '));
        const updatedStocks = await Stock.find({ name: { $in: productNamesForStockCheck } }).lean();
        
        for (const stockItem of updatedStocks) {
          console.log(`Final stock for ${stockItem.name}: Available = ${stockItem.available} kg`);
          if (stockItem.available <= LOW_STOCK_THRESHOLD) {
            console.log(`LOW STOCK DETECTED for ${stockItem.name} (${stockItem.available}kg). Sending notification.`);
            // Intentionally not awaiting sendLowStockNotification to avoid blocking the order response
            sendLowStockNotification(stockItem.name, stockItem.available, ADMIN_EMAIL)
              .catch(emailError => console.error(`Error sending low stock email for ${stockItem.name}:`, emailError));
          }
        }
      }
      // --- End low stock check ---

    } catch(stockUpdateError) {
        console.error(`ERROR updating stock or checking low stock for order ${newOrder._id}:`, stockUpdateError.message, stockUpdateError.stack);
    }
    // --- END: Stock update and low stock check logic ---


    res.status(201).json({
      message: 'Order placed successfully', 
      orderId: newOrder._id,
      order: newOrder,
    });

  } catch (error) { 
    console.error("Error in createOrder controller (before or during order save):", error);
    res.status(500).json({ message: 'Server error while creating order', error: error.message });
  }
};


// --- getStockSummary function REMAINS UNCHANGED ---
const getStockSummary = async (req, res) => { // Note: req, res params may not be used if logic is just returned
  try {
    console.log("CONTROLLER getStockSummary: Attempting to fetch stock summary.");

    const salesData = await Order.aggregate([
      {
        $match: {
          "cartItems.0": { "$exists": true } // Ensures cartItems array exists and is not empty
        }
      },
      { $unwind: "$cartItems" },
      {
        $group: {
          _id: "$cartItems.name",
          totalSold: { $sum: "$cartItems.quantity" },
        },
      },
      {
        $project: {
          productName: "$_id",
          totalSold: 1,
          _id: 0
        }
      }
    ]);

    console.log(`CONTROLLER getStockSummary: Aggregated sales data:`, salesData);
    // Function is set up to return data to the route handler
    return salesData;

  } catch (error) {
    console.error("CONTROLLER getStockSummary - Error:", error.message, error.stack);
    throw error; // Re-throw the error for the route handler to catch
  }
};


module.exports = {
  createOrder,
  getStockSummary
};