import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Plus, MessageCircle, AlertCircle, Info, Pencil, Edit } from "lucide-react";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableContainer,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  Pagination
} from '@mui/material';
import { getReclamos, addReclamo, deleteReclamo, updateReclamo } from '../services/ReclamoService';
import * as tableStyles from '../styles/tableStyles';
import { getOrdenesCompra } from '../services/OrdenCompraService';
import { getProveedores } from '../services/ProveedorService';

const Reclamo = () => {
  const [reclamos, setReclamos] = useState([]);
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [formulario, setFormulario] = useState({
    motivo: '',
    ordenCompraId: ''
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [reclamoEditando, setReclamoEditando] = useState(null);

  const reclamosPorPagina = 5;

  useEffect(() => {
    fetchReclamos();
    fetchOrdenesCompra();
    fetchProveedores();
  }, []);

  const fetchReclamos = async () => {
    try {
      const data = await getReclamos();
      setReclamos(data);
    } catch (error) {
      console.error("❌ Error al cargar reclamos:", error.response || error.message);
    }
  };

  const fetchOrdenesCompra = async () => {
    try {
      const data = await getOrdenesCompra();
      setOrdenesCompra(data);
    } catch (error) {
      console.error("❌ Error al cargar órdenes de compra:", error.response || error.message);
    }
  };

  const fetchProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      console.error("❌ Error al cargar proveedores:", error.response || error.message);
    }
  };

  const actualizarProveedorPorOrden = (ordenCompraId) => {
    if (!ordenCompraId) {
      setProveedorSeleccionado(null);
      return;
    }
    
    const ordenSeleccionada = ordenesCompra.find(oc => oc.id === ordenCompraId);
    if (ordenSeleccionada) {
      // Utilizamos proveedorId en lugar de proveedor_id para coincidir con el DTO
      const proveedorAsociado = proveedores.find(p => p.id === ordenSeleccionada.proveedorId);
      setProveedorSeleccionado(proveedorAsociado);
    } else {
      setProveedorSeleccionado(null);
    }
  };

  const handleRegistrarReclamo = async () => {
    try {
      if (!formulario.motivo || !formulario.ordenCompraId) {
        alert('Por favor ingrese todos los campos requeridos');
        return;
      }
      
      const nuevoReclamo = {
        motivo: formulario.motivo,
        ordenCompraId: formulario.ordenCompraId
      };

      if (reclamoEditando) {
        // Si estamos editando un reclamo existente
        const reclamoActualizado = {
          ...nuevoReclamo,
          id: reclamoEditando.id
        };
        
        await updateReclamo(reclamoActualizado);
        setReclamos(prev => prev.map(r => r.id === reclamoEditando.id ? reclamoActualizado : r));
      } else {
        // Si es un nuevo reclamo
        await addReclamo(nuevoReclamo);
      }

      // Limpiar formulario y cerrar modal
      setMostrarModal(false);
      setFormulario({ motivo: '', ordenCompraId: '' });
      setProveedorSeleccionado(null);
      setReclamoEditando(null);
      fetchReclamos(); // Refrescar lista de reclamos
    } catch (error) {
      console.error('❌ Error al procesar el reclamo:', error);
    }
  };

  const handleEditarReclamo = (reclamo) => {
    setReclamoEditando(reclamo);
    setFormulario({
      motivo: reclamo.motivo,
      ordenCompraId: reclamo.ordenCompraId
    });
    actualizarProveedorPorOrden(reclamo.ordenCompraId);
    setMostrarModal(true);
  };

  const handleEliminarReclamo = async (id) => {
    if (window.confirm('¿Estás seguro que quieres eliminar este reclamo?')) {
      try {
        await deleteReclamo(id);
        fetchReclamos();
      } catch (error) {
        console.error('❌ Error al eliminar reclamo:', error);
      }
    }
  };

  // Función para obtener el código de orden de compra a partir del ID
  const getCodigoOrdenCompra = (ordenCompraId) => {
    const orden = ordenesCompra.find(oc => oc.id === ordenCompraId);
    return orden ? orden.codigoOrden : 'N/A';
  };

  // Paginación
  const indexOfLast = paginaActual * reclamosPorPagina;
  const indexOfFirst = indexOfLast - reclamosPorPagina;
  const reclamosPaginados = reclamos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reclamos.length / reclamosPorPagina);

  return (
    <div className="container-general">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h2>Gestión de Reclamos</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFormulario({ motivo: '', ordenCompraId: '' });
            setProveedorSeleccionado(null);
            setReclamoEditando(null);
            setMostrarModal(true);
          }}
        >
          <Plus /> Nuevo Reclamo
        </Button>
      </div>

      {/* TABLA DE RECLAMOS */}
      <div className="table-container">
        <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
          <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Reclamos</h3>
          <p style={{ margin: 0, textAlign: 'left' }}>Administre los reclamos registrados sobre órdenes de compra</p>
        </div>

        <TableContainer sx={tableStyles.enhancedTableContainer}>
          <Table>
            <TableHead sx={tableStyles.enhancedTableHead}>
              <TableRow>
                <TableCell sx={tableStyles.hideColumnOnMobile}>ID</TableCell>
                <TableCell>Orden de Compra</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reclamosPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={tableStyles.emptyTableMessage}>
                    <Box className="empty-icon">📢</Box>
                    <Typography>No hay reclamos registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reclamosPaginados.map((reclamo) => (
                  <TableRow key={reclamo.id} sx={tableStyles.enhancedTableRow}>
                    <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{reclamo.id}</TableCell>
                    <TableCell sx={tableStyles.enhancedTableCell}>{getCodigoOrdenCompra(reclamo.ordenCompraId)}</TableCell>
                    <TableCell sx={tableStyles.enhancedTableCell}>{reclamo.motivo}</TableCell>
                    <TableCell sx={tableStyles.enhancedTableCell} align="center">
                      <Box sx={tableStyles.enhancedTableCellActions}>
                        <Button color="info" onClick={() => handleEditarReclamo(reclamo)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                        </Button>
                        <Button color="error" onClick={() => handleEliminarReclamo(reclamo.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
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
      </div>

      {/* MODAL PARA CREAR/EDITAR RECLAMO */}
      <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '10px',
          width: '450px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3>{reclamoEditando ? 'Editar Reclamo' : 'Nuevo Reclamo'}</h3>

          <TextField
            fullWidth
            select
            label="Orden de Compra"
            value={formulario.ordenCompraId}
            onChange={e => {
              const nuevoValor = e.target.value;
              setFormulario({ ...formulario, ordenCompraId: nuevoValor });
              actualizarProveedorPorOrden(nuevoValor);
            }}
            margin="normal"
          >
            {ordenesCompra.map(oc => (
              <MenuItem key={oc.id} value={oc.id}>
                {oc.codigoOrden}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Proveedor"
            value={proveedorSeleccionado ? proveedorSeleccionado.nombreEmpresaProveedor : ''}
            disabled
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motivo del Reclamo"
            value={formulario.motivo}
            onChange={e => setFormulario({ ...formulario, motivo: e.target.value })}
            margin="normal"
            placeholder="Describa el motivo del reclamo"
          />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={() => setMostrarModal(false)}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleRegistrarReclamo}>
              {reclamoEditando ? 'Actualizar Reclamo' : 'Registrar Reclamo'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Reclamo;