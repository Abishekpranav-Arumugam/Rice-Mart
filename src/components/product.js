// src/components/Product.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the new detailed data
import { riceDetailsData } from './data'; // Adjust path if data.js is elsewhere

// Image imports
import img1 from "./basmati.jpeg";
import img2 from "./Jasmine.jpeg";
import img3 from "./red1.jpeg";
import img4 from "./mogra.jpeg";
import img5 from "./brown.jpeg";
import img6 from "./black.jpeg";
import img7 from "./Sona.jpeg";
import img8 from "./Ambemohar.jpeg";
import img9 from "./kala.jpeg";
import img10 from "./Bambo.jpeg";
const img_idly_placeholder = img5;
const img_dosa_placeholder = img4;

const productsData = [
  { id: 1, name: "Basmati Rice", description: "Long-grain, aromatic rice for Biryani.", price: 100, imageUrl: img1, category: "Biryani" },
  { id: 2, name: "Jasmine Rice", description: "Fragrant rice, ideal for Asian dishes.", price: 150, imageUrl: img2, category: "General" },
  { id: 3, name: "Red Rice", description: "Nutritious rice with a nutty flavor.", price: 200, imageUrl: img3, category: "General" },
  { id: 4, name: "Mogra Rice", description: "Broken Basmati, good for kheer.", price: 250, imageUrl: img4, category: "General" },
  { id: 5, name: "Brown Rice", description: "Whole grain rice, high in fiber.", price: 300, imageUrl: img5, category: "General" },
  { id: 6, name: "Black Rice", description: "Forbidden rice, rich in antioxidants.", price: 350, imageUrl: img6, category: "General" },
  { id: 7, name: "Sona Masuri Rice", description: "Lightweight and aromatic, for daily use.", price: 400, imageUrl: img7, category: "General" },
  { id: 8, name: "Ambemohar Rice", description: "Fragrant short-grain rice from Maharashtra.", price: 450, imageUrl: img8, category: "General" },
  { id: 9, name: "Kala Jeera Rice", description: "Short-grain aromatic rice for pulao/biryani.", price: 500, imageUrl: img9, category: "Biryani" },
  { id: 10, name: "Bamboo Rice", description: "Unique rice grown from bamboo shoots.", price: 550, imageUrl: img10, category: "General" },
  { id: 11, name: "Premium Idly Rice", description: "Parboiled rice perfect for soft, fluffy idlis.", price: 120, imageUrl: img_idly_placeholder, category: "Idly" },
  { id: 12, name: "Crispy Dosa Rice", description: "Raw rice blend ideal for making crispy dosas.", price: 110, imageUrl: img_dosa_placeholder, category: "Dosa" },
  { id: 13, name: "Seeraga Samba Rice", description: "Tiny aromatic rice, for South Indian Biryani.", price: 180, imageUrl: img1, category: "Biryani" },
];


