// D:\Rice Mart\Consultancy-Project\exp-10\backend\controllers\orderController.js
const Order = require('../models/Order'); // Adjust path if necessary
const Stock = require('../models/Stock'); // <<<--- ADDED: Import Stock model

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
        // **CRITICAL FOR ISOLATION: Use the email from the VERIFIED TOKEN**
        email: authenticatedUserEmail,
        // Use the name, phone, address submitted by the user in the form
        name: formSubmittedDetails.name,
        phone: formSubmittedDetails.phone,
        address: formSubmittedDetails.address,
      },
      cartItems: cartItems || [], // Handle cases for direct product purchase vs. cart checkout
      userId: authenticatedUserId, // Optional: Store the Firebase UID for a robust link
      status: 'Pending', // Default status for new orders
      // createdAt is handled by Mongoose timestamps in your schema if you have { timestamps: true }
    });

    await newOrder.save();

    console.log(`Order ${newOrder._id} created successfully for user: ${authenticatedUserEmail}`);

    // --- START: NEW stock update logic integrated ---
    console.log(`Initiating stock update check for order ${newOrder._id}`);
    try { // Added try/catch specifically for stock updates to avoid breaking order confirmation if stock update fails
      if (newOrder && newOrder.cartItems && newOrder.cartItems.length > 0) {
          // Create an array of update operations for bulkWrite
          const stockUpdateOperations = newOrder.cartItems.map(item => ({
              updateOne: {
                  filter: { name: item.name }, // Find stock item by name
                  // Use $inc to decrement the 'available' field by the quantity ordered
                  // Ensure item.quantity is a valid number
                  update: { $inc: { available: -Number(item.quantity || 0) } }
              }
          }));

          if (stockUpdateOperations.length > 0) {
              const bulkWriteResult = await Stock.bulkWrite(stockUpdateOperations);
              console.log(`Stock levels updated for cart items in order ${newOrder._id}. Result:`, bulkWriteResult);
          }
      } else if (newOrder && newOrder.productName && newOrder.quantity > 0) {
          // Handle stock update for a single product order
          const stockUpdateResult = await Stock.updateOne(
              { name: newOrder.productName }, // Find stock item by name
              // Use $inc to decrement 'available' by the quantity ordered
              { $inc: { available: -Number(newOrder.quantity || 0) } }
          );
          console.log(`Stock level updated for single product order ${newOrder._id}. Result:`, stockUpdateResult);
      } else {
          console.log(`No cart items or single product info found for stock update in order ${newOrder._id}.`);
      }
    } catch(stockUpdateError) {
        // Log the error but continue to confirm order to the user
        console.error(`ERROR updating stock for order ${newOrder._id}:`, stockUpdateError.message, stockUpdateError.stack);
        // Potentially add more robust error handling/logging here (e.g., notify admin)
    }
    // --- END: NEW stock update logic integrated ---


    // Respond success for order creation, even if stock update had an issue (logged above)
    res.status(201).json({
      message: 'Order placed successfully', // Keeping message simple for user
      orderId: newOrder._id,
      order: newOrder,
    });

  } catch (error) { // This catches errors from newOrder.save() or other initial parts
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


// Update module.exports - already includes both as per your last code version
module.exports = {
  createOrder,
  getStockSummary
};