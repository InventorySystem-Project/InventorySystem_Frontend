import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const [authInfo, setAuthInfo] = useState({
        token: null,
        userId: null,
        username: null,
        role: null,
        isAuthenticated: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        let role = localStorage.getItem('userRole');

        if (token) {
            try {
                // Decodificar token para validar y potencialmente obtener información adicional
                const decodedToken = jwtDecode(token);
                
                // Si el rol no está en localStorage, intentar obtenerlo del token
                if (!role && decodedToken.role) {
                    role = decodedToken.role;
                    localStorage.setItem('userRole', role);
                }

                setAuthInfo({
                    token,
                    userId: userId ? parseInt(userId, 10) : null,
                    username,
                    role,
                    isAuthenticated: true,
                });
            } catch (error) {
                console.error("Error al procesar token:", error);
                // Token inválido, limpiar localStorage
                localStorage.clear();
                setAuthInfo({
                    token: null,
                    userId: null,
                    username: null,
                    role: null,
                    isAuthenticated: false
                });
            }
        } else {
            setAuthInfo({
                token: null,
                userId: null,
                username: null,
                role: null,
                isAuthenticated: false
            });
        }
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.clear();
        setAuthInfo({
            token: null,
            userId: null,
            username: null,
            role: null,
            isAuthenticated: false
        });
        window.location.href = '/';
    };

    const hasRole = (requiredRoles) => {
        if (!authInfo.role) return false;
        if (authInfo.role === 'ADMIN') return true; // Admin tiene todos los permisos
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(authInfo.role);
        }
        return authInfo.role === requiredRoles;
    };

    const isSoporte = () => {
        return hasRole(['SOPORTE_N1', 'SOPORTE_N2']) || authInfo.role === 'ADMIN';
    };

    const isGestorCambios = () => {
        return hasRole(['GESTOR_CAMBIOS', 'CAB_MEMBER', 'PROJECT_MANAGER']) || authInfo.role === 'ADMIN';
    };

    return {
        ...authInfo,
        loading,
        logout,
        hasRole,
        isSoporte,
        isGestorCambios
    };
};

export default useAuth;