const Product = () => {
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);

  const [userDetails, setUserDetails] = useState({
    name: '', email: '', phone: '', address: '', quantity: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('All');

  useEffect(() => {
    if (user && user.email) {
      setUserDetails((prev) => ({ ...prev, email: user.email }));
    } else {
      setUserDetails((prev) => ({ ...prev, email: '' }));
    }
  }, [user]);

  const handleBuyNow = (product) => {
    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }
    setSelectedProduct(product);
    setUserDetails(prev => ({ ...prev, name: '', phone: '', address: '', quantity: 1, email: user?.email || '' }));
    setShowForm(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? (parseInt(value, 10) > 0 ? parseInt(value, 10) : 1) : value,
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to place an order.');
      return;
    }
    if (!userDetails.name.trim() || !userDetails.phone.trim() || !userDetails.address.trim()) {
      toast.error('Please fill out all required fields (Name, Phone, Address).');
      return;
    }
    const orderPayload = {
      productName: selectedProduct.name,
      description: selectedProduct.description,
      totalPrice: selectedProduct.price * userDetails.quantity,
      quantity: userDetails.quantity,
      userDetails: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address,
      }
    };
    try {
      const token = await user.getIdToken();
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        return;
      }
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      });
      if (response.ok) {
        toast.success('Order placed successfully!');
        setShowForm(false);
        setUserDetails({ name: '', email: user?.email || '', phone: '', address: '', quantity: 1 });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place order.' }));
        console.error("Error placing order (backend response):", errorData);
        toast.error(`Failed to place order: ${errorData.message || response.statusText || 'Unknown server error'}`);
      }
    } catch (error) {
      console.error('Network Error or other error during handleSubmitOrder:', error);
      toast.error('Network error or issue placing order. Please try again.');
    }
  };

  const handleCloseForm = () => setShowForm(false);
  const handleProductAddToCart = (product) => addToCart(product);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setSearchTerm('');
  };

  const handleShowDetails = (product) => {
    const details = riceDetailsData.find(detail => detail.id === product.id);
    setSelectedProductForDetails(product);
    setDetailedInfo(details);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProductForDetails(null);
    setDetailedInfo(null);
  };

  const getFilteredProducts = () => {
    let productsToDisplay = productsData;
    if (currentCategory !== 'All') {
      productsToDisplay = productsData.filter(product => product.category === currentCategory);
    }
    if (searchTerm.trim() !== '') {
      productsToDisplay = productsToDisplay.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return productsToDisplay;
  };

  const filteredProducts = getFilteredProducts();
  const categories = ['All', 'Biryani', 'Idly', 'Dosa', 'General'];

  return (
    <div style={{ minHeight: '100vh', background: '#ADD8E6', padding: '20px 0' }}>
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Category buttons */}
        <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 my-1 rounded-lg font-medium transition-colors duration-200 ${
                currentCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-500'
              }`}
            >
              {category === 'All' ? 'All Rice' : `${category} Rice`}
            </button>
          ))}
        </div>

        {/* Search Bar - MODIFIED STRUCTURE */}
        <div className="mb-8 flex justify-center">
          <label
            htmlFor="productSearchInput"
            className="flex items-center w-full max-w-lg bg-white border border-gray-400 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
          >
            <span className="pl-3 pr-2 py-3"> {/* Container for the icon */}
              <svg
                className="h-5 w-5 text-gray-500" // Slightly darker icon color for visibility
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              id="productSearchInput" // ID for the label association
              placeholder={`Search within ${currentCategory === 'All' ? 'all rice' : currentCategory + ' rice'}...`}
              className="flex-grow py-3 pr-3 border-none focus:outline-none focus:ring-0 text-lg placeholder-gray-500" // Input takes remaining space, no internal border/ring
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </label>
        </div>

        {/* Single Card Container for Products */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-center text-gray-800">
            {currentCategory === 'All' ? 'Our Rice Collection' : `${currentCategory} Rice Selection`}
          </h2>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => {
                const productInCart = cart.find(item => item.id === product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-gray-50 p-5 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col justify-between border border-gray-200"
                  >
                    <div>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-52 object-cover rounded-lg mb-4"
                      />
                      <h3
                        className="text-xl font-semibold mb-1 text-gray-800 cursor-pointer hover:text-blue-600"
                        onClick={() => handleShowDetails(product)}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-sm text-gray-600 mb-2 h-12 overflow-hidden cursor-pointer hover:text-blue-500"
                        onClick={() => handleShowDetails(product)}
                      >
                        {product.description}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2 mb-4">₹{product.price}</p>
                    </div>
                    <div className="flex flex-col space-y-3 mt-auto">
                      {productInCart ? (
                        <div className="flex items-center justify-between space-x-1 sm:space-x-2">
                          <button className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-bold text-xl flex items-center justify-center" onClick={() => decreaseQuantity(product.id)} aria-label={`Decrease quantity of ${product.name}`}>-</button>
                          <span className="text-lg font-medium w-10 sm:w-12 text-center" aria-live="polite">{productInCart.quantity}</span>
                          <button className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-bold text-xl flex items-center justify-center" onClick={() => increaseQuantity(product.id)} aria-label={`Increase quantity of ${product.name}`}>+</button>
                        </div>
                      ) : (
                        <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium" onClick={() => handleProductAddToCart(product)} > Add to Cart </button>
                      )}
                      <button className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium" onClick={() => handleBuyNow(product)} > Buy Now </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-xl py-10">No products found matching your criteria...</p>
          )}
        </div> {/* End of Single Card Container for Products */}


        {/* Order Form Modal ("Buy Now") */}
        {showForm && selectedProduct && (
          // MODIFIED className to add top-16 positioning
          <div className="fixed top-16 inset-x-0 bottom-0 z-[100] flex justify-center items-center bg-black bg-opacity-60 p-4 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md my-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Order: {selectedProduct.name}</h3>
                <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-800 text-2xl font-bold"> × </button>
              </div>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label htmlFor="form_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" id="form_name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={userDetails.name} onChange={handleFormInputChange} required />
                </div>
                <div>
                  <label htmlFor="form_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="form_email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" value={userDetails.email} readOnly />
                </div>
                <div>
                  <label htmlFor="form_phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" id="form_phone" name="phone" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={userDetails.phone} onChange={handleFormInputChange} required pattern="[0-9]{10,15}" title="Please enter a valid phone number (10-15 digits)" />
                </div>
                <div>
                  <label htmlFor="form_address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea id="form_address" name="address" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={userDetails.address} onChange={handleFormInputChange} required />
                </div>
                <div>
                  <label htmlFor="form_quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" id="form_quantity" name="quantity" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value={userDetails.quantity} onChange={handleFormInputChange} min="1" required />
                </div>
                <p className="text-lg font-semibold text-right text-gray-800">Total: ₹{(selectedProduct.price * userDetails.quantity).toFixed(2)}</p>
                <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-300 font-semibold shadow-md"> Place Order </button>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetailsModal && selectedProductForDetails && detailedInfo && (
          // MODIFIED className to add top-16 positioning
          <div className="fixed top-16 inset-x-0 bottom-0 z-[100] flex justify-center items-center bg-black bg-opacity-75 p-4 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl my-auto max-h-[calc(100vh-8rem)] overflow-y-auto"> {/* Adjusted max-height slightly */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{detailedInfo.name}</h2>
                   <img src={selectedProductForDetails.imageUrl} alt={detailedInfo.name} className="w-full h-60 object-contain rounded-md my-4"/>
                </div>
                <button onClick={handleCloseDetailsModal} className="text-gray-600 hover:text-gray-900 text-3xl font-semibold leading-none" aria-label="Close details" > × </button>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-1">Health Benefits:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {detailedInfo.healthBenefits.map((benefit, index) => ( <li key={`benefit-${index}`}>{benefit}</li> ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-1">Contents:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {detailedInfo.contents.map((content, index) => ( <li key={`content-${index}`}>{content}</li> ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-1">Usage:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {detailedInfo.usage.map((use, index) => ( <li key={`use-${index}`}>{use}</li> ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-1">Dishes:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {detailedInfo.dishes.map((dish, index) => ( <li key={`dish-${index}`}>{dish}</li> ))}
                  </ul>
                </div>
              </div>
              <button onClick={handleCloseDetailsModal} className="mt-6 w-full bg-gray-500 text-white py-2.5 rounded-lg hover:bg-gray-600 transition-colors duration-300 font-medium" > Close </button>
            </div>
          </div>
        )}


        <hr className="my-12 border-t border-gray-400" />
        <footer className="bg-gray-800 text-white text-center py-6 rounded-lg">
          <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
        </footer>
        <ToastContainer position="bottom-left" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </div>
    </div>
  );
};

export default Product;