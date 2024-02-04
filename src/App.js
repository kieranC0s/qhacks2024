import Notes from './components/notes';
import { NavBar } from './components/navbar';
import { Banner } from './components/banner';
import Test from './components/test';
import Resources from './components/resources';
import Footer from './components/footer';
import './style.css';


function App() {
  return (
      <div className="App">
        <NavBar /> {/* NavBar is now within Router context */}
        <main className="App-main">
          <Banner />
          <Notes /> {/* Render the Notes component */}
          <Test /> {/* Render the test component */}
          <Resources />
          <Footer />
        </main>
      </div>
  );
}

export default App;