import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <div className="menu-container">
      <h1 className="menu-heading">Menú Principal</h1>
      <ul className="menu-list">
        <li className="menu-list-item"><Link to="/roles" className="menu-link">Administrar Roles</Link></li>
        <li className="menu-list-item"><Link to="/users" className="menu-link">Administrar Usuarios</Link></li>
      </ul>
    </div>
  );
};

export default Menu;
