/**
 * Estilos comunes responsive usando Material-UI `sx` prop
 * Estos estilos siguen el mobile-first approach
 */

// Container principal con padding responsive
export const pageContainer = {
  padding: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
  },
  height: '100%',
  overflow: 'auto',
};

// Header de página responsive
export const pageHeader = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-between',
  alignItems: { xs: 'stretch', sm: 'center' },
  gap: { xs: 2, sm: 0 },
  marginBottom: 3,
  width: '100%',
};

// Título de página
export const pageTitle = {
  marginTop: { xs: 1, sm: 1.25 },
  textAlign: 'left',
  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
  fontWeight: 600,
};

// Subtítulo de página
export const pageSubtitle = {
  margin: 0,
  textAlign: 'left',
  color: 'text.secondary',
  fontSize: { xs: '0.875rem', sm: '1rem' },
};

// Card/Paper responsive
export const cardContainer = {
  padding: { xs: 2, sm: 2.5, md: 3 },
  borderRadius: 2.5,
  backgroundColor: 'background.paper',
  boxShadow: 1,
};

// Modal responsive
export const modalBox = {
  backgroundColor: 'background.paper',
  padding: { xs: 2.5, sm: 3, md: 4 },
  borderRadius: 2.5,
  width: {
    xs: '95%',
    sm: '90%',
    md: '600px',
  },
  maxWidth: '700px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: 24,
};

// Modal grande (formularios complejos)
export const modalBoxLarge = {
  ...modalBox,
  width: {
    xs: '95%',
    sm: '90%',
    md: '800px',
  },
  maxWidth: '900px',
};

// Container de formulario
export const formContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 2, sm: 2.5 },
};

// Fila de formulario (2 columnas en desktop, 1 en mobile)
export const formRow = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 2.5 },
};

// Campo de formulario flex
export const formField = {
  flex: 1,
};

// Grupo de botones
export const buttonGroup = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'center',
  gap: { xs: 1.5, sm: 2 },
  marginTop: { xs: 2.5, sm: 3 },
};

// Botón responsive
export const button = {
  minWidth: { xs: '100%', sm: '120px' },
  padding: { xs: '10px 20px', sm: '8px 16px' },
};

// Botón ancho completo en mobile
export const buttonFullMobile = {
  width: { xs: '100%', sm: 'auto' },
  minWidth: { sm: '120px' },
};

// Container de tabla responsive
export const tableContainer = {
  width: '100%',
  overflowX: 'auto',
  marginTop: 2,
};

// Header de tabla
export const tableHeader = {
  paddingTop: 0,
  width: '100%',
  marginBottom: 2,
};

// Celda de tabla con acciones
export const tableCellActions = {
  display: 'flex',
  gap: 0.5,
  justifyContent: { xs: 'flex-start', sm: 'center' },
  flexWrap: 'wrap',
};

// Botón de acción en tabla (pequeño)
export const actionButton = {
  minWidth: 'auto',
  padding: { xs: '8px', sm: '6px' },
};

// Alert/Modal de confirmación
export const alertModal = {
  backgroundColor: 'background.paper',
  padding: { xs: 2.5, sm: 3 },
  borderRadius: 2.5,
  minWidth: { xs: '90%', sm: '400px' },
  maxWidth: '500px',
  textAlign: 'center',
  borderTop: '5px solid',
  boxShadow: 24,
};

// Grid responsive
export const gridContainer = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)',
  },
  gap: { xs: 2, sm: 2.5, md: 3 },
};

// Stack horizontal responsive (se vuelve vertical en mobile)
export const stackHorizontal = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 2.5 },
  alignItems: { xs: 'stretch', sm: 'center' },
};

// Container de paginación
export const paginationContainer = {
  marginTop: 2.5,
  display: 'flex',
  justifyContent: 'center',
  '& .MuiPagination-ul': {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
};

// Detalle de stock (en Almacen)
export const stockDetailContainer = {
  backgroundColor: 'background.paper',
  padding: { xs: 2, sm: 2.5, md: 3 },
  borderRadius: 2.5,
  width: {
    xs: '95%',
    sm: '90%',
    md: '80%',
    lg: '70%',
  },
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: 24,
};

// Título centrado
export const centeredTitle = {
  textAlign: 'center',
  marginBottom: 3,
  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
  fontWeight: 600,
};

// Columnas flex responsive
export const flexColumns = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 3,
  marginTop: 2,
};

// Input con icono
export const inputWithIcon = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  width: '100%',
};

// Ocultar en mobile
export const hideOnMobile = {
  display: { xs: 'none', sm: 'table-cell' },
};

// Ocultar en desktop
export const hideOnDesktop = {
  display: { xs: 'table-cell', sm: 'none' },
};

// Texto truncado con ellipsis
export const truncatedText = {
  maxWidth: { xs: 150, sm: 300, md: 400 },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

// Badge/Chip responsive
export const statusChip = {
  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
  height: { xs: 24, sm: 28 },
  padding: { xs: '0 8px', sm: '0 12px' },
};

export default {
  pageContainer,
  pageHeader,
  pageTitle,
  pageSubtitle,
  cardContainer,
  modalBox,
  modalBoxLarge,
  formContainer,
  formRow,
  formField,
  buttonGroup,
  button,
  buttonFullMobile,
  tableContainer,
  tableHeader,
  tableCellActions,
  actionButton,
  alertModal,
  gridContainer,
  stackHorizontal,
  paginationContainer,
  stockDetailContainer,
  centeredTitle,
  flexColumns,
  inputWithIcon,
  hideOnMobile,
  hideOnDesktop,
  truncatedText,
  statusChip,
};
