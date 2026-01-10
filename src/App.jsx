import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Purchase from './pages/Purchase';
import Service from './pages/Service';
import Bag from './pages/Bag';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Notification from './pages/Notification';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

// Import CSS files
import './styles/mobile.css';
import './styles/desktop.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/service" element={<Service />} />
        <Route path="/bag" element={<Bag />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
