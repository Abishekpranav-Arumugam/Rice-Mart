const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productName: { type: String, required: false }, // Optional for cart orders
  description: { type: String, required: false }, // Optional for cart orders
  totalPrice: { type: Number, required: true },
  quantity: { type: Number, required: false }, // Optional for cart orders
  userDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  cartItems: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: { type: String, default: "Pending" }, // New field for order status
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
