import React, { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import setupAxiosInterceptors from './services/axiosInterceptors';

import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

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
import MovimientoInventario from './pages/MovimientoInventario';
import Reclamo from './pages/Reclamo';
import Login from './pages/Login';
import SoporteCliente from './pages/SoporteCliente';

import './App.css';

const App = () => {
  // Configurar interceptores de Axios al montar la aplicación
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/" element={<Login />} />
          
          {/* Rutas protegidas - requieren autenticación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/roles" 
            element={
              <ProtectedRoute>
                <Rol />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute>
                <Usuario />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/empresas" 
            element={
              <ProtectedRoute>
                <Empresa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/almacenes" 
            element={
              <ProtectedRoute>
                <Almacen />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/proveedores" 
            element={
              <ProtectedRoute>
                <Proveedor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ordenes-compra" 
            element={
              <ProtectedRoute>
                <OrdenCompra />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/detalle-orden-compra" 
            element={
              <ProtectedRoute>
                <DetalleOrdenCompra />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/movimientos" 
            element={
              <ProtectedRoute>
                <MovimientoInventario />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/productos" 
            element={
              <ProtectedRoute>
                <Producto />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/materias-primas" 
            element={
              <ProtectedRoute>
                <MateriasPrimas />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reclamos" 
            element={
              <ProtectedRoute>
                <Reclamo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/soporte-cliente" 
            element={
              <ProtectedRoute>
                <SoporteCliente />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
