// src/components/Product.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { riceDetailsData } from './data';

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

  const [backendProducts, setBackendProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productFetchError, setProductFetchError] = useState('');


  useEffect(() => {
    const fetchProductsFromBackend = async () => {
      setIsLoadingProducts(true);
      setProductFetchError('');
      try {
        const response = await fetch('https://rice-mart.onrender.com/api/riceproducts');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
          throw new Error(errorData.message || 'Failed to fetch products');
        }
        const data = await response.json();
        // data should now include 'available' and 'effectivePrice' from backend
        setBackendProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductFetchError(error.message);
        toast.error(`Failed to load products: ${error.message}`);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProductsFromBackend();
  }, []);

  useEffect(() => {
    if (user && user.email) {
      setUserDetails((prev) => ({ ...prev, email: user.email }));
    } else {
      setUserDetails((prev) => ({ ...prev, email: '' }));
    }
  }, [user]);

  const handleBuyNow = (product) => {
    if (!user) { toast.error("Please log in to place an order."); return; }
    setSelectedProduct({ ...product });
    setUserDetails(prev => ({ ...prev, name: '', phone: '', address: '', quantity: 1, email: user?.email || '' }));
    setShowForm(true);
  };

  const handleProductAddToCart = (product) => {
    addToCart({ ...product, id: product._id, price: product.effectivePrice }, 1);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: name === 'quantity' ? (parseInt(value, 10) > 0 ? parseInt(value, 10) : 1) : value, }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user || !selectedProduct) { toast.error('Authentication error or no product selected.'); return; }
    if (!userDetails.name.trim() || !userDetails.phone.trim() || !userDetails.address.trim()) { toast.error('Please fill out all required fields.'); return; }
    const itemPriceForOrder = selectedProduct.effectivePrice;
    const orderPayload = {
      productName: selectedProduct.name, description: selectedProduct.description,
      totalPrice: itemPriceForOrder * userDetails.quantity, quantity: userDetails.quantity,
      userDetails: { name: userDetails.name, email: userDetails.email, phone: userDetails.phone, address: userDetails.address, },
      cartItems: [{ productId: selectedProduct._id, name: selectedProduct.name, price: itemPriceForOrder, quantity: userDetails.quantity, imageUrl: selectedProduct.imageUrl }],
    };
    try {
      const token = await user.getIdToken();
      if (!token) { toast.error('Authentication error. Please log in again.'); return; }
      const response = await fetch('https://rice-mart.onrender.com/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(orderPayload),
      });
      if (response.ok) {
        toast.success('Order placed successfully!'); setShowForm(false);
        setUserDetails({ name: '', email: user?.email || '', phone: '', address: '', quantity: 1 }); setSelectedProduct(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place order.' }));
        toast.error(`Failed to place order: ${errorData.message || response.statusText || 'Unknown server error'}`);
      }
    } catch (error) { toast.error('Network error or issue placing order. Please try again.'); }
  };

  const handleShowDetails = (product) => {
    const details = riceDetailsData.find(detail => detail.name.toLowerCase() === product.name.toLowerCase());
    setSelectedProductForDetails(product); setDetailedInfo(details); setShowDetailsModal(true);
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleCategoryChange = (category) => { setCurrentCategory(category); setSearchTerm(''); };
  const handleCloseForm = () => { setShowForm(false); setSelectedProduct(null); };
  const handleCloseDetailsModal = () => { setShowDetailsModal(false); setSelectedProductForDetails(null); setDetailedInfo(null); };

  const getFilteredProducts = () => {
    let productsToDisplay = backendProducts;
    if (currentCategory !== 'All') productsToDisplay = productsToDisplay.filter(p => p.category === currentCategory);
    if (searchTerm.trim() !== '') productsToDisplay = productsToDisplay.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return productsToDisplay;
  };
  const filteredProducts = getFilteredProducts();
  const uniqueCategories = ['All', ...new Set(backendProducts.map(p => p.category))];


  if (isLoadingProducts) return <div style={{ minHeight: '100vh', background: '#ADD8E6', padding: '20px 0' }} className="pt-20 text-center text-xl">Loading products...</div>;
  if (productFetchError) return <div style={{ minHeight: '100vh', background: '#ADD8E6', padding: '20px 0' }} className="pt-20 text-center text-red-500 text-xl">Error: {productFetchError}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#ADD8E6', padding: '20px 0' }}>
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-6">
          {uniqueCategories.map(category => (
            <button key={category} onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 my-1 rounded-lg font-medium ${ currentCategory === category ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-500'}`}>
              {category === 'All' ? 'All Rice' : `${category} Rice`}
            </button>
          ))}
        </div>
        <div className="mb-8 flex justify-center">
          <label htmlFor="productSearchInput" className="flex items-center w-full max-w-lg bg-white border border-gray-400 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="pl-3 pr-2 py-3"><svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg></span>
            <input type="text" id="productSearchInput" placeholder={`Search ${currentCategory === 'All' ? 'all rice' : currentCategory + ' rice'}...`} className="flex-grow py-3 pr-3 border-none focus:outline-none focus:ring-0 text-lg placeholder-gray-500" value={searchTerm} onChange={handleSearchChange} />
          </label>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-center text-gray-800">
            {currentCategory === 'All' ? 'Our Rice Collection' : `${currentCategory} Rice Selection`}
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map((product) => {
                const productInCart = cart.find(item => item.id === product._id);
                const effectivePrice = product.effectivePrice;
                const hasDiscount = (product.discountPercentage || 0) > 0;

                const isLowStockOrUnavailable = product.available <= 50;

                return (
                  <div key={product._id} className="bg-gray-50 p-5 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col justify-between border">
                    <div>
                      <div className="relative">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-52 object-cover rounded-lg mb-4"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200.png?text=No+Image"; }}
                        />
                        {hasDiscount && !isLowStockOrUnavailable && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {product.discountPercentage}% OFF
                            </span>
                        )}
                        {isLowStockOrUnavailable && (
                          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center rounded-lg z-10">
                            <span className="text-white text-xl font-bold bg-red-600 px-4 py-2 rounded shadow-lg">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                      </div>
                      <h3
                        className={`text-xl font-semibold mb-1 text-gray-800 ${!isLowStockOrUnavailable ? 'cursor-pointer hover:text-blue-600' : 'text-gray-500'}`}
                        onClick={() => !isLowStockOrUnavailable && handleShowDetails(product)}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`text-sm text-gray-600 mb-2 h-10 overflow-hidden ${!isLowStockOrUnavailable ? 'cursor-pointer' : ''}`}
                        onClick={() => !isLowStockOrUnavailable && handleShowDetails(product)}
                      >
                        {product.description}
                      </p>
                      <div className="text-xl font-bold text-gray-900 mt-2 mb-1">
                        {hasDiscount ? (
                            <>
                                <span className="text-gray-500 line-through text-base me-2">
                                    ₹{product.originalPrice.toFixed(2)}
                                </span>
                                <span className="text-red-600">₹{effectivePrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span>₹{product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-4"> (per kg)</p>
                    </div>
                    <div className="flex flex-col space-y-3 mt-auto">
                       {isLowStockOrUnavailable ? (
                         <div className="text-center py-2 mt-2">
                           <p className="text-red-500 font-semibold">Currently Unavailable</p>
                         </div>
                       ) : productInCart ? (
                        <div className="flex items-center justify-between space-x-1 sm:space-x-2">
                          <button className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" onClick={() => decreaseQuantity(product._id)}>-</button>
                          <span className="text-lg font-medium">{productInCart.quantity} kg</span> {/* "kg" already here for product card */}
                          <button className="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" onClick={() => increaseQuantity(product._id)}>+</button>
                        </div>
                      ) : (
                        <button
                          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          onClick={() => handleProductAddToCart(product)}
                          disabled={isLowStockOrUnavailable}
                        >
                          Add to Cart
                        </button>
                      )}
                      <button
                        className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        onClick={() => handleBuyNow(product)}
                        disabled={isLowStockOrUnavailable}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-xl py-10">No products found matching your criteria...</p>
          )}
        </div>

        {/* Order Form Modal */}
        {showForm && selectedProduct && (
          <div className="fixed top-16 inset-x-0 bottom-0 z-[100] flex justify-center items-center bg-black bg-opacity-60 p-4 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md my-auto">
              <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-gray-800">Order: {selectedProduct.name}</h3><button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-800 text-2xl font-bold"> × </button></div>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div><label htmlFor="form_name" className="block text-sm font-medium">Full Name</label><input type="text" id="form_name" name="name" className="w-full px-3 py-2 border rounded-md" value={userDetails.name} onChange={handleFormInputChange} required /></div>
                <div><label htmlFor="form_email" className="block text-sm font-medium">Email</label><input type="email" id="form_email" name="email" className="w-full px-3 py-2 border rounded-md bg-gray-100" value={userDetails.email} readOnly /></div>
                <div><label htmlFor="form_phone" className="block text-sm font-medium">Phone</label><input type="tel" id="form_phone" name="phone" className="w-full px-3 py-2 border rounded-md" value={userDetails.phone} onChange={handleFormInputChange} required pattern="[0-9]{10,15}"/></div>
                <div><label htmlFor="form_address" className="block text-sm font-medium">Address</label><textarea id="form_address" name="address" rows="3" className="w-full px-3 py-2 border rounded-md" value={userDetails.address} onChange={handleFormInputChange} required /></div>
                <div><label htmlFor="form_quantity" className="block text-sm font-medium">Quantity (in kg)</label><input type="number" id="form_quantity" name="quantity" className="w-full px-3 py-2 border rounded-md" value={userDetails.quantity} onChange={handleFormInputChange} min="1" required /></div>
                <p className="text-lg font-semibold text-right">Total: ₹{(selectedProduct.effectivePrice * userDetails.quantity).toFixed(2)}</p>
                <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-semibold"> Place Order </button>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetailsModal && selectedProductForDetails && (
          <div className="fixed top-16 inset-x-0 bottom-0 z-[100] flex justify-center items-center bg-black bg-opacity-75 p-4 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl my-auto max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedProductForDetails.name}</h2>
                   <img
                      src={selectedProductForDetails.imageUrl}
                      alt={selectedProductForDetails.name}
                      className="w-full h-60 object-contain rounded-md my-4"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200.png?text=No+Image"; }}
                    />
                </div>
                <button onClick={handleCloseDetailsModal} className="text-gray-600 hover:text-gray-900 text-3xl font-semibold" > × </button>
              </div>
              {detailedInfo ? (
                  <div className="space-y-4 text-gray-700">
                    <div><h4 className="text-lg font-semibold text-blue-600 mb-1">Health Benefits:</h4><ul className="list-disc list-inside ml-4 space-y-1">{detailedInfo.healthBenefits.map((b, i) => <li key={`hb-${i}`}>{b}</li>)}</ul></div>
                    <div><h4 className="text-lg font-semibold text-blue-600 mb-1">Contents:</h4><ul className="list-disc list-inside ml-4 space-y-1">{detailedInfo.contents.map((c, i) => <li key={`ct-${i}`}>{c}</li>)}</ul></div>
                    <div><h4 className="text-lg font-semibold text-blue-600 mb-1">Usage:</h4><ul className="list-disc list-inside ml-4 space-y-1">{detailedInfo.usage.map((u, i) => <li key={`usg-${i}`}>{u}</li>)}</ul></div>
                    <div><h4 className="text-lg font-semibold text-blue-600 mb-1">Dishes:</h4><ul className="list-disc list-inside ml-4 space-y-1">{detailedInfo.dishes.map((d, i) => <li key={`dsh-${i}`}>{d}</li>)}</ul></div>
                  </div>
              ) : <p className="text-gray-600 italic">Detailed nutritional/usage information not available.</p> }
              <button onClick={handleCloseDetailsModal} className="mt-6 w-full bg-gray-500 text-white py-2.5 rounded-lg hover:bg-gray-600 font-medium" > Close </button>
            </div>
          </div>
        )}

        <hr className="my-12 border-t border-gray-400" />
        <footer className="bg-gray-800 text-white text-center py-6 rounded-lg">
          <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Product;