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
  Warehouse,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const SideMenu = ({ isCollapsed, toggleCollapse }) => {
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
    <div className={`side-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <div className="logo-container">
          <div className="app-logo">
            <span>EI</span>
          </div>
          {!isCollapsed && (
            <div className="app-title">
              <h3>Empresa E.I.R.L</h3>
              <p>Sistema de inventarios</p>
            </div>
          )}
        </div>
        <button className="collapse-button" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Sección de Gestión */}
      <div className="menu-section">
        {!isCollapsed && <p className="section-title">Gestión</p>}

        <Link to="/dashboard" className="menu-item">
          <span className="menu-icon"><Home /></span>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link to="/productos" className="menu-item">
          <span className="menu-icon"><Package /></span>
          {!isCollapsed && <span>Productos</span>}
        </Link>

        <Link to="/materias-primas" className="menu-item">
          <span className="menu-icon"><Truck /></span>
          {!isCollapsed && <span>Materias Primas</span>}
        </Link>

        <Link to="/almacenes" className="menu-item">
          <span className="menu-icon"><Warehouse /></span>
          {!isCollapsed && <span>Almacenes</span>}
        </Link>

        <Link to="/proveedores" className="menu-item">
          <span className="menu-icon"><Users /></span>
          {!isCollapsed && <span>Proveedores</span>}
        </Link>

        <Link to="/ordenes-compra" className="menu-item">
          <span className="menu-icon"><FileText /></span>
          {!isCollapsed && <span>Órdenes de Compra</span>}
        </Link>

        <Link to="/empresas" className="menu-item">
          <span className="menu-icon"><Building /></span>
          {!isCollapsed && <span>Empresas</span>}
        </Link>

        <Link to="/movimientos" className="menu-item">
          <span className="menu-icon"><History /></span>
          {!isCollapsed && <span>Movimientos</span>}
        </Link>
        {/* 
        <Link to="/reportes" className="menu-item">
          <span className="menu-icon"><BarChart3 /></span> 
          {!isCollapsed && <span>Reportes</span>}
        </Link>
        */}
      </div>

      {/* Sección de Sistema */}
      <div className="menu-section">
        {!isCollapsed && <p className="section-title">Sistema</p>}

        <Link to="/roles" className="menu-item">
          <span className="menu-icon"><UserCog /></span>
          {!isCollapsed && <span>Roles</span>}
        </Link>

        <Link to="/usuarios" className="menu-item">
          <span className="menu-icon"><User /></span>
          {!isCollapsed && <span>Usuarios</span>}
        </Link>

        <div className="menu-item" onClick={handleLogout}>
          <span className="menu-icon"><LogOut /></span>
          {!isCollapsed && <span>Salir</span>}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;