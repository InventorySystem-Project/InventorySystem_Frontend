import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();

    // Mostrar un loader mientras se verifica la autenticación
    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                sx={{ backgroundColor: '#f5f5f5' }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si se requieren roles específicos, verificar
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        // Usuario autenticado pero sin permisos - redirigir al dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Usuario autenticado y con permisos adecuados
    return children;
};

export default ProtectedRoute;
