import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'; // Importa CssBaseline y ThemeProvider

import MainLayout from './components/MainLayout'; // Asegúrate de importar correctamente

import Dashboard from './pages/Dashboard';
import Proveedor from './pages/Proveedor';
import OrdenesCompra from './pages/OrdenesCompra';
import Producto from './pages/Producto';
import MateriasPrimas from './pages/MateriasPrima';

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roles/registrar" element={<RegisterRole />} />
            <Route path="/roles" element={<ListRoles />} />
            <Route path="/users/registrar" element={<RegisterUser />} />
            <Route path="/users" element={<ListUsers />} />
            <Route path="/proveedores" element={<Proveedor />} />
            <Route path="/orden-compras" element={<OrdenesCompra />} />
            <Route path="/productos" element={<Producto />} />
            <Route path="/materias-primas" element={<MateriasPrimas />} />
          </Routes>
        </MainLayout>
    </Router>
  );
};

export default App;
