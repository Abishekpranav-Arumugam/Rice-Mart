// src/components/Admin.js
import React, { useEffect, useState } from "react";
import { Table, Container, Alert, Button, Form, Row, Col, Pagination } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Admin = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15;

  useEffect(() => {
    const fetchOrders = async () => {
      setError(null);
      try {
        const response = await axios.get("https://rice-mart.onrender.com/api/admin/all-orders");
        if (Array.isArray(response.data)) {
          setAllOrders(response.data);
        } else {
          console.error("Admin: Unexpected response format:", response.data);
          setError("Received unexpected data format from server.");
          setAllOrders([]);
        }
      } catch (err) {
        console.error("Admin: Error fetching all orders:", err);
        setError(err.response?.data?.message || err.response?.statusText || "Failed to fetch orders.");
        setAllOrders([]);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let tempOrders = [...allOrders];

    if (selectedStatus !== "All") {
      tempOrders = tempOrders.filter(order => {
        if (selectedStatus === "Completed") {
          return order.status === "Completed" || order.status === "Delivered";
        }
        return order.status === selectedStatus;
      });
    }

    if (fromDate) {
      const filterFromDate = new Date(fromDate);
      filterFromDate.setHours(0, 0, 0, 0);
      tempOrders = tempOrders.filter(order => new Date(order.createdAt) >= filterFromDate);
    }
    if (toDate) {
      const filterToDate = new Date(toDate);
      filterToDate.setHours(23, 59, 59, 999);
      tempOrders = tempOrders.filter(order => new Date(order.createdAt) <= filterToDate);
    }

    setFilteredOrders(tempOrders);
    setCurrentPage(1);
  }, [selectedStatus, fromDate, toDate, allOrders]);

  const getAuthToken = async () => {
    if (!user) {
      setError("Admin actions require authentication. Please log in as admin.");
      return null;
    }
    try { return await user.getIdToken(); }
    catch (tokenError) { setError("Failed to get authentication token."); return null;}
  };

  const handleAdminStatusUpdate = async (orderId, newStatus) => {
    setError(null); setSuccess("");
    const token = await getAuthToken();
    if (!token) return;
    try {
      await axios.put(`https://rice-mart.onrender.com/api/orders/${orderId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setAllOrders(prevOrders => prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      setSuccess(`Order ${orderId} status updated to ${newStatus.toLowerCase()}.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.response?.data?.message || `Failed to update to ${newStatus}.`);}
  };

  const handleComplete = (orderId) => handleAdminStatusUpdate(orderId, "Completed");
  const handleCancelByAdmin = (orderId) => handleAdminStatusUpdate(orderId, "Canceled");

  const countFilteredOrdersByStatus = (statusType) => {
    return filteredOrders.filter(order => 
        statusType === "Completed/Delivered" ? (order.status === "Completed" || order.status === "Delivered") : order.status === statusType
    ).length;
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrdersToDisplay = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

    const handleDownloadPDF = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to download for the current filter.");
      return;
    }

    const doc = new jsPDF();
    let currentY = 15;

    doc.setFontSize(20); 
    doc.setFont("helvetica", "bold"); 
    doc.text("Sri Sivakami Traders", 14, currentY);
    currentY += 8; 

    doc.setFontSize(16); 
    doc.setFont("helvetica", "normal"); 
    doc.text("Order Report", 14, currentY);
    currentY += 10; 

    doc.setFontSize(11);
    let filterTextY = currentY; 
    const statusDisplay = selectedStatus === "Completed" ? "Completed/Delivered" : selectedStatus;
    doc.text(`Status: ${statusDisplay}`, 14, filterTextY);
    filterTextY += 6;
    doc.text(`Date Range: ${fromDate ? fromDate.toLocaleDateString() : 'Any'} - ${toDate ? toDate.toLocaleDateString() : 'Any'}`, 14, filterTextY);
    filterTextY += 10; 

    const tableColumn = ["Order ID", "Product(s)", "Total Qty", "Total Price", "Customer", "Email", "Placed At", "Status"];
    const tableRows = [];

    filteredOrders.forEach(order => {
      let productsString = "N/A";
      if (order.cartItems && order.cartItems.length > 0) {
          productsString = order.cartItems.map(item =>
              `${item.name} (x${item.quantity || 1} kg) - ₹${item.price != null ? item.price.toFixed(2) : 'N/A'}`
          ).join('\n');
      } else if (order.productName) {
          productsString = `${order.productName} (x${order.quantity || 1} kg) - ₹${order.price != null ? order.price.toFixed(2) : 'N/A'}`;
      }

      const totalQuantity = order.cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.quantity || 0;

      const orderData = [
        order._id,
        productsString,
        totalQuantity,
        `₹${order.totalPrice != null ? order.totalPrice.toFixed(2) : 'N/A'}`,
        order.userDetails?.name || "N/A",
        order.userDetails?.email || "N/A",
        new Date(order.createdAt).toLocaleString(),
        order.status || "Pending"
      ];
      tableRows.push(orderData);
    });

    autoTable(doc, { 
      head: [tableColumn],
      body: tableRows,
      startY: filterTextY, 
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 'auto' },
      }
    });

    doc.save(`orders_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };


  return (
    // Apply background color to the wrapping div of the Fragment
    <div style={{ backgroundColor: '#E0F7FA', minHeight: '100vh' }}> 
      <Container className="mt-5 pt-4 pb-5">
        <h2 className="my-4 text-center">ALL CUSTOMER ORDERS</h2>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

        <Form className="mb-4 p-3 bg-light border rounded-lg shadow-sm">
          <Row className="align-items-end gy-3 gx-3">
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
                  minDate={fromDate}
                  className="form-control form-control-sm text-xs sm:text-sm"
                  placeholderText="End date"
                  isClearable
                  dateFormat="MM/dd/yyyy"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={12} lg={3}> 
                <Row className="gy-2 align-items-end">
                    <Col xs={12}>
                        <Button
                            variant="primary" 
                            onClick={handleDownloadPDF}
                            disabled={filteredOrders.length === 0}
                            className="w-100" 
                        >
                            Download Filtered PDF
                        </Button>
                    </Col>
                    <Col xs={12}>
                        {(fromDate || toDate || selectedStatus !== "All" || (allOrders.length > 0 && filteredOrders.length < allOrders.length) || (filteredOrders.length > 0 && selectedStatus === "All" && !fromDate && !toDate) ) && (
                             <div className="text-muted text-start small mt-1" style={{ fontSize: '0.75rem' }}>
                                Filtered: {filteredOrders.length} order(s)
                                {selectedStatus === "All" && filteredOrders.length > 0 && 
                                  ` (Completed: ${countFilteredOrdersByStatus("Completed/Delivered")}, Canceled: ${countFilteredOrdersByStatus("Canceled")})`
                                }
                                {selectedStatus !== "All" && filteredOrders.length > 0 && 
                                  ` (${selectedStatus === "Completed" ? "Completed/Delivered" : selectedStatus}: ${filteredOrders.length})`
                                }
                             </div>
                        )}
                    </Col>
                </Row>
            </Col>
          </Row>
        </Form>

        <Table striped bordered hover responsive className="shadow-sm">
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
            {currentOrdersToDisplay.length > 0 ? (
              currentOrdersToDisplay.map((order) => (
                <tr key={order._id}>
                  <td><code>{order._id}</code></td>
                  <td>
                    {order.cartItems && order.cartItems.length > 0 ? (
                      <ul className="list-unstyled mb-0 small">
                        {order.cartItems.map((item, idx) => (
                          <li key={idx} className={idx > 0 ? "mt-1 pt-1 border-top text-nowrap" : "text-nowrap"}>
                            {item.name} (x{item.quantity || 1} kg)
                            <br/> 
                            <span className="text-muted">
                              ₹{item.price != null ? item.price.toFixed(2) : 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : ( 
                        order.productName ? 
                        <span className="text-nowrap">
                          {order.productName} (x{order.quantity || 1} kg) <br/> 
                          <span className="text-muted">
                            ₹{order.price != null ? order.price.toFixed(2) : 'N/A'}
                          </span>
                        </span>
                        : "N/A"
                    )}
                  </td>
                  <td className="text-center">
                    {order.cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.quantity || 0}
                  </td>
                  <td className="text-end">₹{order.totalPrice?.toFixed(2) || 'N/A'}</td>
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
                  {allOrders.length === 0 && !error && selectedStatus === "All" && !fromDate && !toDate
                    ? "No orders found in the system."
                    : "No orders match your current filter criteria."
                  }
                </td>
              </tr>
            )}
          </tbody>
        </Table>

         {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages).keys()].map(number => (
                <Pagination.Item 
                  key={number + 1} 
                  active={number + 1 === currentPage} 
                  onClick={() => paginate(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
        )}
      </Container>

      <footer className="py-4 mt-auto">
        <Container>
          <div className="bg-dark text-white text-center p-3 rounded shadow">
            <p className="mb-0">© {new Date().getFullYear()} Sri Sivakami Traders. All Rights Reserved.</p>
          </div>
        </Container>
      </footer>
    </div> // Close the wrapping div
  );
};

export default Admin;