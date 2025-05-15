// src/components/AdminNavbar.js
import React from "react";
import { Navbar, Container, Nav, Image, Button } from "react-bootstrap"; // Added Button
import { useNavigate } from "react-router-dom"; // Added useNavigate
// Import custom CSS
import "./NavbarStyles.css"; 
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Assuming AdminNavbar.js is in src/components/ and logo.jpg is in src/
import logoImageSrc from "./logo.jpg"; 

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // Get logout function and user (optional, if you need user info here)

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to admin login page after successful logout
      navigate('/adminlogin'); 
      // You could also show a toast notification for successful logout here if desired
    } catch (error) {
      console.error("Admin logout failed", error);
      // Handle logout error, e.g., show an error toast
    }
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="custom-navbar admin-specific-navbar" 
    >
      <Container>
        <Navbar.Brand href={user ? "/admin" : "/adminlogin"} className="d-flex align-items-center"> {/* Link to /admin if logged in, else /adminlogin */}
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
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link href="/admin">
              Order History 
            </Nav.Link>
            <Nav.Link href="/stock">
              Stock Overview
            </Nav.Link>
            <Nav.Link href="/populate-stock">
              Populate Stock
            </Nav.Link>
          </Nav>
          <Nav>
            {user && ( 
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;