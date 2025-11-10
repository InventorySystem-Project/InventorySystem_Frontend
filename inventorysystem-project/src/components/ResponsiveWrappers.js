import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { Plus } from 'lucide-react';
import * as styles from '../styles/commonStyles';

/**
 * Componente wrapper responsive para encabezado de página
 * @param {string} title - Título de la página
 * @param {string} subtitle - Subtítulo descriptivo
 * @param {function} onAdd - Función para botón "Agregar"
 * @param {string} addButtonText - Texto del botón agregar
 * @param {boolean} showAddButton - Mostrar botón agregar
 * @param {ReactNode} rightContent - Contenido personalizado en el lado derecho
 */
export const PageHeader = ({ 
  title, 
  subtitle, 
  onAdd, 
  addButtonText = 'Agregar', 
  showAddButton = true,
  rightContent 
}) => {
  return (
    <Box sx={styles.pageHeader}>
      <Box sx={styles.tableHeader}>
        <Typography variant="h3" sx={styles.pageTitle}>
          {title}
        </Typography>
        <Typography sx={styles.pageSubtitle}>
          {subtitle}
        </Typography>
      </Box>
      {rightContent || (showAddButton && onAdd && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={onAdd}
          sx={styles.buttonFullMobile}
        >
          {addButtonText}
        </Button>
      ))}
    </Box>
  );
};

/**
 * Componente wrapper para layout de página
 */
export const PageLayout = ({ children }) => {
  return (
    <Box sx={styles.pageContainer}>
      {children}
    </Box>
  );
};

/**
 * Componente wrapper para modales responsive
 * @param {boolean} open - Estado del modal
 * @param {function} onClose - Función para cerrar
 * @param {string} title - Título del modal
 * @param {ReactNode} children - Contenido del modal
 * @param {boolean} large - Usar tamaño grande
 */
export const ResponsiveModal = ({ open, onClose, title, children, large = false }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={large ? styles.modalBoxLarge : styles.modalBox}>
        {title && (
          <Typography variant="h5" sx={styles.centeredTitle}>
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </Modal>
  );
};

/**
 * Componente para formularios con layout responsive
 */
export const FormLayout = ({ children }) => {
  return (
    <Box sx={styles.formContainer}>
      {children}
    </Box>
  );
};

/**
 * Fila de formulario (2 columnas en desktop, 1 en mobile)
 */
export const FormRow = ({ children }) => {
  return (
    <Box sx={styles.formRow}>
      {children}
    </Box>
  );
};

/**
 * Grupo de botones responsive
 */
export const ButtonGroup = ({ children }) => {
  return (
    <Box sx={styles.buttonGroup}>
      {children}
    </Box>
  );
};

/**
 * Wrapper para tablas responsive
 */
export const ResponsiveTable = ({ children }) => {
  return (
    <Box sx={styles.tableContainer}>
      {children}
    </Box>
  );
};

export default {
  PageHeader,
  PageLayout,
  ResponsiveModal,
  FormLayout,
  FormRow,
  ButtonGroup,
  ResponsiveTable,
};
