import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  UserCog,
  User,
  Package,
  Truck,
  Users,
  FileText,
  Building,
  History,
  BarChart3,
  LogOut,
  Warehouse
} from "lucide-react";

const SideMenu = () => {
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const toggleRoles = () => setShowRoles(!showRoles);
  const toggleUsers = () => setShowUsers(!showUsers);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/'); // Redirigir al login
  };

  return (
    <div className="side-menu">
      <div className="menu-header">
        <h2 className="menu-heading">Menú Lateral</h2>
        <hr />
      </div>

      {/* Sección de Gestión */}
      <div className="menu-section">
        <p className="section-title">Gestión</p>
        
        <Link to="/dashboard" className="menu-item">
          <span className="menu-icon"><Home /></span> Dashboard
        </Link>

        <Link to="/productos" className="menu-item">
          <span className="menu-icon"><Package /></span> Productos
        </Link>

        <Link to="/materias-primas" className="menu-item">
          <span className="menu-icon"><Truck /></span> Materias Primas
        </Link>

        <Link to="/almacenes" className="menu-item">
          <span className="menu-icon"><Warehouse /></span> Almacenes
        </Link>

        <Link to="/proveedores" className="menu-item">
          <span className="menu-icon"><Users /></span> Proveedores
        </Link>

        <Link to="/ordenes-compra" className="menu-item">
          <span className="menu-icon"><FileText /></span> Órdenes de Compra
        </Link>

        <Link to="/empresas" className="menu-item">
          <span className="menu-icon"><Building /></span> Empresas
        </Link>

        <Link to="/movimientos-materia-prima" className="menu-item">
          <span className="menu-icon"><History /></span> Movimientos
        </Link>

        <Link to="/reportes" className="menu-item">
          <span className="menu-icon"><BarChart3 /></span> Reportes
        </Link>
      </div>


      {/* Sección de Sistema */}
      <div className="menu-section">
        <p className="section-title">Sistema</p>
        
        <Link to="/roles" className="menu-item">
          <span className="menu-icon"><UserCog /></span> Roles
        </Link>

        <Link to="/usuarios" className="menu-item">
          <span className="menu-icon"><User /></span> Usuarios
        </Link>
{/* 
        <Link to="/configuracion" className="menu-item">
          <span className="menu-icon"><Building /></span> Configuración
        </Link>
*/}
        <div className="menu-item" onClick={handleLogout}>
          <span className="menu-icon"><LogOut /></span> Salir
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
