/**
 * Estilos específicos para tablas mejoradas y modernas
 * Responsive, con hover effects, bordes sutiles y mejor legibilidad
 */

// Tabla container con scroll horizontal en mobile
export const enhancedTableContainer = {
  width: '100%',
  overflowX: 'auto',
  backgroundColor: '#ffffff',
  marginTop: 3,
  overflow: 'hidden',
  
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  
  // Scroll personalizado
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: '#9ca3af',
    },
  },
};

// Header de tabla mejorado - colores claros
export const enhancedTableHead = {
  backgroundColor: '#f9fafb',
  
  '& .MuiTableCell-root': {
    fontWeight: 600,
    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: { xs: '14px 12px', sm: '16px', md: '18px 16px' },
    borderBottom: '2px solid #d1d5db',
    whiteSpace: 'nowrap',
    backgroundColor: '#f9fafb',
  },
};

// Fila de tabla con hover effect - hover claro SIN TRANSFORM
export const enhancedTableRow = {
  transition: 'background-color 0.15s ease-in-out',
  backgroundColor: '#ffffff',
  
  '&:hover': {
    backgroundColor: '#f3f4f6',
  },
  
  '&:last-child td': {
    borderBottom: 0,
  },
  
  // Alternating rows (zebra striping) - muy sutil
  '&:nth-of-type(even)': {
    backgroundColor: '#fafbfc',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
};

// Celda de tabla - colores claros
export const enhancedTableCell = {
  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
  padding: { xs: '12px 8px', sm: '14px 12px', md: '16px' },
  color: '#1f2937',
  borderBottom: '1px solid #f3f4f6',
  backgroundColor: 'transparent',
};

// Celda de acciones con botones
export const enhancedTableCellActions = {
  display: 'flex',
  gap: 1,
  justifyContent: { xs: 'flex-start', sm: 'center' },
  flexWrap: 'wrap',
  alignItems: 'center',
};

// Botón de acción mejorado - con startIcon de Material-UI
export const enhancedActionButton = {
  minWidth: { xs: 36, sm: 40 },
  width: { xs: 36, sm: 40 },
  height: { xs: 36, sm: 40 },
  padding: '8px !important',
  borderRadius: 2,
  transition: 'background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  border: '1px solid transparent',
  
  // Centrar el icono cuando se usa startIcon sin texto
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  
  // Asegurar que los iconos se vean correctamente
  '& svg': {
    width: { xs: '18px', sm: '20px' },
    height: { xs: '18px', sm: '20px' },
    display: 'block',
  },
  
  '&:hover': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  '&.MuiButton-colorPrimary': {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderColor: '#93c5fd',
    '&:hover': {
      backgroundColor: '#bfdbfe',
      color: '#1e3a8a',
      borderColor: '#60a5fa',
    },
    '& svg': {
      color: '#1e40af',
    },
    '&:hover svg': {
      color: '#1e3a8a',
    },
  },
  
  '&.MuiButton-colorError': {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderColor: '#fca5a5',
    '&:hover': {
      backgroundColor: '#fecaca',
      color: '#991b1b',
      borderColor: '#f87171',
    },
    '& svg': {
      color: '#b91c1c',
    },
    '&:hover svg': {
      color: '#991b1b',
    },
  },
  
  '&.MuiButton-colorInfo': {
    backgroundColor: '#cffafe',
    color: '#0e7490',
    borderColor: '#67e8f9',
    '&:hover': {
      backgroundColor: '#a5f3fc',
      color: '#164e63',
      borderColor: '#22d3ee',
    },
    '& svg': {
      color: '#0e7490',
    },
    '&:hover svg': {
      color: '#164e63',
    },
  },
  
  '&.MuiButton-colorSuccess': {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderColor: '#86efac',
    '&:hover': {
      backgroundColor: '#bbf7d0',
      color: '#166534',
      borderColor: '#4ade80',
    },
    '& svg': {
      color: '#15803d',
    },
    '&:hover svg': {
      color: '#166534',
    },
  },
};

// Badge/Chip para estados
export const enhancedStatusChip = {
  fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
  height: { xs: 22, sm: 24, md: 26 },
  padding: { xs: '0 8px', sm: '0 10px', md: '0 12px' },
  fontWeight: 600,
  borderRadius: 1.5,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

// Mensaje de tabla vacía - colores claros
export const emptyTableMessage = {
  textAlign: 'center',
  padding: { xs: 4, sm: 5, md: 6 },
  color: '#9ca3af',
  fontStyle: 'italic',
  backgroundColor: '#fafbfc',
  
  '& .empty-icon': {
    fontSize: { xs: 48, sm: 56, md: 64 },
    opacity: 0.4,
    marginBottom: 2,
  },
};

// Paginación mejorada con mejor contraste y sin transform
export const enhancedPagination = {
  marginTop: 3,
  marginBottom: 2,
  display: 'flex',
  justifyContent: 'center',
  padding: 2,
  
  '& .MuiPagination-ul': {
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 1,
  },
  
  '& .MuiPaginationItem-root': {
    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
    fontWeight: 500,
    minWidth: { xs: 36, sm: 40 },
    height: { xs: 36, sm: 40 },
    borderRadius: 2,
    transition: 'background-color 0.15s ease-in-out',
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    
    '&:hover': {
      backgroundColor: '#f3f4f6',
      borderColor: '#9ca3af',
    },
    
    '&.Mui-selected': {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderColor: '#3b82f6',
      fontWeight: 700,
      
      '&:hover': {
        backgroundColor: '#2563eb',
      },
    },
    
    '&.MuiPaginationItem-ellipsis': {
      border: 'none',
      color: '#6b7280',
    },
  },
};

// Filtros y búsqueda arriba de la tabla
export const tableFiltersContainer = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  marginBottom: 3,
  alignItems: { xs: 'stretch', sm: 'center' },
  justifyContent: 'space-between',
};

// Input de búsqueda
export const searchInput = {
  flex: { xs: '1', sm: '0 1 300px' },
  
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.02)',
    },
  },
};

