// src/components/AboutUs.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image } from "react-bootstrap"; // Added Image

// Adjust the import path if your logo.jpg is in a different location relative to AboutUs.js
// For example, if logo.jpg is in src/ and AboutUs.js is in src/components/
import logoImageSrc from "./logo.jpg"; // Assuming logo is in the parent (src) directory

const AboutUs = () => {
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

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-100 p-4 sm:p-6">
      <main
        className="flex-grow flex flex-col items-center justify-center w-full py-8 mt-16 sm:mt-20"
      >
        <div
          style={cardAnimatedStyle}
          className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-xl md:max-w-4xl" // Increased max-w- for wider layout
        >
          <Container fluid>
            {/* ▼▼▼ UPDATED SECTION FOR LOGO AND CONTENT LAYOUT ▼▼▼ */}
            <Row className="items-center"> {/* Use Bootstrap's align-items-center or Tailwind's items-center for vertical alignment */}
              {/* Image Column */}
              <Col md={4} lg={3} className="text-center mb-6 md:mb-0 md:pr-4">
                <Image
                  src={logoImageSrc}
                  alt="Sivagami Traders Logo"
                
                  fluid // Makes image responsive, scales with the column width
                  style={{
                    maxWidth: "180px", // Max width for the logo
                    margin: "0 auto", // Center the image if column is wider
                    border: "3px solid #e2e8f0" // Optional: light border
                  }}
                />
              </Col>

              {/* Content Column */}
              <Col md={8} lg={9}>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-800 text-center md:text-left">
                  About Us
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 text-left">
                  Welcome to <strong>Sivagami Traders</strong>, your trusted source for high-quality products
                  and services. We are committed to delivering the best to our customers with integrity and
                  reliability.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-left">
                  Our journey started with the vision of providing top-notch products at affordable prices.
                  Over the years, we have grown to become a household name for quality and customer satisfaction.
                </p>
                {/* You can add more sections here if needed */}
              </Col>
            </Row>
            {/* ▲▲▲ END OF UPDATED SECTION ▲▲▲ */}
          </Container>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-200 text-center py-6 mt-auto w-full">
        <p>© {new Date().getFullYear()} Sivagami Traders. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;