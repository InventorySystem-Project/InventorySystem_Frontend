import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout'; // << Asegúrate de importar correctamente
import Menu from './pages/Menu';
import RegisterUser from './components/users/RegisterUser';
import ListUsers from './components/users/ListUsers';
import RegisterRole from './components/roles/RegisterRole';
import ListRoles from './components/roles/ListRoles';
import Login from './pages/Login';
import './App.css';

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/roles/registrar" element={<RegisterRole />} />
          <Route path="/roles" element={<ListRoles />} />
          <Route path="/users/registrar" element={<RegisterUser />} />
          <Route path="/users" element={<ListUsers />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
