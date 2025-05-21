import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();

  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => setShowCart(false);
  const handleShow = () => setShowCart(true);

  useEffect(() => {
    if (user && user.email) {
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        email: user.email,
      }));
    } else {
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        email: '',
      }));
    }
  }, [user]);

  const handleOrderNow = () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }
    if (cart.length === 0) {
      toast.info("Your cart is empty. Please add items to proceed.");
      return;
    }
    setUserDetails(prev => ({
      name: '',
      email: user?.email || '',
      phone: '',
      address: ''
    }));
    setShowOrderForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!userDetails.name.trim()) errors.name = 'Name is required.';
    if (!userDetails.email.trim()) errors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(userDetails.email))
      errors.email = 'Enter a valid email.';
    if (!userDetails.phone.trim()) errors.phone = 'Phone number is required.';
    if (!userDetails.address.trim()) errors.address = 'Address is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    const orderPayload = {
      cartItems: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice: getTotalPrice(),
      userDetails: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
      },
    };

    setIsLoading(true);
    try {
      const token = await user.getIdToken();

      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://rice-mart12.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        toast.success('Order placed successfully!');
        clearCart();
        setUserDetails({
          name: '',
          email: user?.email || '',
          phone: '',
          address: '',
        });
        setShowOrderForm(false);
        setShowCart(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error occurred."}));
        console.error("Failed to place order from cart (backend error):", errorData);
        toast.error(`Failed to place order: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Network Error or other error placing order from cart:', error);
      toast.error('Network error occurred. Please ensure the server is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Cart Button */}
      <div
        onClick={handleShow}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 z-40"
      >
        <FaShoppingCart size={30} />
      </div>

      {/* Cart Modal */}
      <Modal show={showCart} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((product) => (
                <div key={product.id + '-' + product.name} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{product.name}</h5>
                    <p className="mb-0">Price: ₹{product.price?.toFixed(2)} × {product.quantity}</p>
                    <p className="fw-bold">Subtotal: ₹{(product.price * product.quantity).toFixed(2)}</p>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={() => removeFromCart(product.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="d-flex justify-content-end align-items-center mt-3">
                <h4 className="mb-0">Total: ₹{getTotalPrice().toFixed(2)}</h4>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Continue Shopping
          </Button>
          <Button
            variant="primary"
            onClick={handleOrderNow}
            disabled={cart.length === 0 || isLoading}
          >
            {isLoading ? 'Processing...' : 'Buy Now'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Form Modal for Cart Checkout */}
      {showOrderForm && (
        <Modal show={showOrderForm} onHide={() => setShowOrderForm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Enter Your Delivery Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmitOrder}>
              <div className="mb-3">
                <label htmlFor="cart-name" className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                  id="cart-name"
                  name="name"
                  value={userDetails.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="cart-email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''} bg-light`}
                  id="cart-email"
                  name="email"
                  value={userDetails.email}
                  readOnly
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="cart-phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                  id="cart-phone"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10,15}"
                  title="Please enter a valid phone number (10-15 digits)"
                />
                {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="cart-address" className="form-label">Delivery Address</label>
                <textarea
                  className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                  id="cart-address"
                  name="address"
                  rows="3"
                  value={userDetails.address}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {/* ***** MODIFICATION HERE FOR TOAST POSITION ***** */}
      <ToastContainer
        position="top-center"     // YOUR DESIRED DEFAULT POSITION
        autoClose={3000}          // Your desired default auto-close time
        hideProgressBar={false}
        newestOnTop={true}        // Good for visibility
        closeOnClick              // Allows closing by clicking the toast body
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"             // Or "dark" or "colored"
        // closeButton={true}     // Default: has close button, can be overridden per toast
      />
      {/* ***** END OF MODIFICATION ***** */}
    </>
  );
};

export default Cart;