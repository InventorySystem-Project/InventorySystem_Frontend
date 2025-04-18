import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Trash2, Plus, Clock, CheckCircle2, Loader2, XCircle, Pencil } from "lucide-react";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination
} from '@mui/material';
import { getOrdenesCompra, addOrdenCompra, deleteOrdenCompra, updateOrdenCompra } from '../services/OrdenCompraService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getEmpresas } from '../services/EmpresaService';
import { getProveedores } from '../services/ProveedorService';

const OrdenCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [formulario, setFormulario] = useState({
    empresaId: '',
    proveedorId: '',
    fechaEmision: '',
    estado: ''
  });
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [productoActual, setProductoActual] = useState({ materiaPrimaId: '', cantidad: 1 });
  const [ordenEditando, setOrdenEditando] = useState(null); // Estado para orden en edición

  const [pdfPreview, setPdfPreview] = useState(null);
  const [openPdfModal, setOpenPdfModal] = useState(false);

  const ordenesPorPagina = 5;

  useEffect(() => {
    fetchOrdenes();
    fetchEmpresas();
    fetchProveedores();
    fetchMateriasPrimas();
  }, []);

  const fetchOrdenes = async () => {
    const data = await getOrdenesCompra();
    setOrdenes(data);
  };

  const fetchEmpresas = async () => {
    const data = await getEmpresas();
    setEmpresas(data);
  };

  const fetchProveedores = async () => {
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (error) {
      console.error("❌ Error al cargar proveedores:", error.response || error.message);
    }
  };

  const fetchMateriasPrimas = async () => {
    const data = await getMateriasPrimas();
    setMateriasPrimas(data);
  };

  const handleAgregarProducto = () => {
    setProductosSeleccionados([...productosSeleccionados, { materiaPrimaId: '', cantidad: 0 }]);
  };

  const handleProductoChange = (index, field, value) => {
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index][field] = value;
    setProductosSeleccionados(nuevosProductos);
  };

  const handleEliminarProducto = (index) => {
    const nuevos = [...productosSeleccionados];
    nuevos.splice(index, 1);
    setProductosSeleccionados(nuevos);
  };

  const handleRegistrarOrden = async () => {
    const nuevaOrden = {
      empresaId: formulario.empresaId,
      proveedorId: formulario.proveedorId,
      fechaEmision: formulario.fechaEmision,
      estado: formulario.estado,
      codigoOrden: codigoGenerado,
      detalles: productosSeleccionados
    };

    if (ordenEditando) {
      // Crear un objeto que incluya el ID del ordenEditando
      const ordenCompleta = {
        ...nuevaOrden,
        id: ordenEditando.id
      };
      
      // Llamar al servicio con un solo parámetro
      await updateOrdenCompra(ordenCompleta);
      
      setOrdenes(prev => prev.map(o => o.id === ordenEditando.id ? ordenCompleta : o));
    
    } else {
      // Si es una nueva orden
      await addOrdenCompra(nuevaOrden);
    }
    
    setMostrarModal(false);
    setFormulario({ empresaId: '', proveedorId: '', fechaEmision: '', estado: '' });
    setProductosSeleccionados([]);
    setOrdenEditando(null);
    fetchOrdenes();
  };

  const handleEditarOrden = (orden) => {
    setOrdenEditando(orden);
    setFormulario({
      empresaId: orden.empresaId,
      proveedorId: orden.proveedorId,
      fechaEmision: orden.fechaEmision,
      estado: orden.estado
    });
    setCodigoGenerado(orden.codigoOrden);
    setProductosSeleccionados(orden.detalles || []);
    setMostrarModal(true);
  };

  const handleEliminarOrden = async (id) => {
    if (window.confirm('¿Estás seguro que quieres eliminar esta orden de compra?')) {
      try {
        await deleteOrdenCompra(id);
        fetchOrdenes();
      } catch (error) {
        console.error('❌ Error al eliminar orden:', error);
      }
    }
  };

  const generarPDF = (orden) => {
    if (!orden.detalles || orden.detalles.length === 0) {
      alert("Esta orden no tiene productos registrados.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ORDEN DE COMPRA", 70, 20);

    doc.setFontSize(12);
    doc.text(`Número de O/C: ${orden.codigoOrden}`, 14, 40);
    doc.text(`Fecha de Emisión: ${orden.fechaEmision}`, 14, 48);

    const proveedor = proveedores.find(p => p.id === orden.proveedorId);
    doc.text(`Proveedor: ${proveedor?.nombreEmpresaProveedor || '-'}`, 14, 56);

    const empresa = empresas.find(p => p.id === orden.empresaId);
    doc.text(`Empresa Solicitante: ${empresa?.nombre || '-'}`, 14, 64);

    const columns = ["Cantidad", "Producto"];
    const rows = (orden.detalles || []).map((detalle) => {
      const producto = materiasPrimas.find(mp => mp.id === detalle.materiaPrimaId);
      return [detalle.cantidad, producto?.nombre || '-'];
    });

    autoTable(doc, {
      startY: 70,
      head: [columns],
      body: rows,
    });

    const pdfDataUri = doc.output('datauristring');
    setPdfPreview(pdfDataUri);
    setOpenPdfModal(true);
  };

  const indexOfLast = paginaActual * ordenesPorPagina;
  const indexOfFirst = indexOfLast - ordenesPorPagina;
  const ordenesPaginadas = ordenes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(ordenes.length / ordenesPorPagina);

  const renderEstado = (estado) => {
    switch (estado) {
      case 'En proceso':
        return (
          <div style={{ backgroundColor: '#FFF8E1', color: '#FFC107', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            <Clock size={16} style={{ marginRight: '5px' }} /> En Proceso
          </div>
        );
      case 'Aprobada':
        return (
          <div style={{ backgroundColor: '#E3F2FD', color: '#2196F3', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            <Loader2 size={16} style={{ marginRight: '5px' }} /> Aprobada
          </div>
        );
      case 'Completada':
        return (
          <div style={{ backgroundColor: '#E8F5E9', color: '#4CAF50', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            <CheckCircle2 size={16} style={{ marginRight: '5px' }} /> Completada
          </div>
        );
      case 'Rechazada':
        return (
          <div style={{ backgroundColor: '#FFEBEE', color: '#F44336', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
            <XCircle size={16} style={{ marginRight: '5px' }} /> Rechazada
          </div>
        );
      default:
        return estado;
    }
  };


  return (
    <div className="container-general">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h2>Gestión de Órdenes de Compra</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const siguienteId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
            const today = new Date().toISOString().split('T')[0];
            setCodigoGenerado(`OC-${siguienteId.toString().padStart(4, '0')}`);
            setFormulario(prev => ({ ...prev, fechaEmision: today }));
            setOrdenEditando(null); // Limpiar orden en edición
            setProductosSeleccionados([]); // Limpiar productos seleccionados
            setMostrarModal(true);
          }}
        >
          <Plus /> Nueva Orden
        </Button>
      </div>

      {/* TABLA DE ORDENES */}
      <div className="table-container">
        <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
          <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Órdenes</h3>
          <p style={{ margin: 0, textAlign: 'left' }}>Administre las órdenes de compra realizadas</p>
        </div>

        <div style={{ padding: '0px', borderRadius: '8px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Código</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Proveedor</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenesPaginadas.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell>{orden.codigoOrden}</TableCell>
                  <TableCell>{proveedores.find(p => p.id === orden.proveedorId)?.nombreEmpresaProveedor || "-"}</TableCell>
                  <TableCell>{orden.fechaEmision}</TableCell>
                  <TableCell>{renderEstado(orden.estado)}</TableCell>
                  <TableCell>
                    <Button color="primary" onClick={() => generarPDF(orden)}>
                      <FileText size={18} />
                    </Button>
                    <Button color="info" onClick={() => handleEditarOrden(orden)}>
                      <Pencil size={18} />
                    </Button>
                    <Button color="error" onClick={() => handleEliminarOrden(orden.id)}>
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
      </div>

      <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '10px',
          minWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3>{ordenEditando ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h3>

          <TextField fullWidth select label="Empresa" value={formulario.empresaId} onChange={e => setFormulario({ ...formulario, empresaId: e.target.value })} margin="normal">
            {empresas.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
          </TextField>

          <TextField fullWidth select label="Proveedor" value={formulario.proveedorId} onChange={e => setFormulario({ ...formulario, proveedorId: e.target.value })} margin="normal">
            {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombreEmpresaProveedor}</MenuItem>)}
          </TextField>

          {/* Agrupar Fecha + Estado en la misma fila */}
          <div className="formulario-fila">
            <TextField
              fullWidth
              type="date"
              label="Fecha de Emisión"
              InputLabelProps={{ shrink: true }}
              value={formulario.fechaEmision}
              onChange={e => setFormulario({ ...formulario, fechaEmision: e.target.value })}
              size="medium"
            />
            <TextField
              fullWidth
              select
              label="Estado"
              value={formulario.estado}
              onChange={e => setFormulario({ ...formulario, estado: e.target.value })}
              size="medium"
            >
              <MenuItem value="En proceso">En proceso</MenuItem>
              <MenuItem value="Aprobada">Aprobada</MenuItem>
              <MenuItem value="Completada">Completada</MenuItem>
              <MenuItem value="Rechazada">Rechazada</MenuItem>
            </TextField>
          </div>


          <TextField fullWidth label="Código de Orden" value={codigoGenerado} disabled margin="normal" />

          <h4>Productos de la Orden</h4>

          {/* Línea horizontal para agregar producto */}
          <div className="producto-formulario-contenedor">
            {/* Fila de labels */}
            <div className="producto-formulario-labels">
              <div className="label-item">Producto</div>
              <div className="label-item">Cantidad</div>
            </div>

            {/* Fila de inputs */}
            <div className="producto-formulario-inputs">
              <TextField
                select
                value={productoActual.materiaPrimaId}
                onChange={e => setProductoActual({ ...productoActual, materiaPrimaId: e.target.value })}
                size="small"
                className="input-producto"
              >
                {materiasPrimas.map(mp => (
                  <MenuItem key={mp.id} value={mp.id}>
                    {mp.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="number"
                value={productoActual.cantidad}
                onChange={e => setProductoActual({ ...productoActual, cantidad: Number(e.target.value) })}
                size="small"
                className="input-cantidad"
              />
            </div>

            {/* Botón en su propia fila */}
            <div className="producto-formulario-boton">
              <Button
                variant="outlined"
                onClick={() => {
                  if (!productoActual.materiaPrimaId || productoActual.cantidad < 1) {
                    alert('Seleccione un producto y una cantidad válida');
                    return;
                  }
                  setProductosSeleccionados([...productosSeleccionados, productoActual]);
                  setProductoActual({ materiaPrimaId: '', cantidad: 1 });
                }}
                className="boton-agregar"
              >
                + Agregar Producto
              </Button>
            </div>
          </div>

          {/* Tabla resumen de productos */}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Producto</strong></TableCell>
                <TableCell><strong>Cantidad</strong></TableCell>
                <TableCell><strong>Eliminar</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosSeleccionados.map((item, index) => {
                const producto = materiasPrimas.find(mp => mp.id === item.materiaPrimaId);
                return (
                  <TableRow key={index}>
                    <TableCell>{producto?.nombre || '-'}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>
                      <Button color="error" onClick={() => handleEliminarProducto(index)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>


          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleRegistrarOrden}>
              {ordenEditando ? 'Actualizar Orden' : 'Registrar Orden'}
            </Button>
          </div>
        </Box>
      </Modal>

      {/* MODAL DE PREVISUALIZACION DE PDF */}
      <Modal open={openPdfModal} onClose={() => setOpenPdfModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box style={{
          background: '#fff',
          padding: '10px',
          borderRadius: '10px',
          width: '80%',
          height: '90%',
          overflow: 'auto'
        }}>
          <h3 style={{ marginBottom: '10px' }}>Vista previa de Orden de Compra</h3>
          {pdfPreview && (
            <iframe
              src={pdfPreview}
              title="Vista previa de PDF"
              width="100%"
              height="600px"
              style={{ border: '1px solid #ccc', borderRadius: '8px' }}
            />
          )}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button variant="outlined" color="secondary" onClick={() => setOpenPdfModal(false)}>
              Cerrar
            </Button>
            <Button variant="contained" color="primary" onClick={() => {
              const link = document.createElement('a');
              link.href = pdfPreview;
              link.download = 'OrdenCompra.pdf';
              link.click();
            }}>
              Descargar PDF
            </Button>
          </div>
        </Box>
      </Modal>

    </div>
  );
};

export default OrdenCompra;