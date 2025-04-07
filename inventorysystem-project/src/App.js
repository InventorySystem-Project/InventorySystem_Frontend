// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Roles from './pages/Roles';
import Users from './pages/Users';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/roles/*" element={<Roles />} />
          <Route path="/users/*" element={<Users />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
