import React from 'react';
import Notes from './components/notes';
import NavBar from './components/navbar'; // Import the NavBar component
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="App-main">
        <Notes /> {/* Render the Notes component */}
        <NavBar /> {/* Render the NavBar component */}
        {/* Render other components here as needed */}
      </main>
    </div>
  );
}

export default App;