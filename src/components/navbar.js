import { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { HashLink } from 'react-router-hash-link';
import '../style.css';


export const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };
  
    // Add the event listener
    window.addEventListener('scroll', handleScroll);
  
    // Remove the event listener on cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const onUpdateActiveLink = (value) => {
    setActiveLink(value);
  };

  return (
      <Navbar expand="md" className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <Container>
          <Navbar.Brand as={HashLink} to="#home">
            {/* If you have a logo, you can uncomment and use the next line */}
            {/* <img src={logo} alt="Logo" /> */}
            iLearn
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={HashLink} to="#home" className={activeLink === 'home' ? 'active' : ''} onClick={() => onUpdateActiveLink('home')}>Home</Nav.Link>
              <Nav.Link as={HashLink} to="#notes-summary" className={activeLink === 'notes-summary' ? 'active' : ''} onClick={() => onUpdateActiveLink('notes-summary')}>Notes Summary</Nav.Link>
              <Nav.Link as={HashLink} to="#mock-up-tests" className={activeLink === 'mock-up-tests' ? 'active' : ''} onClick={() => onUpdateActiveLink('mock-up-tests')}>Mock Up Tests</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};