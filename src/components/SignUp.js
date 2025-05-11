// src/components/SignUp.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

// Import the local image
import authImage from './auth.jpg'; 

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, googleSignIn } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // LOGIC REMAINS UNCHANGED
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      await signUp(email, password);
      navigate("/login"); 
    } catch (err) {
      setError(err.message || "Failed to create an account.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(""); // Clear previous errors
    try {
      await googleSignIn();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error during Google Sign-In: ", err.message);
      setError(err.message || "Google Sign-In failed. Please try again later.");
    }
  };
  // --- END OF UNCHANGED LOGIC ---

  const amberBoxShadow = "0px 0px 15px rgba(245, 158, 11, 0.5)"; // #f59e0b amber-500
  const primaryButtonHoverShadow = "0px 0px 15px rgba(59, 130, 246, 0.5)"; // blue-500

  return (
    // Main page container
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-300 to-slate-500 p-4 sm:p-6">
      {/* Outer card structure: dark background, amber border */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-4xl lg:max-w-5xl bg-gray-800 shadow-2xl rounded-xl overflow-hidden border-2 border-amber-500" 
      >
        {/* Image Column */}
        <div className="hidden lg:block lg:w-[55%] xl:w-3/5">
          <img
            src={authImage} 
            alt="Sign Up Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Column (maintains dark padding around the white inner card) */}
        <div className="w-full lg:w-[45%] xl:w-2/5 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          {/* Inner Card: White background for the form elements */}
          <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-amber-500"> 
              Sign Up
            </h2>
            {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
            
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="relative">
                <input
                  type="email"
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-300 placeholder-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-300 placeholder-gray-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: amberBoxShadow }} 
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg transition-all duration-300 transform shadow-md font-semibold uppercase tracking-wider"
              >
                Sign Up
              </motion.button>
            </form>

            <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
              <p className="mx-4 mb-0 text-center font-semibold text-gray-500">OR</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: primaryButtonHoverShadow }} 
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg transition-all duration-300 transform shadow-md font-semibold uppercase tracking-wider"
            >
              <img
                src="https://www.shareicon.net/data/512x512/2016/07/10/119930_google_512x512.png"
                alt="Google Logo"
                className="w-5 h-5 mr-2.5" // Tailwind class for size and margin
              />
              Sign Up with Google
            </motion.button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;