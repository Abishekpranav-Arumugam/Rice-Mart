// src/components/NavbarComponent.js
import React from "react";
import { Navbar, Nav, Container, Button, Image } from "react-bootstrap"; // Added Image
import { FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaUserCog } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

// Import custom CSS
import "./NavbarStyles.css";

// Assuming NavbarComponent.js is in src/components/ and logo.jpg is in src/
import logoImageSrc from "./logo.jpg";

const NavbarComponent = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignUp = () => navigate("/signup");
  const handleLogin = () => navigate("/login");
  const handleAdmin = () => navigate("/adminlogin");

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="custom-navbar"
    >
      <Container>
        {/* ▼▼▼ UPDATED Navbar.Brand ▼▼▼ */}
        <Navbar.Brand href={user ? "/dashboard" : "/login"} className="d-flex align-items-center">
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
        <Navbar.Toggle aria-controls="generic-navbar-nav" />
        <Navbar.Collapse id="generic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="#" className="user-info-link">
              <FaUserCircle className="user-icon" />
              {user?.email || user?.displayName || "Guest"}
            </Nav.Link>
            {user ? (
              <>
                <Button
                  variant="link"
                  onClick={handleAdmin}
                  className="ms-3 btn-navbar-custom"
                >
                  <FaUserCog className="me-1" /> Admin
                </Button>
                <Button
                  variant="link"
                  onClick={handleLogout}
                  className="ms-3 btn-navbar-danger"
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </>
            ) : location.pathname === "/login" ? (
              <>
                <Button
                  variant="link"
                  onClick={handleSignUp}
                  className="ms-3 btn-navbar-custom"
                >
                  <FaUserPlus className="me-1" /> Sign Up
                </Button>
                <Button
                  variant="link"
                  onClick={handleAdmin}
                  className="ms-3 btn-navbar-custom"
                >
                  <FaUserCog className="me-1" /> Admin
                </Button>
              </>
            ) : location.pathname === "/signup" ? (
              <>
                <Button
                  variant="link"
                  onClick={handleLogin}
                  className="ms-3 btn-navbar-custom"
                >
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button
                  variant="link"
                  onClick={handleAdmin}
                  className="ms-3 btn-navbar-custom"
                >
                  <FaUserCog className="me-1" /> Admin
                </Button>
              </>
            ) : (
              <>
                <Button variant="link" onClick={handleLogin} className="ms-3 btn-navbar-custom">
                    <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button variant="link" onClick={handleSignUp} className="ms-3 btn-navbar-custom">
                    <FaUserPlus className="me-1" /> Sign Up
                </Button>
                <Button variant="link" onClick={handleAdmin} className="ms-3 btn-navbar-custom">
                    <FaUserCog className="me-1" /> Admin
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;