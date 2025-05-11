// src/components/OrderHistory.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
// If you have Link for navigation in your actual app, uncomment it
// import { Link } from 'react-router-dom'; 

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. Handle Auth Loading State
      if (authLoading) {
        // console.log('OrderHistory Effect: Auth is loading, waiting...');
        setLoading(true); // Keep component loading indicator active
        return;
      }

      // 2. Handle Unauthenticated User
      if (!user) {
        // console.error('OrderHistory Effect: User is not authenticated.');
        setError('User not authenticated. Please log in to view your order history.');
        setLoading(false);
        setOrders([]); // Clear any previous orders
        return;
      }

      // 3. User is authenticated, proceed to fetch orders
      // console.log('OrderHistory Effect: User authenticated, fetching orders for:', user.email || user.uid);
      setError(null); // Clear previous errors
      setLoading(true); // Set loading for the fetch operation

      try {
        const token = await user.getIdToken();
        if (!token) {
          // console.error('OrderHistory Effect: Failed to retrieve Firebase ID token. Token is null or undefined.');
          setError('Authentication token is missing. Unable to fetch orders.');
          setOrders([]);
          setLoading(false);
          return;
        }
        // console.log('OrderHistory Effect: Successfully retrieved Firebase ID token.');

        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorData = { message: `HTTP error! Status: ${response.status}` };
          try {
            const backendError = await response.json();
            errorData.message = backendError.error || backendError.message || errorData.message;
            // console.error('OrderHistory Effect: Backend responded with an error:', backendError);
          } catch (e) {
            // console.error('OrderHistory Effect: Could not parse backend error response as JSON.', e);
          }
          throw new Error(errorData.message);
        }

        const data = await response.json();
        // console.log('OrderHistory Effect: Successfully fetched orders:', data);
        setOrders(data);

      } catch (err) {
        // console.error('OrderHistory Effect: Error during fetchOrders:', err);
        setError(err.message || 'An unexpected error occurred while fetching orders.');
        setOrders([]); // Clear orders on error
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  // --- UI Rendering with Loading and Error States ---

  const pageBackground = "bg-slate-100"; // Light gray page background, similar to the image

  if (authLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <p className="text-center py-10 text-xl text-gray-700">Authenticating user...</p>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <div className="bg-white p-10 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h3>
            <p className="text-gray-700">{error || 'Please log in to view your order history.'}</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <p className="text-center py-10 text-xl text-gray-700">Loading your orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
        <div className={`flex min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
            <div className="bg-white p-10 rounded-lg shadow-xl text-center">
                <h3 className="text-2xl font-semibold text-red-600 mb-4">Error Fetching Orders</h3>
                <p className="text-gray-700">{error}</p>
                <button
                    onClick={() => window.location.reload()} 
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${pageBackground} p-4 sm:p-6`}>
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-8 mt-16 sm:mt-20">
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center text-gray-800"> 
          Your Order History 
        </h2> {/* Kept your title, styling could match "ALL CUSTOMER ORDERS" if preferred */}
        
        {orders.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl text-center"> {/* Increased shadow */}
            <p className="text-lg sm:text-xl text-gray-600">You have no orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg"> {/* shadow-lg for table container */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-800"> {/* Darker header, like the image */}
                <tr>
                  {/* Column headers styled to match the image: dark bg, light text */}
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Product(s)</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Total Price</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Order Placed</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Est. Delivery</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  {/* No "Action" column as it's not in your current data structure */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const deliveryDate = new Date(order.createdAt);
                  deliveryDate.setDate(deliveryDate.getDate() + 3); 

                  const productDisplay = order.cartItems && order.cartItems.length > 0 ? (
                    // Product list styling closer to the image (simpler lines)
                    <div>
                      {order.cartItems.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-700 leading-tight">
                          {item.name} (x{item.quantity || 1}) - ₹{item.price?.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-700">{order.productName}</span>
                  );

                  const quantityDisplay = order.quantity || (order.cartItems ? order.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Order ID styled like the image */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600 break-all sm:break-normal">{order._id}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-normal text-sm text-gray-700">{productDisplay}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{quantityDisplay}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-semibold">₹{order.totalPrice?.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deliveryDate.toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {order.status === 'Completed' || order.status === 'Delivered' ? (
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-300 text-green-900">Delivered</span>
                        ) : order.status === 'Shipped' ? (
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-300 text-blue-900">Shipped</span> // Changed from amber to blue
                        ) : (
                          // Pending status styled yellow like the image
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{order.status || 'Pending'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <footer className="bg-gray-800 text-white text-center py-6 mt-auto"> {/* Dark footer similar to image navbar */}
        <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default OrderHistory;