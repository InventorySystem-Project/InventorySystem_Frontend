import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Componente de carga para tablas
 * Muestra un spinner animado con mensaje personalizado
 * @param {string} message - Mensaje a mostrar durante la carga (opcional)
 * @param {string} color - Color del spinner (opcional, default: '#3b82f6')
 */
const LoadingTable = ({ message = 'Cargando datos...', color = '#3b82f6' }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        minHeight: '300px'
      }}
    >
      <CircularProgress 
        size={40} 
        style={{ color }} 
        thickness={4}
      />
      <Typography 
        sx={{ 
          mt: 2, 
          color: '#64748b', 
          fontSize: '0.95rem',
          fontWeight: 500
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingTable;
