// src/pages/Menu.js
import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <div>
      <h1>Menú Principal</h1>
      <ul>
        <li><Link to="/roles">Administrar Roles</Link></li>
        <li><Link to="/users">Administrar Usuarios</Link></li>
      </ul>
    </div>
  );
};

export default Menu;
