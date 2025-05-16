// src/components/ManageRiceProducts.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

const ManageRiceProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '', description: '', originalPrice: '', discountPercentage: '0', imageUrl: '', category: 'General',
  });

  const API_URL = 'http://localhost:5000/api/riceproducts';

  // fetchProducts, useEffect for fetch (no changes)
  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching products: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  // handleInputChange, resetForm, handleShowAddModal, handleShowEditModal, handleCloseModal (no changes)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const resetForm = () => {
    setCurrentProduct({ name: '', description: '', originalPrice: '', discountPercentage: '0', imageUrl: '', category: 'General' });
  };

  const handleShowAddModal = () => {
    setIsEditMode(false);
    resetForm();
    setShowModal(true);
  };

  const handleShowEditModal = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
        ...product,
        originalPrice: product.originalPrice.toString(),
        discountPercentage: (product.discountPercentage || 0).toString()
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  // handleSubmit, handleDelete (no changes in logic regarding imageUrl here)
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication required.");
      return;
    }
    setError('');

    const productData = {
      name: currentProduct.name,
      description: currentProduct.description,
      originalPrice: parseFloat(currentProduct.originalPrice),
      discountPercentage: parseFloat(currentProduct.discountPercentage || 0),
      imageUrl: currentProduct.imageUrl, // This will now be a full URL
      category: currentProduct.category,
    };

    if (isNaN(productData.originalPrice) || productData.originalPrice <= 0) {
      setError("Original Price must be a positive number.");
      toast.error("Original Price must be a positive number.");
      return;
    }
    if (isNaN(productData.discountPercentage) || productData.discountPercentage < 0 || productData.discountPercentage > 100) {
      setError("Discount Percentage must be between 0 and 100.");
      toast.error("Discount Percentage must be between 0 and 100.");
      return;
    }
    if (!productData.name || !productData.description || !productData.imageUrl || !productData.category) {
      setError("All fields (Name, Description, Image URL, Category, Original Price) are required.");
      toast.error("All fields (Name, Description, Image URL, Category, Original Price) are required.");
      return;
    }
     // Basic URL validation for imageUrl
    try {
        new URL(productData.imageUrl);
    } catch (_) {
        setError("Please enter a valid Image URL (e.g., https://example.com/image.jpg).");
        toast.error("Invalid Image URL format.");
        return;
    }

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${API_URL}/${currentProduct._id}` : API_URL;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    if (!user) {
      toast.error("Authentication required.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL}/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete product');
      }
      toast.success(`Product "${productName}" deleted successfully!`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const productCategories = ['General', 'Biryani', 'Idly', 'Dosa'];

  return (
    <Container className="mt-5 pt-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="text-center">Manage Rice Products</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal}>
            <FaPlus className="me-2" /> Add New Product
          </Button>
        </Col>
      </Row>

      {/* Loading, error, no products messages (no change) */}
      {isLoading && <p className="text-center">Loading products...</p>}
      {!isLoading && error && !products.length && <Alert variant="danger" className="text-center">{error}</Alert>}
      {!isLoading && !products.length && !error && <p className="text-center">No products found. Add some!</p>}


      {products.length > 0 && (
        <Card className="shadow-sm">
          <Table striped bordered hover responsive className="m-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Orig. Price (₹)</th>
                <th>Discount (%)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img 
                        src={product.imageUrl} // Directly use the URL from backend
                        alt={product.name} 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => { /* Optional: more robust fallback logic or different placeholder */
                            e.target.onerror = null; // prevent infinite loop if placeholder also fails
                            e.target.src = "https://via.placeholder.com/60?text=No+Img";
                        }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.originalPrice.toFixed(2)}</td>
                  <td>{product.discountPercentage || 0}%</td>
                  <td style={{maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{product.description}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2 mb-1 mb-md-0" onClick={() => handleShowEditModal(product)}>
                      <FaEdit /> Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id, product.name)}>
                      <FaTrashAlt /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit' : 'Add New'} Rice Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* Row 1: Name & Category (no change) */}
             <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" value={currentProduct.name} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                 <Form.Group className="mb-3" controlId="formProductCategory">
                    <Form.Label>Category</Form.Label>
                    <Form.Select name="category" value={currentProduct.category} onChange={handleInputChange} required>
                        {productCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Form.Select>
                 </Form.Group>
              </Col>
            </Row>

            {/* Row 2: Original Price & Discount (no change) */}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formProductOriginalPrice">
                    <Form.Label>Original Price (₹)</Form.Label>
                    <Form.Control type="number" name="originalPrice" value={currentProduct.originalPrice} onChange={handleInputChange} required min="0.01" step="0.01" />
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="formProductDiscountPercentage">
                        <Form.Label>Discount (%)</Form.Label>
                        <Form.Control type="number" name="discountPercentage" value={currentProduct.discountPercentage} onChange={handleInputChange} min="0" max="100" step="1" placeholder="0" />
                    </Form.Group>
                </Col>
            </Row>

            {/* MODIFIED Image URL Input */}
            <Form.Group className="mb-3" controlId="formProductImageUrl">
                <Form.Label>Image URL (Full public URL)</Form.Label>
                <Form.Control 
                    type="url" 
                    name="imageUrl" 
                    value={currentProduct.imageUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com/your_image.jpg" 
                    required 
                />
                <Form.Text className="text-muted">
                    Enter the complete, publicly accessible URL for the product image.
                </Form.Text>
            </Form.Group>

            {/* Description & Submit button (no change) */}
            <Form.Group className="mb-3" controlId="formProductDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={currentProduct.description} onChange={handleInputChange} required />
            </Form.Group>
            <div className="d-grid">
              <Button variant={isEditMode ? "warning" : "success"} type="submit">
                {isEditMode ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageRiceProducts;