// src/pages/Users.js
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ListUsers from '../components/users/ListUsers';
import RegisterUser from '../components/users/RegisterUser';


const Users = () => {
  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        <li><Link to="list">Listar Usuarios</Link></li>
        <li><Link to="register">Registrar Usuario</Link></li>
        
      </ul>

      <Routes>
        <Route path="list" element={<ListUsers />} />
        <Route path="register" element={<RegisterUser />} />
      </Routes>
    </div>
  );
};

export default Users;
