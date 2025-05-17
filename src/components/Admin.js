// src/components/Admin.js
import React, { useEffect, useState } from "react";
import { Table, Container, Alert, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Admin = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState(null); // Renamed from selectedDate
  const [toDate, setToDate] = useState(null);   // New state for "To Date"

  useEffect(() => {
    const fetchOrders = async () => {
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/admin/all-orders");
        if (Array.isArray(response.data)) {
          setAllOrders(response.data);
          setFilteredOrders(response.data);
        } else {
          console.error("Admin: Unexpected response format:", response.data);
          setError("Received unexpected data format from server.");
          setAllOrders([]); setFilteredOrders([]);
        }
      } catch (err) {
        console.error("Admin: Error fetching all orders:", err);
        setError(err.response?.data?.message || err.response?.statusText || "Failed to fetch orders.");
        setAllOrders([]); setFilteredOrders([]);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let tempOrders = [...allOrders];

    if (selectedStatus !== "All") {
      tempOrders = tempOrders.filter(order => order.status === selectedStatus);
    }

    if (fromDate) {
      tempOrders = tempOrders.filter(order => new Date(order.createdAt) >= new Date(fromDate.setHours(0,0,0,0))); // Start of fromDate
    }
    if (toDate) {
      tempOrders = tempOrders.filter(order => new Date(order.createdAt) <= new Date(toDate.setHours(23,59,59,999))); // End of toDate
    }

    setFilteredOrders(tempOrders);
  }, [selectedStatus, fromDate, toDate, allOrders]);

  const getAuthToken = async () => {
    // ... (same as before)
    if (!user) {
      setError("Admin actions require authentication. Please log in as admin.");
      return null;
    }
    try { return await user.getIdToken(); }
    catch (tokenError) { setError("Failed to get authentication token."); return null;}
  };

  const handleAdminStatusUpdate = async (orderId, newStatus) => {
    // ... (same as before)
    setError(null); setSuccess("");
    const token = await getAuthToken();
    if (!token) return;
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setAllOrders(prevOrders => prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      setSuccess(`Order ${orderId} status updated to ${newStatus.toLowerCase()}.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.response?.data?.message || `Failed to update to ${newStatus}.`);}
  };

  const handleComplete = (orderId) => handleAdminStatusUpdate(orderId, "Completed");
  const handleCancelByAdmin = (orderId) => handleAdminStatusUpdate(orderId, "Canceled");

  const countFilteredOrdersByStatus = (status) => {
    return filteredOrders.filter(order => 
        status === "Completed/Delivered" ? (order.status === "Completed" || order.status === "Delivered") : order.status === status
    ).length;
  };


  return (
    <Container className="mt-5 pt-4">
      <h2 className="my-4 text-center">ALL CUSTOMER ORDERS</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Filter Controls in a straight line */}
      <Form className="mb-4 p-3 bg-light border rounded-lg shadow-sm">
        <Row className="align-items-end gy-2 gx-3"> {/* gy-2 for vertical gap on small screens, gx-3 for horizontal */}
          <Col xs={12} md={4} lg={3}>
            <Form.Group controlId="adminStatusFilter">
              <Form.Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Status:</Form.Label>
              <Form.Select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select-sm text-xs sm:text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed/Delivered</option>
                <option value="Canceled">Canceled</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={3}>
            <Form.Group controlId="adminFromDateFilter">
              <Form.Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">From Date (Placed):</Form.Label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                selectsStart
                startDate={fromDate}
                endDate={toDate}
                className="form-control form-control-sm text-xs sm:text-sm"
                placeholderText="Start date"
                isClearable
                dateFormat="MM/dd/yyyy"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={3}>
            <Form.Group controlId="adminToDateFilter">
              <Form.Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">To Date (Placed):</Form.Label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                selectsEnd
                startDate={fromDate}
                endDate={toDate}
                minDate={fromDate} // Prevent selecting "to date" before "from date"
                className="form-control form-control-sm text-xs sm:text-sm"
                placeholderText="End date"
                isClearable
                dateFormat="MM/dd/yyyy"
              />
            </Form.Group>
          </Col>
           <Col xs={12} lg={3} className="pt-2 pt-lg-0"> {/* Added pt-2 for small screens, reset for lg */}
            {(fromDate || toDate || selectedStatus !== "All") && (
                 <div className="text-xs text-gray-600 text-start"> {/* Aligned summary to start */}
                    Showing: {filteredOrders.length} orders <br/>
                    {selectedStatus === "All" && `(Completed: ${countFilteredOrdersByStatus("Completed/Delivered")}, Canceled: ${countFilteredOrdersByStatus("Canceled")})`}
                    {selectedStatus !== "All" && `(${selectedStatus}: ${filteredOrders.length})`}
                 </div>
            )}
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive className="shadow-sm">
        {/* ... Table thead and tbody remain the same as your previous Admin.js ... */}
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Product(s)</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Placed At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order._id}>
                <td><code>{order._id}</code></td>
                <td>
                  {order.cartItems && order.cartItems.length > 0 ? (
                    <ul className="list-unstyled mb-0 small">
                      {order.cartItems.map((item, idx) => (
                        <li key={idx} className={idx > 0 ? "mt-1 pt-1 border-top text-nowrap" : "text-nowrap"}>
                          {item.name} (x{item.quantity || 1})
                          <br/> <span className="text-muted">₹{item.price?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-nowrap">{order.productName || "N/A"}</span>
                  )}
                </td>
                <td className="text-center">
                  {order.cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.quantity || 0}
                </td>
                <td className="text-end">₹{order.totalPrice?.toFixed(2)}</td>
                <td className="text-nowrap">{order.userDetails?.name || "N/A"}</td>
                <td className="text-nowrap">{order.userDetails?.email || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`badge bg-${
                    order.status === "Completed" || order.status === "Delivered" ? "success" :
                    order.status === "Canceled" ? "danger" :
                    "warning" 
                  } text-dark`}>
                    {order.status || "Pending"}
                  </span>
                </td>
                <td>
                  {(order.status === "Completed" || order.status === "Delivered") ? (
                    <span className="text-success fw-bold">Completed</span>
                  ) : order.status === "Canceled" ? (
                     <span className="text-danger fw-bold">Canceled</span>
                  ) : (
                    <>
                      <Button variant="outline-success" size="sm" onClick={() => handleComplete(order._id)} className="me-2 mb-1" disabled={!user} > Mark Comp. </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleCancelByAdmin(order._id)} className="mb-1" disabled={!user} > Cancel </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4">
                { allOrders.length === 0 && !error ? "No orders found." : "No orders match your filter criteria." }
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Admin;