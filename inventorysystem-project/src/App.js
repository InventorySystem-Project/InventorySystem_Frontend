import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'; // Importa CssBaseline y ThemeProvider

import MainLayout from './components/MainLayout'; // Asegúrate de importar correctamente

import Dashboard from './pages/Dashboard';
import Proveedor from './pages/Proveedor';
import OrdenCompra from './pages/OrdenCompra';

import DetalleOrdenCompra from './pages/DetalleOrdenCompra';

import Producto from './pages/Producto';
import Rol from './pages/Rol';
import Usuario from './pages/Usuario';
import Empresa from './pages/Empresa';
import Almacen from './pages/Almacen';
import MateriasPrimas from './pages/MateriasPrima';

import Login from './pages/Login';
import './App.css';
import MovimientoInventarioMP from './pages/MovimientoInventarioMP';


const App = () => {
  return (
    <Router>
<MainLayout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/roles" element={<Rol />} />
            <Route path="/usuarios" element={<Usuario />} />

            <Route path="/empresas" element={<Empresa />} />
            <Route path="/almacenes" element={<Almacen />} />
            
            <Route path="/proveedores" element={<Proveedor />} />
            <Route path="/ordenes-compra" element={<OrdenCompra />} />
            <Route path="/detalle-orden-compra" element={<DetalleOrdenCompra />} />
            <Route path="/movimientos-materia-prima" element={<MovimientoInventarioMP />} />
            
            <Route path="/productos" element={<Producto />} />
            <Route path="/materias-primas" element={<MateriasPrimas />} />
          </Routes>
        </MainLayout>
    </Router>
  );
};

export default App;
