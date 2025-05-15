// D:\Rice Mart\Consultancy-Project\exp-10\backend\routes\orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Stock = require("../models/Stock");
const { createOrder, getStockSummary } = require("../controllers/orderController");

const authMiddleware = require("../middleware/auth"); // Assuming authMiddleware is correctly implemented

router.post("/orders", authMiddleware, createOrder); // Added authMiddleware

router.get("/stock-summary", async (req, res) => { // Consider adding authMiddleware if this is admin-only
  try {
    console.log("BACKEND GET /api/stock-summary: Attempting to fetch stock summary.");

    // Aggregate sales data from orders
    // We need to sum quantities for each product name.
    // Orders can have single products or cartItems. We need to handle both.
    const salesData = await Order.aggregate([
      // Only consider orders that are not canceled for 'sold' quantity calculation
      { $match: { status: { $ne: "Canceled" } } },
      { $unwind: "$cartItems" }, // Deconstruct cartItems array into separate documents
      {
        $group: {
          _id: "$cartItems.name", // Group by product name in cartItems
          totalSold: { $sum: "$cartItems.quantity" },
        },
      },
      {
        $project: { // Rename _id to productName for clarity
          productName: "$_id",
          totalSold: 1,
          _id: 0 // Exclude the original _id
        }
      }
    ]);

    // You might also need to handle single product orders if `productName` field is used directly
    // This would require another aggregation or merging logic if productName can be different from cartItems.name
    // For simplicity, this example focuses on cartItems. If you have direct productName orders,
    // you'll need to extend this aggregation.

    console.log(`BACKEND GET /api/stock-summary: Aggregated sales data (excluding canceled):`, salesData);
    res.status(200).json(salesData);

  } catch (error) {
    console.error("BACKEND GET /api/stock-summary - Error fetching stock summary:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch stock summary." });
  }
});


