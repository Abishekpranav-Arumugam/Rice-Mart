import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button, Image } from "react-bootstrap"; // Ensured Image is imported
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

// Import the logo image from its location in the src folder
import logoImageSrc from "./logo.jpg"; // Assuming Home.js and logo.jpg are both directly in the src folder

// Import custom CSS
import "./NavbarStyles.css";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="custom-navbar"
      >
        <Container>
          <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
            <Image
              src={logoImageSrc} // Use the imported image source here
              alt="Sivagami Traders Logo"
              roundedCircle
              style={{
                width: '35px',    // Adjusted size for better navbar fit, you can change this
                height: '35px',   // Adjusted size for better navbar fit
                marginRight: '10px',
                objectFit: 'cover' // 'cover' is generally better for logos to maintain aspect ratio in a circle
              }}
            />
            Sivakami Traders
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="home-navbar-nav" />
          <Navbar.Collapse id="home-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="/product">
                Shop
              </Nav.Link>
              <Nav.Link href="/ohistory">
                My Orders
              </Nav.Link>
              <Nav.Link href="/aboutus">
                About Us
              </Nav.Link>
              <Nav.Link href="/contactus">
                Contact Us
              </Nav.Link>
            </Nav>
            <Nav className="align-items-center">
              <Nav.Link href="#" className="user-info-link">
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
    </>
  );
};

export default Home;