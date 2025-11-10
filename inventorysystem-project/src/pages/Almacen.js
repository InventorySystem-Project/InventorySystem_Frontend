import React, { useState, useEffect } from 'react';
import {
  Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Pagination,
  Grid, Typography, Divider, Alert, CircularProgress, TableContainer
} from '@mui/material';
import { Trash2, Plus, Edit, Eye } from "lucide-react";
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import * as tableStyles from '../styles/tableStyles';

// SERVICIOS
import { getAlmacenes, addAlmacen, updateAlmacen, deleteAlmacen } from '../services/AlmacenService';
import { getEmpresas } from '../services/EmpresaService';
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import { getProductosTerminados } from '../services/ProductoTerminadoService';

// --- Componente para el Detalle del Stock (con nuevo diseño estilo formulario) ---
const AlmacenStockDetalle = ({ almacen }) => {
  const [stockMateriasPrimas, setStockMateriasPrimas] = useState([]);
  const [stockProductosTerminados, setStockProductosTerminados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!almacen) return;

    const fetchStock = async () => {
      try {
        setLoading(true);
        setError('');
        const [movimientosMPRes, movimientosPTRes, materiasPrimasRes, productosTerminadosRes] = await Promise.all([
          getMovimientosInventarioMP(), getMovimientosInventarioPT(), getMateriasPrimas(), getProductosTerminados()
        ]);

        const safeMovimientosMP = Array.isArray(movimientosMPRes) ? movimientosMPRes : [];
        const safeMovimientosPT = Array.isArray(movimientosPTRes) ? movimientosPTRes : [];
        const materiasPrimasMap = new Map((Array.isArray(materiasPrimasRes) ? materiasPrimasRes : []).map(mp => [mp.id, mp.nombre]));
        const productosTerminadosMap = new Map((Array.isArray(productosTerminadosRes) ? productosTerminadosRes : []).map(pt => [pt.id, pt.nombre]));

        const stockMP = {};
        safeMovimientosMP.filter(m => m.almacenId === almacen.id).forEach(mov => {
          stockMP[mov.materiaPrimaId] = (stockMP[mov.materiaPrimaId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
        });
        setStockMateriasPrimas(Object.keys(stockMP).map(id => ({
          nombre: materiasPrimasMap.get(parseInt(id)) || `ID ${id}`, stock: stockMP[id]
        })));

        const stockPT = {};
        safeMovimientosPT.filter(m => m.almacenId === almacen.id).forEach(mov => {
          stockPT[mov.productoTerminadoId] = (stockPT[mov.productoTerminadoId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
        });
        setStockProductosTerminados(Object.keys(stockPT).map(id => ({
          nombre: productosTerminadosMap.get(parseInt(id)) || `ID ${id}`, stock: stockPT[id]
        })));

      } catch (err) {
        setError('Error al cargar el detalle del stock.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [almacen]);

  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <CircularProgress size={40} style={{ color: '#3b82f6' }} />
      <Typography sx={{ mt: 2, color: '#64748b', fontSize: '0.95rem' }}>
        Cargando almacenes...
      </Typography>
    </Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <h3 style={{ textAlign: 'center' }}>Detalle de Stock: {almacen.nombre}</h3>
      <Grid container spacing={3} sx={{ mt: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* Columna Izquierda: Productos Terminados */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Productos Terminados</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Producto</strong></TableCell>
                <TableCell align="right"><strong>Stock Actual</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockProductosTerminados.length > 0 ? (
                stockProductosTerminados.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell align="right" sx={{ color: item.stock < 5 ? 'red' : 'inherit' }}>
                      {item.stock}
                    </TableCell>                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">No hay stock.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Grid>

        {/* Columna Derecha: Materias Primas */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Materias Primas</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Materia Prima</strong></TableCell>
                <TableCell align="right"><strong>Stock Actual</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockMateriasPrimas.length > 0 ? (
                stockMateriasPrimas.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell align="right" sx={{ color: item.stock < 5 ? 'red' : 'inherit' }}>
                      {item.stock}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">No hay stock.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </>
  );
};
// --- Fin del Componente de Detalle ---

const Almacen = () => {
  // ... (Tu código de estados y funciones permanece igual)
  const { role } = useAuth();
  const isGuest = role === ROLES.GUEST;
  const [showGuestAlert, setShowGuestAlert] = useState(false);

  const [almacenes, setAlmacenes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [formulario, setFormulario] = useState({ id: '', empresaId: '', nombre: '', ubicacion: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const almacenesPorPagina = 5;
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Hook para modals
  const { modalConfig, showConfirm, showSuccess, showError, hideModal } = useModal();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchAlmacenes();
        await fetchEmpresas();
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchAlmacenes = async () => {
    const data = await getAlmacenes();
    setAlmacenes(data);
  };

  const fetchEmpresas = async () => {
    const data = await getEmpresas();
    setEmpresas(data);
  };

  const handleRegistrarAlmacen = async () => {
    if (isGuest) {
      setShowGuestAlert(true);
      return;
    }
    
    // Activar validación visual
    setIntentoGuardar(true);
    
    // Validar campos obligatorios
    if (!formulario.nombre || formulario.nombre.trim() === '') {
      return;
    }
    
    if (!formulario.ubicacion || formulario.ubicacion.trim() === '') {
      return;
    }
    
    if (!formulario.empresaId) {
      return;
    }
    
    try {
      if (formulario.id) {
        await updateAlmacen(formulario);
        showSuccess('Almacén actualizado correctamente');
      } else {
        await addAlmacen(formulario);
        showSuccess('Almacén creado correctamente');
      }
      
      // Recargar la lista completa desde el servidor
      await fetchAlmacenes();
      
      setMostrarModal(false);
      setFormulario({ id: '', empresaId: '', nombre: '', ubicacion: '' });
      setIntentoGuardar(false);
    } catch (error) {
      console.error('Error al registrar almacén:', error);
    }
  };

  const handleEliminarAlmacen = async (id) => {
    if (isGuest) {
      setShowGuestAlert(true);
      return;
    }
    showConfirm(
      '¿Estás seguro que quieres eliminar este almacén?',
      async () => {
        try {
          await deleteAlmacen(id);
          showSuccess('Almacén eliminado correctamente');
          
          // Recargar la lista completa desde el servidor
          await fetchAlmacenes();
        } catch (error) {
          console.error('❌ Error al eliminar almacén:', error);
          
          // Mostrar mensaje de error al usuario
          const errorMessage = error.message || 'No se pudo eliminar el almacén. Puede que tenga movimientos registrados.';
          showError(errorMessage, 'Error al eliminar almacén');
        }
      },
      'Eliminar Almacén'
    );
  };

  const handleEditAlmacen = (almacen) => {
    setFormulario(almacen);
    setMostrarModal(true);
  };

  const handleOpenStockModal = (almacen) => {
    setAlmacenSeleccionado(almacen);
    setStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setStockModalOpen(false);
    setAlmacenSeleccionado(null);
  };

  const handleOpenCreateModal = () => {
    setFormulario({ id: '', empresaId: '', nombre: '', ubicacion: '' });
    setIntentoGuardar(false);
    setMostrarModal(true);
  }

  const indexOfLast = paginaActual * almacenesPorPagina;
  const indexOfFirst = indexOfLast - almacenesPorPagina;
  const almacenesPaginados = almacenes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(almacenes.length / almacenesPorPagina);


  return (
    <div className="container-general">
      {/* ... (Tu código de la tabla principal y el modal de creación/edición permanece igual) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h2>Gestión de Almacenes</h2>
        <Button variant="contained" color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleOpenCreateModal()}>
          <Plus /> Nuevo Almacén
        </Button>
      </div>

      <div className="table-container">
        <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
          <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Almacenes</h3>
          <p style={{ margin: 0, textAlign: 'left' }}>Administre sus almacenes</p>
        </div>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '60px'
            }}
          >
            <CircularProgress size={40} style={{ color: '#3b82f6' }} />
            <Typography variant="body1" sx={{ marginTop: 2, color: '#666' }}>
              Cargando almacenes...
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={tableStyles.enhancedTableContainer}>
          <Table>
            <TableHead sx={tableStyles.enhancedTableHead}>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell sx={tableStyles.hideColumnOnMobile}>Ubicación</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {almacenesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={tableStyles.emptyTableMessage}>
                    <Box className="empty-icon">🏢</Box>
                    <Typography>No hay almacenes registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                almacenesPaginados.map((almacen) => (
                  <TableRow key={almacen.id} sx={tableStyles.enhancedTableRow}>
                    <TableCell sx={tableStyles.enhancedTableCell}>{almacen.nombre}</TableCell>
                    <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{almacen.ubicacion}</TableCell>
                    <TableCell sx={tableStyles.enhancedTableCell}>{empresas.find(e => e.id === almacen.empresaId)?.nombre || '-'}</TableCell>
                    <TableCell sx={tableStyles.enhancedTableCell} align="center">
                      <Box sx={tableStyles.enhancedTableCellActions}>
                        <Button color="info" onClick={() => handleOpenStockModal(almacen)} sx={tableStyles.enhancedActionButton} startIcon={<Eye size={18} />}>
                        </Button>
                        <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditAlmacen(almacen)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                        </Button>
                        <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarAlmacen(almacen.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Box sx={tableStyles.enhancedPagination}>
            <Pagination
              count={totalPages}
              page={paginaActual}
              onChange={(event, value) => setPaginaActual(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </TableContainer>
        )}
      </div>

      {/* Modal de registro/edición (tu código existente) */}
      <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
          <h3>{formulario.id ? 'Editar Almacén' : 'Nuevo Almacén'}</h3>
          <TextField 
            fullWidth 
            label="Nombre del Almacén" 
            value={formulario.nombre} 
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} 
            margin="normal" 
            required
            error={intentoGuardar && (!formulario.nombre || formulario.nombre.trim() === '')}
            helperText={intentoGuardar && (!formulario.nombre || formulario.nombre.trim() === '') ? 'Este campo es obligatorio' : ''}
          />
          <TextField 
            fullWidth 
            label="Ubicación" 
            value={formulario.ubicacion} 
            onChange={(e) => setFormulario({ ...formulario, ubicacion: e.target.value })} 
            margin="normal" 
            required
            error={intentoGuardar && (!formulario.ubicacion || formulario.ubicacion.trim() === '')}
            helperText={intentoGuardar && (!formulario.ubicacion || formulario.ubicacion.trim() === '') ? 'Este campo es obligatorio' : ''}
          />
          <TextField 
            fullWidth 
            select 
            label="Empresa" 
            value={formulario.empresaId} 
            onChange={(e) => setFormulario({ ...formulario, empresaId: e.target.value })} 
            margin="normal"
            required
            error={intentoGuardar && !formulario.empresaId}
            helperText={intentoGuardar && !formulario.empresaId ? 'Debe seleccionar una empresa' : ''}
          >
            {empresas.map(e => (<MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>))}
          </TextField>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleRegistrarAlmacen}>{formulario.id ? 'Actualizar' : 'Registrar'}</Button>
          </div>
        </Box>
      </Modal>
      {/* Guest alert modal */}
      <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
          <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
          <Typography style={{ margin: '15px 0' }}>
            No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhastApp 985804246.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
        </Box>
      </Modal>

      {/* --- MODAL DE DETALLE DE STOCK CON EL NUEVO ESTILO --- */}
      <Modal open={stockModalOpen} onClose={handleCloseStockModal} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{
          background: '#fff',
          padding: '25px',
          borderRadius: '10px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          alignitems: 'flex-start',
        }}>
          {almacenSeleccionado && <AlmacenStockDetalle almacen={almacenSeleccionado} />}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={handleCloseStockModal}>Cerrar</Button>
          </div>
        </Box>
      </Modal>
      
      <CustomModal config={modalConfig} onClose={hideModal} />
    </div>
  );
};

export default Almacen;