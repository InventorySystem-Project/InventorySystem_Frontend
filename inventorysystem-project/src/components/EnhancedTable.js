import React from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button,
  Pagination,
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import * as tableStyles from '../styles/tableStyles';

/**
 * Componente de tabla mejorada y responsive
 * @param {Array} columns - Definición de columnas: [{ id, label, hideOnMobile, hideOnTablet, align, format }]
 * @param {Array} data - Datos a mostrar
 * @param {Array} actions - Acciones: [{ icon, color, onClick, tooltip }]
 * @param {Object} pagination - { page, totalPages, onChange }
 * @param {string} emptyMessage - Mensaje cuando no hay datos
 * @param {boolean} zebra - Activar zebra striping
 * @param {boolean} hover - Activar hover effect
 */
export const EnhancedTable = ({ 
  columns = [], 
  data = [], 
  actions = [],
  pagination = null,
  emptyMessage = 'No hay datos para mostrar',
  zebra = true,
  hover = true,
  stickyHeader = false
}) => {
  return (
    <Box>
      <TableContainer sx={{
        ...tableStyles.enhancedTableContainer,
        ...(stickyHeader ? tableStyles.stickyHeaderTable : {})
      }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead sx={tableStyles.enhancedTableHead}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    ...(column.hideOnMobile && tableStyles.hideColumnOnMobile),
                    ...(column.hideOnTablet && tableStyles.hideColumnOnTablet),
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center">Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  sx={tableStyles.emptyTableMessage}
                >
                  <Box className="empty-icon">📊</Box>
                  <Typography>{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{
                    ...tableStyles.enhancedTableRow,
                    ...(!zebra && { '&:nth-of-type(even)': { backgroundColor: 'transparent' } }),
                    ...(!hover && { '&:hover': { backgroundColor: 'transparent', transform: 'none' } }),
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        ...tableStyles.enhancedTableCell,
                        ...(column.hideOnMobile && tableStyles.hideColumnOnMobile),
                        ...(column.hideOnTablet && tableStyles.hideColumnOnTablet),
                      }}
                    >
                      {column.format ? column.format(row[column.id], row) : row[column.id]}
                    </TableCell>
                  ))}
                  
                  {actions.length > 0 && (
                    <TableCell align="center" sx={tableStyles.enhancedTableCell}>
                      <Box sx={tableStyles.enhancedTableCellActions}>
                        {actions.map((action, actionIndex) => (
                          <Tooltip key={actionIndex} title={action.tooltip || ''} arrow>
                            <Button
                              color={action.color || 'primary'}
                              onClick={() => action.onClick(row)}
                              sx={tableStyles.enhancedActionButton}
                              disabled={action.disabled && action.disabled(row)}
                            >
                              {action.icon}
                            </Button>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && pagination.totalPages > 1 && (
        <Box sx={tableStyles.enhancedPagination}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={pagination.onChange}
            color="primary"
            showFirstButton
            showLastButton
            size="medium"
          />
        </Box>
      )}
    </Box>
  );
};

/**
 * Componente para Status Chip mejorado
 */
export const StatusChip = ({ label, color = 'default', variant = 'filled' }) => {
  return (
    <Chip
      label={label}
      color={color}
      variant={variant}
      size="small"
      sx={tableStyles.enhancedStatusChip}
    />
  );
};

/**
 * Componente para celda truncada con tooltip
 */
export const TruncatedCell = ({ text, maxLength = 50 }) => {
  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <Tooltip title={text} arrow>
      <Box component="span" sx={tableStyles.truncatedCellWithTooltip}>
        {text}
      </Box>
    </Tooltip>
  );
};

/**
 * Componente para celda con icono
 */
export const IconTextCell = ({ icon, text }) => {
  return (
    <Box sx={tableStyles.iconTextCell}>
      <Box component="span" className="cell-icon">
        {icon}
      </Box>
      <span>{text}</span>
    </Box>
  );
};

/**
 * Componente para badge numérico
 */
export const NumericBadge = ({ value, color = 'primary' }) => {
  return (
    <Box
      sx={{
        ...tableStyles.numericBadge,
        backgroundColor: `${color}.main`,
        color: `${color}.contrastText`,
      }}
    >
      {value}
    </Box>
  );
};

export default {
  EnhancedTable,
  StatusChip,
  TruncatedCell,
  IconTextCell,
  NumericBadge,
};
