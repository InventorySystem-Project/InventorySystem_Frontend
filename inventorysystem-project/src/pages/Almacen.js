import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Pagination } from '@mui/material';
import { FileText, Trash2, Plus, Edit } from "lucide-react";
import { getAlmacenes, addAlmacen, updateAlmacen, deleteAlmacen } from '../services/AlmacenService';
import { getEmpresas } from '../services/EmpresaService'; // Asegúrate de tener este servicio

const Almacen = () => {
  const [almacenes, setAlmacenes] = useState([]);
  const [empresas, setEmpresas] = useState([]); // Estado para empresas
  const [formulario, setFormulario] = useState({
    id: '',
    empresaId: '',
    nombre: '',
    ubicacion: '',
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const almacenesPorPagina = 5;

  useEffect(() => {
    fetchAlmacenes();
    fetchEmpresas();  // Cargar las empresas
  }, []);

  const fetchAlmacenes = async () => {
    const data = await getAlmacenes();
    setAlmacenes(data);
  };

  const fetchEmpresas = async () => {
    const data = await getEmpresas();  // Obtener las empresas del backend
    setEmpresas(data);
  };

  const handleRegistrarAlmacen = async () => {
    if (formulario.id) {
      // Si hay un id, es una actualización
      await updateAlmacen(formulario);
    } else {
      // Si no hay id, es una creación
      await addAlmacen(formulario);
    }
    setMostrarModal(false);
    setFormulario({ id: '', empresaId: '', nombre: '', ubicacion: '' });
    fetchAlmacenes();
  };

  const handleEliminarAlmacen = async (id) => {
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

  const indexOfLast = paginaActual * almacenesPorPagina;
  const indexOfFirst = indexOfLast - almacenesPorPagina;
  const almacenesPaginados = almacenes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(almacenes.length / almacenesPorPagina);

  return (
    <div className="container-general">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h2>Gestión de Almacenes</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setMostrarModal(true)}
        >
          <Plus /> Nuevo Almacén
        </Button>
      </div>

      {/* TABLA DE ALMACENES */}
      <div className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Ubicación</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Empresa</TableCell> {/* Columna para Empresa */}
              <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {almacenesPaginados.map((almacen) => (
              <TableRow key={almacen.id}>
                <TableCell>{almacen.nombre}</TableCell>
                <TableCell>{almacen.ubicacion}</TableCell>
                <TableCell>{empresas.find(e => e.id === almacen.empresaId)?.nombre || '-'}</TableCell> {/* Mostrar nombre de la empresa */}
                <TableCell>
                  <Button color="primary" onClick={() => handleEditAlmacen(almacen)}>
                    <Edit size={18} />
                  </Button>
                  <Button color="error" onClick={() => handleEliminarAlmacen(almacen.id)}>
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

      {/* Modal de registro/edición de almacén */}
      <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '400px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <h3>{formulario.id ? 'Editar Almacén' : 'Nuevo Almacén'}</h3>
          <TextField
            fullWidth
            label="Nombre del Almacén"
            value={formulario.nombre}
            onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Ubicación"
            value={formulario.ubicacion}
            onChange={(e) => setFormulario({ ...formulario, ubicacion: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Empresa"
            value={formulario.empresaId}
            onChange={(e) => setFormulario({ ...formulario, empresaId: e.target.value })}
            margin="normal"
          >
            {empresas.map(e => (
              <MenuItem key={e.id} value={e.id}>
                {e.nombre}
              </MenuItem>
            ))}
          </TextField>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleRegistrarAlmacen}>
              {formulario.id ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Almacen;
