import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AddTests from './pages/AddTests';
import Learn from './pages/Learn';
import Test from './pages/Test';
import Navigation from './components/Navigation';
import { TestProvider } from './context/TestContext';

function App() {
  return (
    <TestProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddTests />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    </TestProvider>
  );
}

export default App;


