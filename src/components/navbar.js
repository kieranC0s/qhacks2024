import React, { useState } from 'react';
import './navbar.css'; // Make sure to create a corresponding CSS file

function NavBar() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="menu-button" onClick={toggleMenu}>
        ☰
      </div>
      <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={toggleMenu}>Summarize Notes</li>
          <li onClick={toggleMenu}>Flash Cards</li>
          <li onClick={toggleMenu}>Mock Tests</li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;