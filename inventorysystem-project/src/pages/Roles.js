// src/pages/Roles.js
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ListRoles from '../components/roles/ListRoles';
import RegisterRole from '../components/roles/RegisterRole';

const Roles = () => {
  return (
    <div>
      <h1>Roles</h1>
      <ul>
        <li><Link to="list">Listar Roles</Link></li>
        <li><Link to="register">Registrar Rol</Link></li>
        <li><Link to="/menu">Volver al Menú</Link></li>
      </ul>

      <Routes>
        <Route path="list" element={<ListRoles />} />
        <Route path="register" element={<RegisterRole />} />
      </Routes>
    </div>
  );
};

export default Roles;
