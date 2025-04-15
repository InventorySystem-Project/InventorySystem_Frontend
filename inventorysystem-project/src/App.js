import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'; // Importa CssBaseline y ThemeProvider

import MainLayout from './components/MainLayout'; // Asegúrate de importar correctamente

import Dashboard from './pages/Dashboard';
import Proveedor from './pages/Proveedor';
import OrdenesCompra from './pages/OrdenesCompra';
import Producto from './pages/Producto';
import Rol from './pages/Rol';
import Usuario from './pages/Usuario';


import MateriasPrimas from './pages/MateriasPrima';

import RegisterUser from './components/users/RegisterUser';
import ListUsers from './components/users/ListUsers';
import Login from './pages/Login';
import './App.css';


const App = () => {
  return (
    <Router>
<MainLayout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/roles" element={<Rol />} />
            <Route path="/usuarios" element={<Usuario />} />



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
