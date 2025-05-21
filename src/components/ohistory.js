// src/components/OrderHistory.js
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Alert, Button } from 'react-bootstrap'; // Assuming react-bootstrap

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        setError('User not authenticated. Please log in to view your order history.');
        setLoading(false);
        setOrders([]);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const token = await user.getIdToken();
        if (!token) {
          setError('Authentication token is missing. Unable to fetch orders.');
          setOrders([]);
          setLoading(false);
          return;
        }

        const response = await fetch('https://rice-mart.onrender.com/api/orders', {
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
          } catch (e) {
            // Failed to parse error response
          }
          throw new Error(errorData.message);
        }

        const data = await response.json();
        setOrders(data);

      } catch (err) {
        setError(err.message || 'An unexpected error occurred while fetching orders.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  const handleUserCancel = async (orderId) => {
    setCancelError(null);
    setCancelSuccess(null);
    setCancelingOrderId(orderId);

    try {
        if (!user) {
            throw new Error("User not authenticated.");
        }
        const token = await user.getIdToken();
        if (!token) {
            throw new Error("Authentication token missing.");
        }

        const response = await fetch(`https://rice-mart.onrender.com/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'Canceled' }),
        });

        if (!response.ok) {
             let errorData = { message: `HTTP error! Status: ${response.status}` };
            try {
                const backendError = await response.json();
                errorData.message = backendError.error || backendError.message || errorData.message;
            } catch (e) {
                // Failed to parse error response
            }
            throw new Error(errorData.message);
        }

        setOrders(prevOrders =>
            prevOrders.map(order =>
                order._id === orderId ? { ...order, status: 'Canceled' } : order
            )
        );
        setCancelSuccess(`Order ${orderId} has been successfully canceled.`);
        console.log(`Order ${orderId} successfully canceled.`);

    } catch (err) {
        console.error(`OrderHistory: Error canceling order ${orderId}:`, err);
        setCancelError(err.message || `Failed to cancel order ${orderId}. Please try again.`);
    } finally {
        setCancelingOrderId(null);
    }
  };

  const pageBackground = "bg-[#E0F7FA]";

  if (authLoading) {
    return (
      <div className={`flex flex-col min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <p className="text-center py-10 text-xl text-gray-700">Authenticating user...</p>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className={`flex flex-col min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <div className="bg-white p-10 rounded-lg shadow-xl text-center">
            <h3 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h3>
            <p className="text-gray-700">{error || 'Please log in to view your order history.'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
        <p className="text-center py-10 text-xl text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className={`flex flex-col min-h-screen items-center justify-center ${pageBackground} p-4 sm:p-6`}>
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
        </h2>

        {cancelSuccess && <Alert variant="success" onClose={() => setCancelSuccess(null)} dismissible>{cancelSuccess}</Alert>}
        {cancelError && <Alert variant="danger" onClose={() => setCancelError(null)} dismissible>{cancelError}</Alert>}


        {orders.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl text-center">
            <p className="text-lg sm:text-xl text-gray-600">You have no orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Product(s)</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Total Price</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Order Placed</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Est. Delivery</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-medium text-white uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const deliveryDate = new Date(order.createdAt);
                  deliveryDate.setDate(deliveryDate.getDate() + 3);

                  const orderPlacedDate = new Date(order.createdAt);
                  const now = new Date();
                  const diffMs = now.getTime() - orderPlacedDate.getTime();
                  const diffHours = diffMs / (1000 * 60 * 60); 
                  const canCancel = order.status !== 'Completed' && order.status !== 'Canceled' && diffHours <= 48;


                  const productDisplay = order.cartItems && order.cartItems.length > 0 ? (
                    <div>
                      {order.cartItems.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-700 leading-tight">
                          {/* MODIFIED LINE BELOW */}
                          {item.name} (x{item.quantity || 1} kg) - ₹{item.price?.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    // If there's a single productName, and you want to show (kg) there too,
                    // you might need to adjust based on how productName and quantity are structured
                    // For now, this part remains as is, assuming cartItems is the primary source for detailed items.
                    <span className="text-gray-700">{order.productName}</span>
                  );

                  const quantityDisplay = order.quantity || (order.cartItems ? order.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
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
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-300 text-blue-900">Shipped</span>
                        ) : order.status === 'Canceled' ? (
                           <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-300 text-red-900">Canceled</span>
                        ) : (
                          <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{order.status || 'Pending'}</span>
                        )}
                      </td>
                       <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm">
                         {canCancel ? (
                           <Button
                             variant="danger" 
                             size="sm"
                             onClick={() => handleUserCancel(order._id)}
                             disabled={cancelingOrderId === order._id}
                           >
                             {cancelingOrderId === order._id ? 'Canceling...' : 'Cancel Order'}
                           </Button>
                         ) : order.status === 'Canceled' ? (
                            <span className="text-red-600">Canceled</span>
                         ) : order.status === 'Completed' || order.status === 'Delivered' ? (
                             <span className="text-green-600">Delivered</span>
                         ) : (
                            <span className="text-gray-500">Cancel button disabled</span>
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
      <footer className="bg-gray-800 text-white text-center py-6 mt-auto">
          <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default OrderHistory;