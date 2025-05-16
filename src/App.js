import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Product from "./components/product";
import Home from "./components/home";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminLogin from "./components/Adminlogin"; // Import AdminLogin component
import Admin from "./components/Admin"; // Import Admin component
import 'bootstrap/dist/css/bootstrap.min.css';
import { CartProvider } from './context/CartContext'; // Import Cart Provider
import Navbar from "./components/navbar";
import Cart from "./components/cart"; // Import Cart component
import ContactUs from "./components/contactus";
import AboutUs from "./components/aboutus";
import OrderHistory from "./components/ohistory";
import AdminNavbar from "./components/adminnavbar";
import StockHistory from "./components/StockHistory";
import PopulateStock from "./components/PopulateStock";
import ManageRiceProducts from './components/ManageRiceProducts';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';



const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const location = useLocation(); // Get the current route

  return (
    <>
     <ToastContainer
        className="app-toast-container" // For z-index if needed
        position="top-center"
        autoClose={3000} // Default autoClose for toasts not specifying their own
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        closeButton={true} // << Default: show close button (can be overridden per toast)
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      
      {!["/login", "/signup", "/adminlogin", "/admin", "/ohistory", "/populate-stock","/manage-rice"].includes(location.pathname) && <Cart />}


      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/signup" 
          element={<SignUp />} 
        />
        <Route 
          path="/adminlogin" 
          element={<AdminLogin />} 
        />
        <Route 
          path="/admin" 
          element={<><AdminNavbar/><Admin /></>} 
        />
          <Route path="/manage-rice" element={<PrivateRoute><AdminNavbar/><ManageRiceProducts /></PrivateRoute>} /> 
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/product" 
          element={<><Home /><Product /></>} 
        />
        <Route 
          path="/contactus" 
          element={<><Home /><ContactUs /></>} 
        />
        <Route 
          path="/aboutus" 
          element={<><Home /><AboutUs /></>} 
        />
        <Route 
          path="/ohistory" 
          element={<><Home /><OrderHistory /></>} 
        />
        <Route path="/stock" element={<><AdminNavbar/><StockHistory /></>} />
        <Route path="/populate-stock" element={<><AdminNavbar/><PopulateStock /></>} />

        <Route path="/" element={<Navigate to="/login" />} />
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;
