// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button, Card, Row, Col, Image } from "react-bootstrap"; // Added Image
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";

// Import custom CSS
import "./NavbarStyles.css"; 

// Assuming Dashboard.js is in src/components/ and logo.jpg is in src/
import logoImageSrc from "./logo.jpg";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar
        expand="lg"
        fixed="top"
        className="custom-navbar"
      >
        <Container>
          {/* ▼▼▼ UPDATED Navbar.Brand ▼▼▼ */}
          <Navbar.Brand href="/dashboard" className="fw-bold d-flex align-items-center"> 
            <Image
              src={logoImageSrc}
              alt="Sivagami Traders Logo"
              roundedCircle
              style={{
                width: '35px', 
                height: '35px',
                marginRight: '10px',
                objectFit: 'cover'
              }}
            />
            Sivagami Traders
          </Navbar.Brand>
          {/* ▲▲▲ END OF UPDATE ▲▲▲ */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="/product" className="fw-semibold">
                Product
              </Nav.Link>
              <Nav.Link href="/ohistory" className="fw-semibold">
                Order History
              </Nav.Link>
              <Nav.Link href="/aboutus" className="fw-semibold">
                About Us
              </Nav.Link>
              <Nav.Link href="/contactus" className="fw-semibold">
                Contact Us
              </Nav.Link>
            </Nav>
            <Nav className="align-items-center">
              <Nav.Link href="#" className="user-info-link fw-semibold">
                <FaUserCircle className="user-icon" />
                {user?.email || user?.displayName}
              </Nav.Link>
              <Button
                variant="link"
                onClick={handleLogout}
                className="ms-3 btn-navbar-danger"
              >
                <FaSignOutAlt className="me-1" /> Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Animated Background (Unchanged) */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ background: "linear-gradient(135deg, #1e3a8a, #1e40af)" }}
        animate={{
          background: [
            "linear-gradient(135deg, #1e3a8a, #1e40af)",
            "linear-gradient(135deg, #4f46e5, #9333ea)",
            "linear-gradient(135deg, #1e40af, #3b82f6)",
            "linear-gradient(135deg, #9333ea, #1e3a8a)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          minHeight: "100vh",
          position: "fixed",
          width: "100%",
        }}
      />

      {/* Interactive Particles (Unchanged) */}
      <motion.div
        className="absolute -z-10 w-full h-full"
        animate={{
          x: mousePosition.x / 30,
          y: mousePosition.y / 30,
        }}
        transition={{ type: "tween", stiffness: 100 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-30"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: ["0%", "100%", "0%"],
              x: ["0%", "50%", "0%"],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      {/* Main Content - Added 'page-content-wrapper' class for padding */}
      <div
        className="dashboard-container d-flex align-items-center justify-content-center vh-100 page-content-wrapper" 
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative", 
          zIndex: 1,
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card
                className="text-center shadow-lg"
                style={{
                  borderRadius: "15px",
                  padding: "25px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                }}
              >
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <FaUserCircle size={80} className="mb-3 text-light" />
                  <Card.Title className="mb-3 fw-bold" style={{ fontSize: "22px" }}>
                    Welcome, {user?.email || user?.displayName}!
                  </Card.Title>
                  <Card.Text style={{ fontSize: "15px", color: "#f8f9fa", opacity: "0.9" }}>
                    This is {user?.email || user?.displayName}'s dashboard.<br />
                    You can add more components here to display.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/profile")}
                    className="mt-3"
                    style={{
                      fontSize: "16px",
                      padding: "10px 20px",
                      transition: "all 0.3s ease-in-out",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      boxShadow: "0px 4px 10px rgba(243, 156, 18, 0.4)", 
                      backgroundColor: "#f39c12", 
                      borderColor: "#f39c12", 
                    }}
                  >
                    Go to Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;