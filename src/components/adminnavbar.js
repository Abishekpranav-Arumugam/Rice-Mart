// src/components/AdminNavbar.js
import React from "react";
import { Navbar, Container, Nav, Image } from "react-bootstrap"; // Added Image
// Import custom CSS
import "./NavbarStyles.css"; 

// Assuming AdminNavbar.js is in src/components/ and logo.jpg is in src/
import logoImageSrc from "./logo.jpg"; 

const AdminNavbar = () => {
  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="custom-navbar admin-specific-navbar" 
    >
      <Container>
        {/* ▼▼▼ UPDATED Navbar.Brand ▼▼▼ */}
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
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
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link href="/Stock">
              Stock
            </Nav.Link>
            <Nav.Link href="/admin">
              Order History
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;