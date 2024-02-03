import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { HashLink } from 'react-router-hash-link';
import './NavBar.css'; // Make sure to create a corresponding CSS file

// Place your asset imports here
import logo from '../assets/img/logo.svg';
import navIcon1 from '../assets/img/nav-icon1.svg';
import navIcon2 from '../assets/img/nav-icon2.svg';
import navIcon3 from '../assets/img/nav-icon3.svg';

export const NavBar = () => {

  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onUpdateActiveLink = (value) => {
    setActiveLink(value);
  }

  return (
    <Navbar expand="lg" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Navbar.Brand href="#home">
          <img src={logo} alt="Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={HashLink} to="#home" onClick={() => onUpdateActiveLink('home')} className={activeLink === 'home' ? 'active' : ''}>Home</Nav.Link>
            {/* Add more Nav.Link items here */}
          </Nav>
          <div className="social-icon">
            {/* Add your social media links here */}
            <a href={navIcon1} target="_blank" rel="noopener noreferrer">
              <img src={navIcon1} alt="LinkedIn" />
            </a>
            {/* ... other social icons */}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}