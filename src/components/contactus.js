// src/components/ContactUs.js
import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";

const ContactUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const cardAnimatedStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "scale(1)" : "scale(0.95)",
    transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted! (This is a placeholder)");
  };

  return (
    // Page wrapper
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-100 p-4 sm:p-6">
      <main className="flex-grow flex flex-col items-center justify-center w-full mt-12 sm:mt-16 py-8"> {/* Adjusted top margin */}
        {/* Single Integrated Card */}
        <div
          style={cardAnimatedStyle}
          className="bg-slate-800 p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-5xl lg:max-w-6xl text-slate-100" // Increased max-width for side-by-side content
        >
          {/* Unified Title for the Card */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-amber-500 text-center">
            <pre>Contact Us                       Find Us</pre>
          </h2>

          <div className="flex flex-col lg:flex-row lg:gap-x-8 items-stretch">
            

            <div className="w-full lg:w-1/2 flex flex-col mb-8 lg:mb-0">
              <Form onSubmit={handleSubmit} className="flex-grow flex flex-col"> {/* flex-grow makes form fill column, flex-col for button placement */}
                <Form.Group className="mb-4 text-left" controlId="formName">
                  <Form.Label className="block text-sm font-medium text-slate-300 mb-1">Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    required
                    className="w-full p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-slate-400"
                  />
                </Form.Group>

                <Form.Group className="mb-4 text-left" controlId="formEmail">
                  <Form.Label className="block text-sm font-medium text-slate-300 mb-1">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-slate-400"
                  />
                </Form.Group>

                <Form.Group className="mb-5 text-left" controlId="formMessage">
                  <Form.Label className="block text-sm font-medium text-slate-300 mb-1">Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Enter your message"
                    required
                    className="w-full p-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-slate-400"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out mt-auto" // mt-auto pushes button to the bottom
                  style={{ border: 'none' }}
                >
                  Send Message
                </Button>
              </Form>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col"> 
              <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-amber-500 text-center lg:text-left">
              </h3>
            
              <div className="flex-grow rounded-lg overflow-hidden min-h-[300px] sm:min-h-[350px] w-full"> 
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.020068170909!2d77.89379835803222!3d11.386057991845839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9619706d39787%3A0xd7c932f61bfebd16!2sSree%20Sivakami%20Traders!5e0!3m2!1sen!2sin!4v1716380000000"
                  width="100%"
                  height="100%" // Fills the parent div (iframe wrapper)
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sree Sivakami Traders Location on Google Maps"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-200 text-center py-6 mt-auto w-full">
        <p>© {new Date().getFullYear()} Rice Shop (or Sivagami Traders). All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default ContactUs;