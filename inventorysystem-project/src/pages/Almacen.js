import React, { useState, useEffect } from 'react';
import {
  Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Pagination,
  Grid, Typography, Divider, Alert, CircularProgress
} from '@mui/material';
import { Trash2, Plus, Edit, Eye } from "lucide-react";
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

// SERVICIOS
import { getAlmacenes, addAlmacen, updateAlmacen, deleteAlmacen } from '../services/AlmacenService';
import { getEmpresas } from '../services/EmpresaService';
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando...</Typography></Box>;
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

  useEffect(() => {
    fetchAlmacenes();
    fetchEmpresas();
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
    if (formulario.id) {
      await updateAlmacen(formulario);
    } else {
      await addAlmacen(formulario);
    }
    setMostrarModal(false);
    setFormulario({ id: '', empresaId: '', nombre: '', ubicacion: '' });
    fetchAlmacenes();
  };

  const handleEliminarAlmacen = async (id) => {
    if (isGuest) {
      setShowGuestAlert(true);
      return;
    }
    if (window.confirm('¿Estás seguro que quieres eliminar este almacén?')) {
      try {
        await deleteAlmacen(id);
        fetchAlmacenes();
      } catch (error) {
        console.error('❌ Error al eliminar almacén:', error);
      }
    }
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

        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Ubicación</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Empresa</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#748091', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {almacenesPaginados.map((almacen) => (
              <TableRow key={almacen.id}>
                <TableCell>{almacen.nombre}</TableCell>
                <TableCell>{almacen.ubicacion}</TableCell>
                <TableCell>{empresas.find(e => e.id === almacen.empresaId)?.nombre || '-'}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>
                  <Button color="info" onClick={() => handleOpenStockModal(almacen)} style={{ minWidth: 'auto', padding: '6px' }}>
                    <Eye size={18} />
                  </Button>
                  <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditAlmacen(almacen)} style={{ minWidth: 'auto', padding: '6px' }}>
                    <Edit size={18} />
                  </Button>
                  <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarAlmacen(almacen.id)} style={{ minWidth: 'auto', padding: '6px' }}>
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          count={totalPages}
          page={paginaActual}
          onChange={(event, value) => setPaginaActual(value)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </div>

      {/* Modal de registro/edición (tu código existente) */}
      <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
          <h3>{formulario.id ? 'Editar Almacén' : 'Nuevo Almacén'}</h3>
          <TextField fullWidth label="Nombre del Almacén" value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} margin="normal" />
          <TextField fullWidth label="Ubicación" value={formulario.ubicacion} onChange={(e) => setFormulario({ ...formulario, ubicacion: e.target.value })} margin="normal" />
          <TextField fullWidth select label="Empresa" value={formulario.empresaId} onChange={(e) => setFormulario({ ...formulario, empresaId: e.target.value })} margin="normal">
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
            No tienes permisos para realizar esta acción. Solicita autorización a un administrador mediante un ticket de incidente.
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
    </div>
  );
};

export default Almacen;