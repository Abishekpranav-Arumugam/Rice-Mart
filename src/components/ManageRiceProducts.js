// src/components/ManageRiceProducts.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Form, Container, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlus, FaBoxes } from 'react-icons/fa';

const ManageRiceProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '', description: '', originalPrice: '', discountPercentage: '0', imageUrl: '', category: 'General',
  });

  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [productForStockUpdate, setProductForStockUpdate] = useState(null);
  const [quantityToPopulate, setQuantityToPopulate] = useState('');
  const [isPopulatingStock, setIsPopulatingStock] = useState(false);


  const API_URL_PRODUCTS = 'https://rice-mart.onrender.com/api/riceproducts';
  const API_URL_STOCKS_POPULATE = 'https://rice-mart.onrender.com/api/stocks/populate';


  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL_PRODUCTS);
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


  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const resetProductForm = () => {
    setCurrentProduct({ name: '', description: '', originalPrice: '', discountPercentage: '0', imageUrl: '', category: 'General' });
  };

  const handleShowAddProductModal = () => {
    setIsEditMode(false);
    resetProductForm();
    setShowProductModal(true);
  };

  const handleShowEditProductModal = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
        ...product,
        originalPrice: product.originalPrice.toString(),
        discountPercentage: (product.discountPercentage || 0).toString()
    });
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setError('');
  };

  const handleProductSubmit = async (e) => {
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
      imageUrl: currentProduct.imageUrl,
      category: currentProduct.category,
    };

    if (isNaN(productData.originalPrice) || productData.originalPrice <= 0) {
      setError("Original Price must be a positive number."); toast.error("Original Price must be a positive number."); return;
    }
    if (isNaN(productData.discountPercentage) || productData.discountPercentage < 0 || productData.discountPercentage > 100) {
      setError("Discount Percentage must be between 0 and 100."); toast.error("Discount Percentage must be between 0 and 100."); return;
    }
    if (!productData.name || !productData.description || !productData.imageUrl || !productData.category) {
      setError("All fields (Name, Description, Image URL, Category, Original Price) are required."); toast.error("Name, Description, Image URL, Category, Price are required."); return;
    }
    try { new URL(productData.imageUrl); } 
    catch (_) { setError("Invalid Image URL format."); toast.error("Invalid Image URL format."); return; }

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${API_URL_PRODUCTS}/${currentProduct._id}` : API_URL_PRODUCTS;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}`},
        body: JSON.stringify(productData),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      
      toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
      fetchProducts();
      handleCloseProductModal();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This will also delete its stock record.`)) return;
    if (!user) { toast.error("Authentication required."); return; }
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_URL_PRODUCTS}/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete product');
      }
      toast.success(`Product "${productName}" and its stock record deleted successfully!`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const handleShowAddStockModal = (product) => {
    setProductForStockUpdate(product);
    setQuantityToPopulate('');
    setShowAddStockModal(true);
  };

  const handleCloseAddStockModal = () => {
    setShowAddStockModal(false);
    setProductForStockUpdate(null);
    setQuantityToPopulate('');
  };

  const handlePopulateStockSubmit = async (e) => {
    e.preventDefault();
    if (!productForStockUpdate || !user) {
        toast.error("Product context or user authentication missing.");
        return;
    }
    const quantity = parseInt(quantityToPopulate, 10);
    if (isNaN(quantity) || quantity <= 0) {
        toast.error('Please enter a valid positive quantity to add.');
        return;
    }

    setIsPopulatingStock(true);
    try {
        const idToken = await user.getIdToken();
        const response = await fetch(API_URL_STOCKS_POPULATE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                name: productForStockUpdate.name,
                quantity: quantity,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to populate stock.');
        }
        toast.success(data.message || `Successfully added ${quantity}kg to ${productForStockUpdate.name}.`);
        fetchProducts();
        handleCloseAddStockModal();
    } catch (err) {
        toast.error(`Error populating stock: ${err.message}`);
        console.error("Error populating stock:", err);
    } finally {
        setIsPopulatingStock(false);
    }
  };

  const productCategories = ['General', 'Biryani', 'Idly', 'Dosa'];

  return (
    // Apply background color to the Container. 
    // Adding 'fluid' prop to make it full width, and then style.
    // Also, minHeight to ensure it covers the viewport.
    <Container fluid style={{ backgroundColor: '#E0F7FA', minHeight: '100vh', paddingTop: '5rem', paddingBottom: '2rem' }}>
      <Container> {/* This inner container will respect standard bootstrap container widths */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="text-center">Manage Rice Products & Stock</h2>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={handleShowAddProductModal}>
              <FaPlus className="me-2" /> Add New Product
            </Button>
          </Col>
        </Row>

        {isLoading && <p className="text-center">Loading products...</p>}
        {!isLoading && error && !products.length && <Alert variant="danger" className="text-center">{error}</Alert>}
        {!isLoading && !products.length && !error && <p className="text-center">No products found. Add some!</p>}


        {products.length > 0 && (
          <Card className="shadow-sm">
            <Table striped bordered hover responsive className="m-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Discount</th>
                  <th style={{minWidth: '150px'}}>Description</th>
                  <th className="text-center">Available (kg)</th>
                  <th className="text-center" style={{minWidth: '220px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>
                      <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60?text=No+Img"; }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.originalPrice.toFixed(2)}</td>
                    <td>{product.discountPercentage || 0}%</td>
                    <td style={{maxWidth: '250px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem'}}>{product.description}</td>
                    <td className="text-center">
                      <Badge bg={product.available <= 50 ? (product.available === 0 ? "danger" : "warning") : "success"} pill>
                          {product.available}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" className="me-2 mb-1 mb-md-0" onClick={() => handleShowEditProductModal(product)} title="Edit Product Details">
                        <FaEdit /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button variant="outline-info" size="sm" className="me-2 mb-1 mb-md-0" onClick={() => handleShowAddStockModal(product)} title="Add Stock">
                          <FaBoxes /> <span className="d-none d-md-inline">Stock</span>
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteProduct(product._id, product.name)} title="Delete Product">
                        <FaTrashAlt /> <span className="d-none d-md-inline">Del</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Modal for ADDING/EDITING PRODUCT DETAILS */}
        <Modal show={showProductModal} onHide={handleCloseProductModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{isEditMode ? 'Edit' : 'Add New'} Rice Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleProductSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formProductName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" value={currentProduct.name} onChange={handleProductInputChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formProductCategory">
                      <Form.Label>Category</Form.Label>
                      <Form.Select name="category" value={currentProduct.category} onChange={handleProductInputChange} required>
                          {productCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                  <Col md={6}>
                      <Form.Group className="mb-3" controlId="formProductOriginalPrice">
                      <Form.Label>Original Price (₹)</Form.Label>
                      <Form.Control type="number" name="originalPrice" value={currentProduct.originalPrice} onChange={handleProductInputChange} required min="0.01" step="0.01" />
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                      <Form.Group className="mb-3" controlId="formProductDiscountPercentage">
                          <Form.Label>Discount (%)</Form.Label>
                          <Form.Control type="number" name="discountPercentage" value={currentProduct.discountPercentage} onChange={handleProductInputChange} min="0" max="100" step="1" placeholder="0" />
                      </Form.Group>
                  </Col>
              </Row>
              <Form.Group className="mb-3" controlId="formProductImageUrl">
                  <Form.Label>Image URL (Full public URL)</Form.Label>
                  <Form.Control type="url" name="imageUrl" value={currentProduct.imageUrl} onChange={handleProductInputChange} placeholder="https://example.com/your_image.jpg" required />
                  <Form.Text className="text-muted"> Enter the complete, publicly accessible URL for the product image. </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formProductDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={currentProduct.description} onChange={handleProductInputChange} required />
              </Form.Group>
              <div className="d-grid">
                <Button variant={isEditMode ? "warning" : "success"} type="submit">
                  {isEditMode ? 'Save Product Changes' : 'Add Product'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal for ADDING STOCK to a specific product */}
        <Modal show={showAddStockModal} onHide={handleCloseAddStockModal} centered>
          <Modal.Header closeButton>
              <Modal.Title>Add Stock for: <span className="fw-bold">{productForStockUpdate?.name}</span></Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <p>Current Available: <strong>{productForStockUpdate?.available} kg</strong></p>
              <hr/>
              <Form onSubmit={handlePopulateStockSubmit}>
                  <Form.Group className="mb-3" controlId="formQuantityToPopulate">
                      <Form.Label>Quantity to Add (kg)</Form.Label>
                      <Form.Control
                          type="number"
                          value={quantityToPopulate}
                          onChange={(e) => setQuantityToPopulate(e.target.value)}
                          min="1"
                          required
                          placeholder="Enter quantity to add"
                      />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100" disabled={isPopulatingStock}>
                      {isPopulatingStock ? 'Adding...' : 'Add to Stock'}
                  </Button>
              </Form>
          </Modal.Body>
        </Modal>
      </Container> {/* End of inner standard Container */}
    </Container> // End of outer fluid Container with background
  );
};

export default ManageRiceProducts;