router.get("/order-history", async (req, res) => {
  try {
    console.log("GET /api/order-history: Fetching all 'Placed' orders.");
    // NOTE: This endpoint currently fetches *only* "Placed" orders.
    // The user-specific /api/orders route below is what OrderHistory uses.
    const orders = await Order.find({ status: "Placed" });
    console.log(`GET /api/order-history: Found ${orders.length} 'Placed' orders.`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("GET /api/order-history - Error fetching 'Placed' orders:", error);
    res.status(500).json({ error: "Failed to fetch placed orders." });
  }
});

// ADD authMiddleware HERE TO PROTECT THE ROUTE
router.put("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status: newStatus } = req.body; // Rename for clarity

    // Basic validation for the status
    const validStatuses = ["Placed", "Shipped", "Completed", "Canceled"];
    if (!newStatus || !validStatuses.includes(newStatus)) {
        console.warn(`PUT /api/orders/${orderId}: Invalid or missing status received in body: ${newStatus}`);
        return res.status(400).json({ message: `Invalid or missing status provided. Must be one of: ${validStatuses.join(", ")}` });
    }

    console.log(`PUT /api/orders/${orderId}: Attempting to update order status to "${newStatus}".`);

    const order = await Order.findById(orderId);

    if (!order) {
      console.warn(`PUT /api/orders/${orderId}: Order not found.`);
      return res.status(404).json({ message: "Order not found." });
    }

    // *** ADD AUTHORIZATION CHECK ***
    // Check if the authenticated user is authorized to modify this order.
    // In a real app, you'd check for an admin role here as well.
    // For now, we'll simply check if the user's email matches the order's user email.
    // authMiddleware should populate req.user
    if (!req.user || !req.user.email) {
         // This should ideally not happen if authMiddleware is working, but as a safeguard
         console.error(`PUT /api/orders/${orderId}: Authorization check failed - req.user or email missing AFTER authMiddleware.`);
         return res.status(401).json({ message: "Authentication failed." });
    }

    // Check ownership UNLESS user is an admin (if admin check is added later)
    // For now, assuming *only* the order owner or admin can update.
    // Since we don't have admin roles, this check means only the owner can update.
    // **NOTE**: This implies the Admin panel route call *also* needs to send an admin token
    // or a token for the user who owns the order for this route to work.
    // A more robust solution would check for an admin flag in req.user here.
    if (order.userDetails.email !== req.user.email) {
         console.warn(`PUT /api/orders/${orderId}: User ${req.user.email} is not authorized to update order ${orderId} (owned by ${order.userDetails.email}).`);
         return res.status(403).json({ message: "You are not authorized to perform this action on this order." });
    }
     console.log(`PUT /api/orders/${orderId}: Authorization successful for user ${req.user.email}.`);
    // *** END AUTHORIZATION CHECK ***


    const oldStatus = order.status;

    // *** STOCK REFUND LOGIC: Only run if status changes TO "Canceled" ***
    if (newStatus === "Canceled" && oldStatus !== "Canceled") {
        console.log(`PUT /api/orders/${orderId}: Order status changing from "${oldStatus}" to "Canceled". Initiating stock refund.`);

        const itemsToRefund = [];

        // Check if the order has cartItems (preferred method)
        if (order.cartItems && Array.isArray(order.cartItems) && order.cartItems.length > 0) {
            console.log(`PUT /api/orders/${orderId}: Processing ${order.cartItems.length} cart items for stock refund.`);
            order.cartItems.forEach(item => {
                // Ensure item structure is as expected
                if (item.name && typeof item.quantity === 'number' && item.quantity > 0) {
                    itemsToRefund.push({ name: item.name, quantity: item.quantity });
                } else {
                    console.warn(`PUT /api/orders/${orderId}: Skipping invalid cart item:`, item);
                }
            });
        } else if (order.productName && typeof order.quantity === 'number' && order.quantity > 0) {
             // Fallback for older single-item order structure if necessary
             console.log(`PUT /api/orders/${orderId}: Processing single product item (${order.productName}, ${order.quantity}kg) for stock refund.`);
             itemsToRefund.push({ name: order.productName, quantity: order.quantity });
        } else {
            console.warn(`PUT /api/orders/${orderId}: Order ${orderId} has no valid cartItems or single product details (${JSON.stringify(order.cartItems)}, ${order.productName}, ${order.quantity}). No stock to refund.`);
        }

        if (itemsToRefund.length > 0) {
            console.log(`PUT /api/orders/${orderId}: Preparing to refund stock for ${itemsToRefund.length} items:`, itemsToRefund);
            try {
                // Prepare bulk update operations for stock
                // For each item, increment the 'available' quantity in the Stock collection
                const stockOperations = itemsToRefund.map(item => ({
                    updateOne: {
                        filter: { name: item.name },
                        update: { $inc: { available: item.quantity } },
                         // upsert: true // Keep commented out unless you intend to create stock items on refund
                    }
                }));

                const stockResult = await Stock.bulkWrite(stockOperations);
                console.log(`PUT /api/orders/${orderId}: Stock refund bulkWrite result: Matched ${stockResult.matchedCount}, Modified ${stockResult.modifiedCount}`);

                 if (stockResult.modifiedCount < itemsToRefund.length) {
                      console.warn(`PUT /api/orders/${orderId}: Warning: Attempted to refund stock for ${itemsToRefund.length} items, but only ${stockResult.modifiedCount} stock records were modified. Some products might not exist in the Stock collection or match exactly.`);
                 }


            } catch (stockErr) {
                console.error(`PUT /api/orders/${orderId} - Error during stock refund bulkWrite for order ${orderId}:`, stockErr.message, stockErr.stack);
                // Log the error, but allow the order status to update.
            }
        } else {
             console.log(`PUT /api/orders/${orderId}: No valid items found in order to refund stock for.`);
        }
    } else if (newStatus === "Canceled" && oldStatus === "Canceled") {
         console.log(`PUT /api/orders/${orderId}: Order ${orderId} is already "Canceled". Skipping stock refund.`);
    } else {
        console.log(`PUT /api/orders/${orderId}: Order status changing from "${oldStatus}" to "${newStatus}". No stock refund needed for this transition.`);
        // Note: If status changes *from* Canceled (e.g., back to Placed - not a typical flow but possible),
        // you *might* need logic here to *deduct* stock again. Assuming status changes are primarily forward (Placed -> Shipped -> Completed)
        // or to Canceled.
    }
    // *** END STOCK REFUND LOGIC ***


    // Update the order status in the database
    order.status = newStatus;
    await order.save();
    console.log(`PUT /api/orders/${orderId}: Order status successfully updated to "${order.status}".`);

    // Respond to the frontend
    res.status(200).json({ message: `Order status updated to ${order.status}.`, order });

  } catch (error) {
    console.error(`PUT /api/orders/${req.params.id} - Critical error updating order status or refunding stock:`, error.message, error.stack);
    // Respond with a generic error, avoid sending detailed error info to the client
    res.status(500).json({ error: "Failed to update order status or process stock changes." });
  }
});

router.get("/orders", authMiddleware, async (req, res) => {
  try {
    console.log("BACKEND GET /api/orders (user-specific): req.user from authMiddleware:", req.user);

    const userEmail = req.user?.email;

    console.log(`BACKEND GET /api/orders (user-specific): Extracted userEmail: ${userEmail}`);

    if (!userEmail) {
      console.error("BACKEND GET /api/orders (user-specific): User email not found in req.user. Cannot filter.");
      return res.status(400).json({ error: "User identification failed or email not found in token." });
    }

    console.log(`BACKEND GET /api/orders (user-specific): Attempting to find orders for email: ${userEmail}`);
    // This route should fetch *all* orders for the user, regardless of status.
    const orders = await Order.find({ "userDetails.email": userEmail }).sort({ createdAt: -1 });
    console.log(`BACKEND GET /api/orders (user-specific): Found ${orders.length} orders for ${userEmail}.`);

    res.status(200).json(orders);
  } catch (error) {
    console.error("BACKEND GET /api/orders (user-specific) - Critical error:", error.message, error.stack);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});


router.get("/admin/all-orders", async (req, res) => {
  try {
    console.log("BACKEND GET /api/admin/all-orders (ADMIN): Attempting to fetch all orders.");
    // Fetch all orders from the database, sort by most recent first
    const allOrders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`BACKEND GET /api/admin/all-orders (ADMIN): Found ${allOrders.length} total orders.`);
    res.status(200).json(allOrders);
  } catch (error)
 {
    console.error("BACKEND GET /api/admin/all-orders (ADMIN) - Error fetching all orders:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch all orders for admin panel." });
  }
});
module.exports = router;