// D:\Rice Mart\Consultancy-Project\exp-10\backend\routes\orderRoutes.js
const express = require("express");
const router = express.Router();
//const { createOrder } = require("../controllers/orderController");
const Order = require("../models/Order");
const { createOrder, getStockSummary } = require("../controllers/orderController"); 

const authMiddleware = require("../middleware/auth");

router.post("/orders", authMiddleware, createOrder); // Added authMiddleware

router.get("/stock-summary", async (req, res) => { // Consider adding authMiddleware if this is admin-only
  try {
    console.log("BACKEND GET /api/stock-summary: Attempting to fetch stock summary.");
    
    // Aggregate sales data from orders
    // We need to sum quantities for each product name.
    // Orders can have single products or cartItems. We need to handle both.
    const salesData = await Order.aggregate([
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

    console.log(`BACKEND GET /api/stock-summary: Aggregated sales data:`, salesData);
    res.status(200).json(salesData);

  } catch (error) {
    console.error("BACKEND GET /api/stock-summary - Error fetching stock summary:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch stock summary." });
  }
});


router.get("/order-history", async (req, res) => {
  try {
    console.log("GET /api/order-history: Fetching all 'Placed' orders.");
    const orders = await Order.find({ status: "Placed" });
    console.log(`GET /api/order-history: Found ${orders.length} 'Placed' orders.`);
    res.status(200).json(orders);
  } catch (error) {
    console.error("GET /api/order-history - Error fetching 'Placed' orders:", error);
    res.status(500).json({ error: "Failed to fetch placed orders." });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`PUT /api/orders/${orderId}: Attempting to mark order as completed.`);
    const order = await Order.findById(orderId);

    if (!order) {
      console.warn(`PUT /api/orders/${orderId}: Order not found.`);
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = "Completed";
    await order.save();
    console.log(`PUT /api/orders/${orderId}: Order successfully marked as completed.`);
    res.status(200).json({ message: "Order marked as completed.", order });
  } catch (error) {
    console.error(`PUT /api/orders/${req.params.id} - Error updating order status:`, error);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

router.get("/orders", authMiddleware, async (req, res) => {
  try {
    // VITAL LOG 1: What is in req.user after authMiddleware?
    console.log("BACKEND GET /api/orders (user-specific): req.user from authMiddleware:", req.user);

    const userEmail = req.user?.email;

    // VITAL LOG 2: Is userEmail what you expect?
    console.log(`BACKEND GET /api/orders (user-specific): Extracted userEmail: ${userEmail}`);

    if (!userEmail) {
      console.error("BACKEND GET /api/orders (user-specific): User email not found in req.user. Cannot filter.");
      return res.status(400).json({ error: "User identification failed or email not found in token." });
    }

    console.log(`BACKEND GET /api/orders (user-specific): Attempting to find orders for email: ${userEmail}`);
    const orders = await Order.find({ "userDetails.email": userEmail }); // The actual filter
    // VITAL LOG 3: How many orders were found *after* the filter?
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