// Tooltip para celdas truncadas
export const truncatedCellWithTooltip = {
  maxWidth: { xs: 120, sm: 200, md: 300 },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  
  '&:hover': {
    color: 'primary.main',
  },
};

// Badge numérico (ej: contador)
export const numericBadge = {
  backgroundColor: 'primary.main',
  color: 'primary.contrastText',
  borderRadius: 12,
  padding: '2px 8px',
  fontSize: '0.75rem',
  fontWeight: 700,
  minWidth: 20,
  textAlign: 'center',
  display: 'inline-block',
};

// Columna con icono + texto
export const iconTextCell = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  
  '& .cell-icon': {
    fontSize: 18,
    color: 'text.secondary',
  },
};

// Loading skeleton para tablas
export const tableLoadingSkeleton = {
  padding: 3,
  
  '& .MuiSkeleton-root': {
    marginBottom: 1,
  },
};

// Wrapper para tabla sticky header
export const stickyHeaderTable = {
  '& .MuiTableHead-root': {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'background.paper',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

// Responsive: Ocultar columnas en mobile
export const hideColumnOnMobile = {
  display: { xs: 'none', sm: 'table-cell' },
};

export const hideColumnOnTablet = {
  display: { xs: 'none', md: 'table-cell' },
};

// Mostrar solo en mobile
export const showOnlyOnMobile = {
  display: { xs: 'table-cell', sm: 'none' },
};

export default {
  enhancedTableContainer,
  enhancedTableHead,
  enhancedTableRow,
  enhancedTableCell,
  enhancedTableCellActions,
  enhancedActionButton,
  enhancedStatusChip,
  emptyTableMessage,
  enhancedPagination,
  tableFiltersContainer,
  searchInput,
  truncatedCellWithTooltip,
  numericBadge,
  iconTextCell,
  tableLoadingSkeleton,
  stickyHeaderTable,
  hideColumnOnMobile,
  hideColumnOnTablet,
  showOnlyOnMobile,
};
