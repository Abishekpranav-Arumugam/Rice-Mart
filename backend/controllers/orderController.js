// D:\Rice Mart\Consultancy-Project\exp-10\backend\controllers\orderController.js
const Order = require('../models/Order');
const Stock = require('../models/Stock');
const { sendLowStockNotification } = require('../services/emailService');

const LOW_STOCK_THRESHOLD = 50;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const createOrder = async (req, res) => {
  console.log("--- createOrder: Request received ---"); // Log request start
  try {
    const { productName, description, totalPrice, quantity, userDetails: formSubmittedDetails, cartItems } = req.body;
    // Log request body but be careful with sensitive data in production logs
    console.log("createOrder: Request body parsed. CartItems count:", cartItems ? cartItems.length : 0, "Single product:", productName);

    const authenticatedUserEmail = req.user?.email;
    const authenticatedUserId = req.user?.uid;
    console.log(`createOrder: Authenticated User - Email: ${authenticatedUserEmail}, UID: ${authenticatedUserId}`);

    if (!authenticatedUserEmail) {
      console.error("createOrder Error: Authenticated user's email not found in req.user.");
      return res.status(401).json({ message: "User authentication error: Email not found in token." });
    }

    if (!formSubmittedDetails || !formSubmittedDetails.name || !formSubmittedDetails.phone || !formSubmittedDetails.address) {
      console.error("createOrder Error: Missing form user details.");
      return res.status(400).json({ message: 'User details from form (name, phone, address) are required.' });
    }
    if ((!cartItems || cartItems.length === 0) && (!productName || typeof totalPrice === 'undefined' || typeof quantity === 'undefined')) {
      console.error("createOrder Error: Missing product/cart details.");
      return res.status(400).json({ message: 'Please provide product details or cart items.' });
    }

    const newOrder = new Order({
      productName: productName,
      description: description,
      totalPrice: totalPrice,
      quantity: quantity,
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
    console.log(`createOrder: Order ${newOrder._id} saved successfully for user: ${authenticatedUserEmail}.`);

    // --- Stock update and low stock check logic ---
    console.log(`createOrder: Initiating stock update for order ${newOrder._id}`);
    let productNamesForStockCheck = [];

    try {
      if (newOrder.cartItems && newOrder.cartItems.length > 0) {
        console.log("createOrder: Processing cart items for stock update.");
        productNamesForStockCheck = newOrder.cartItems.map(item => {
          console.log(`createOrder: Cart item - Name: ${item.name}, Quantity to deduct: ${item.quantity || 0}`);
          return item.name;
        });
        const stockUpdateOperations = newOrder.cartItems.map(item => ({
          updateOne: {
            filter: { name: item.name },
            update: { $inc: { available: -Number(item.quantity || 0) } }
          }
        }));

        if (stockUpdateOperations.length > 0) {
          console.log("createOrder: Executing bulkWrite for stock update (cart items). Operations count:", stockUpdateOperations.length);
          const bulkWriteResult = await Stock.bulkWrite(stockUpdateOperations);
          console.log(`createOrder: Stock levels updated for cart items. Result: Matched: ${bulkWriteResult.matchedCount}, Modified: ${bulkWriteResult.modifiedCount}`);
        }
      } else if (newOrder.productName && newOrder.quantity > 0) {
        console.log(`createOrder: Processing single product for stock update. Name: ${newOrder.productName}, Quantity: ${newOrder.quantity}`);
        productNamesForStockCheck.push(newOrder.productName);
        const stockUpdateResult = await Stock.updateOne(
          { name: newOrder.productName },
          { $inc: { available: -Number(newOrder.quantity || 0) } }
        );
        console.log(`createOrder: Stock level updated for single product. Result: Matched: ${stockUpdateResult.matchedCount}, Modified: ${stockUpdateResult.modifiedCount}`);
      } else {
        console.log(`createOrder: No cart items or single product info for stock update in order ${newOrder._id}.`);
      }

      // --- Check for low stock after updates ---
      if (productNamesForStockCheck.length > 0) {
        console.log('createOrder: Checking final stock levels for products:', productNamesForStockCheck.join(', '));
        // Important: Fetch fresh stock data *after* the update
        const updatedStocks = await Stock.find({ name: { $in: productNamesForStockCheck } }).lean();
        console.log("createOrder: Fetched updated stock records after update. Count:", updatedStocks.length, "Data:", JSON.stringify(updatedStocks.map(s => ({name:s.name, available:s.available})))); // Log cleaner data
        
        for (const stockItem of updatedStocks) {
          console.log(`createOrder: CHECKING STOCK FOR [${stockItem.name}]. Available: ${stockItem.available} kg, Threshold: ${LOW_STOCK_THRESHOLD} kg. ADMIN_EMAIL target: ${ADMIN_EMAIL}`);
          if (stockItem.available <= LOW_STOCK_THRESHOLD) {
            // Using console.log with %c for colored output (works in some Node environments/terminals)
            console.log(`%ccreateOrder: LOW STOCK DETECTED for ${stockItem.name} (${stockItem.available}kg). Attempting to send notification.`, 'color: red; font-weight: bold;');
            if (!ADMIN_EMAIL) {
              console.error(`createOrder: CRITICAL - ADMIN_EMAIL environment variable is not set. Cannot send low stock notification for ${stockItem.name}.`);
            } else {
              sendLowStockNotification(stockItem.name, stockItem.available, ADMIN_EMAIL)
                .catch(emailError => console.error(`createOrder: Error returned from sendLowStockNotification for ${stockItem.name}:`, emailError));
            }
          } else {
            console.log(`createOrder: Stock for ${stockItem.name} (${stockItem.available}kg) is above threshold.`);
          }
        }
      } else {
         console.log("createOrder: No products were processed for stock updates, so skipping low stock check.");
      }
      // --- End low stock check ---

    } catch (stockUpdateError) {
      console.error(`createOrder: ERROR during stock update or low stock check for order ${newOrder._id}:`, stockUpdateError.message, stockUpdateError.stack);
    }
    // --- END: Stock update and low stock check logic ---

    console.log(`createOrder: Responding to client with success for order ${newOrder._id}.`);
    res.status(201).json({
      message: 'Order placed successfully',
      orderId: newOrder._id,
      order: newOrder,
    });

  } catch (error) {
    console.error("createOrder: FATAL error during order creation process:", error.message, error.stack);
    res.status(500).json({ message: 'Server error while creating order', error: error.message });
  }
  console.log("--- createOrder: Request processed ---");
};


// getStockSummary (remains unchanged - not directly related to this issue)
const getStockSummary = async (req, res) => { /* ... existing code ... */ };

module.exports = {
  createOrder,
  getStockSummary
};