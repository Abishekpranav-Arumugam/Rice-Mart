// src/components/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import the local image
import authImage from './auth.jpg'; 

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle admin login (LOGIC UNCHANGED)
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (email === "admin@example.com" && password === "admin123") {
      navigate("/admin"); 
    } else {
      setError("Invalid email or password.");
    }
  };

  const amberBoxShadow = "0px 0px 15px rgba(245, 158, 11, 0.5)"; // For button hover

  return (
 
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-300 to-slate-500 p-4 sm:p-6">
      {/* Outer card structure: dark background, amber border (like Login.js) */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-4xl lg:max-w-5xl bg-slate-800 shadow-2xl rounded-xl overflow-hidden border-2 border-amber-500" 
      >
        {/* Image Column (like Login.js) */}
        <div className="hidden lg:block lg:w-[55%] xl:w-3/5">
          <img
            src={authImage} 
            alt="Admin Panel Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Column (maintains dark padding around the white inner card - like Login.js) */}
        <div className="w-full lg:w-[45%] xl:w-2/5 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          {/* Inner Card: White background for the form elements (like Login.js) */}
          <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-amber-500"> 
              Admin Login
            </h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  className="w-full p-3.5 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-300 placeholder-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  className="w-full p-3.5 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-300 placeholder-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Password"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: amberBoxShadow }} 
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg transition-all duration-300 transform shadow-md font-semibold uppercase tracking-wider"
              >
                Login
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;