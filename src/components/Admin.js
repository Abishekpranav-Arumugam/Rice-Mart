// Admin.js
import React, { useEffect, useState } from "react";
import { Table, Container, Alert, Button } from "react-bootstrap";
import axios from "axios";
// If you implement admin auth later, you might need useAuth here too.
// import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  // const { user } = useAuth(); // If admin auth needed for fetching/updating

  useEffect(() => {
    const fetchOrders = async () => {
      setError(null); // Clear previous errors
      try {
        // **** MODIFIED ENDPOINT ****
        // Call the new admin-specific endpoint that returns all orders
        const response = await axios.get("http://localhost:5000/api/admin/all-orders");
        // For admin auth later, you might add headers:
        // const token = await user.getIdToken();
        // const response = await axios.get("http://localhost:5000/api/admin/all-orders", {
        //   headers: { Authorization: `Bearer ${token}` }
        // });

        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error("Admin: Unexpected response format for all orders:", response.data);
          setOrders([]);
          setError("Received unexpected data format from server.");
        }
      } catch (err) {
        console.error("Admin: Error fetching all orders:", err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Failed to fetch orders: ${err.response.data.message || err.response.statusText || 'Server error'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError("Failed to fetch orders: No response from server. Is it running?");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError("Failed to fetch orders: Error setting up request.");
        }
        setOrders([]); // Clear orders on error
      }
    };

    fetchOrders();
  }, []); // Removed `user` from dependency array if not used for fetching yet

  // Mark order as completed
  const handleComplete = async (orderId) => {
    setError(null); // Clear previous errors
    setSuccess(""); // Clear previous success
    try {
      // **** POTENTIAL SECURITY ISSUE FOR PUT REQUEST ****
      // This PUT request to mark an order complete should also be secured.
      // If any admin can mark any order complete, you'd ideally send an admin token.
      // const token = await user.getIdToken(); // If admin needs to be authenticated for this action
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: "Completed" }); // Send status in body

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "Completed" } : order
        )
      );
      setSuccess("Order status updated to completed successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Admin: Error updating order status:", err);
      if (err.response) {
        setError(`Failed to update order status: ${err.response.data.message || err.response.statusText || 'Server error'}`);
      } else {
        setError("Failed to update order status. Please try again.");
      }
    }
  };

  // ADD THIS NEW FUNCTION TO HANDLE CANCELLATION
  const handleCancel = async (orderId) => {
    setError(null); // Clear previous errors
    setSuccess(""); // Clear previous success
    try {
      // Send the status "Canceled" in the request body
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: "Canceled" });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "Canceled" } : order
        )
      );
      setSuccess("Order status updated to canceled successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Admin: Error canceling order:", err);
      if (err.response) {
        setError(`Failed to cancel order: ${err.response.data.message || err.response.statusText || 'Server error'}`);
      } else {
        setError("Failed to cancel order. Please try again.");
      }
    }
  };


  return (
    <Container className="mt-5 pt-4"> {/* Added Bootstrap margin-top utility */}
      <h2 className="my-4 text-center">ALL CUSTOMER ORDERS</h2> {/* Centered heading */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
      <Table striped bordered hover responsive className="shadow-sm"> {/* Added responsive and shadow */}
        <thead className="table-dark"> {/* Darker header */}
          <tr>
            <th>Order ID</th>
            <th>Product(s)</th>
            <th>Total Quantity</th>
            <th>Total Price</th>
            <th>Customer Name</th>
            <th>Customer Email</th>
            <th>Order Placed At</th>
            <th>Status</th>
            <th>Action</th> {/* Keep Action column */}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id}>
                <td><code>{order._id}</code></td> {/* Use code tag for ID */}
                <td>
                  {order.cartItems && order.cartItems.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {order.cartItems.map((item, idx) => (
                        <li key={idx} className={idx > 0 ? "mt-1 pt-1 border-top" : ""}>
                          {item.name} (x{item.quantity}) - ₹{item.price?.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    order.productName || "N/A"
                  )}
                </td>
                <td className="text-center"> {/* Centered quantity */}
                  {order.cartItems && order.cartItems.length > 0
                    ? order.cartItems.reduce((sum, item) => sum + item.quantity, 0)
                    : order.quantity || 0}
                </td>
                <td className="text-end">₹{order.totalPrice?.toFixed(2)}</td> {/* Right-aligned price */}
                <td>{order.userDetails?.name || "N/A"}</td>
                <td>{order.userDetails?.email || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  {/* Updated Status Badge Rendering */}
                  <span className={`badge bg-${
                    order.status === "Completed" ? "success" :
                    order.status === "Canceled" ? "danger" : // Red badge for Canceled
                    "warning" // Default for 'Placed' or others
                  } text-dark`}>
                    {order.status || "Pending"} {/* Display status or Pending if null */}
                  </span>
                </td>
                <td>
                  {/* ADDED CONDITIONAL RENDERING FOR BUTTONS */}
                  {order.status === "Completed" ? (
                    <span className="text-success fw-bold">Completed</span>
                  ) : order.status === "Canceled" ? (
                     <span className="text-danger fw-bold">Canceled</span> // Display Canceled status text
                  ) : (
                    <> {/* Use Fragment to hold multiple buttons */}
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleComplete(order._id)}
                        className="me-2" // Add margin to the right of Mark Completed button
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="outline-danger" // Use danger variant for Cancel button
                        size="sm"
                        onClick={() => handleCancel(order._id)} // Call the new handleCancel function
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4"> {/* Increased colspan */}
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Admin;