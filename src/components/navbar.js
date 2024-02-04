import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { HashLink } from 'react-router-hash-link';
import logo from '../assets/logo.png';
import '../style.css'; // Make sure this path is correct

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onUpdateActiveLink = (value) => {
    setActiveLink(value);
  };

  return (
    <Navbar expand="lg" className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} fixed="top">
      <Container>
        <Navbar.Brand as={HashLink} to="#home" className="navbar-brand">
        <img src={logo} alt="Logo" className="logo" />
          StudyStream
        </Navbar.Brand>
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={HashLink} to="#home" className={activeLink === 'home' ? 'active nav-link' : 'nav-link'} onClick={() => onUpdateActiveLink('home')}>Home</Nav.Link>
            <Nav.Link as={HashLink} to="#notes-summary" className={activeLink === 'notes-summary' ? 'active nav-link' : 'nav-link'} onClick={() => onUpdateActiveLink('notes-summary')}>Notes Summary</Nav.Link>
            <Nav.Link as={HashLink} to="#mock-up-tests" className={activeLink === 'mock-up-tests' ? 'active nav-link' : 'nav-link'} onClick={() => onUpdateActiveLink('mock-up-tests')}>Mock Up Tests</Nav.Link>
            <Nav.Link as={HashLink} to="#resources" className={activeLink === 'resources' ? 'active nav-link' : 'nav-link'} onClick={() => onUpdateActiveLink('resources')}>Resources</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};