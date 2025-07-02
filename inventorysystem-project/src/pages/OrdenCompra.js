import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Se añaden Tabs y Tab para la nueva funcionalidad
import {
    Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
    Pagination, List, ListItem, ListItemText, Paper, ListSubheader, Tabs, Tab
} from '@mui/material';
import {
    FileText, Trash2, Plus, Clock, CheckCircle2, Loader2, XCircle, Edit, MessageSquareMore, AlertTriangle
} from "lucide-react";

// Se importan los servicios necesarios para Productos Terminados
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getOrdenesCompra, addOrdenCompra, deleteOrdenCompra, updateOrdenCompra, enviarPdfWhatsAppPorBackend } from '../services/OrdenCompraService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getProductosTerminados } from '../services/ProductoTerminadoService';
import { getEmpresas } from '../services/EmpresaService';
import { getProveedores } from '../services/ProveedorService';
import { registrarEnGoogleSheet } from '../services/GoogleSheetService';

const AlertasStockBajo = ({ titulo, alertas, onAnadirProducto }) => {
    if (!alertas || alertas.length === 0) {
        return null;
    }
    return (
        <Paper elevation={2} sx={{ my: 2, p: 2, backgroundColor: '#FFFBEB' }}>
            <List dense subheader={
                <ListSubheader sx={{ bgcolor: 'transparent', color: '#B7791F', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertTriangle size={20} /> {titulo}
                </ListSubheader>
            }>
                {alertas.map(alerta => (
                    <ListItem key={alerta.id} divider secondaryAction={
                        <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => onAnadirProducto(alerta.id)}>Añadir</Button>
                    }>
                        <ListItemText primary={alerta.nombre} secondary={`Stock actual: ${alerta.stockActual} (Mínimo: 5)`} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};


const OrdenCompra = () => {
    // --- NUEVO ESTADO PARA CONTROLAR LAS PESTAÑAS ---
    const [tipoOrden, setTipoOrden] = useState('materiasPrimas');

    const [ordenes, setOrdenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [productosTerminados, setProductosTerminados] = useState([]); // <-- NUEVO ESTADO
    const [empresas, setEmpresas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [formulario, setFormulario] = useState({ empresaId: '', proveedorId: '', fechaEmision: '', estado: '' });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productoActual, setProductoActual] = useState({ productoId: '', cantidad: '' });
    const [ordenEditando, setOrdenEditando] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [openPdfModal, setOpenPdfModal] = useState(false);
    
    // Estados separados para movimientos y alertas
    const [movimientosMP, setMovimientosMP] = useState([]);
    const [alertasStockMP, setAlertasStockMP] = useState([]);
    const [movimientosPT, setMovimientosPT] = useState([]);
    const [alertasStockPT, setAlertasStockPT] = useState([]);

    const ordenesPorPagina = 5;

    useEffect(() => {
        const fetchData = async () => {
            const [
                ordenesData, empresasData, proveedoresData, materiasPrimasData,
                productosTerminadosData, movimientosMPData, movimientosPTData
            ] = await Promise.all([
                getOrdenesCompra(), getEmpresas(), getProveedores(), getMateriasPrimas(),
                getProductosTerminados(), getMovimientosInventarioMP(), getMovimientosInventarioPT()
            ]);
            setOrdenes(ordenesData);
            setEmpresas(empresasData);
            setProveedores(proveedoresData);
            setMateriasPrimas(materiasPrimasData);
            setProductosTerminados(productosTerminadosData);
            setMovimientosMP(movimientosMPData);
            setMovimientosPT(movimientosPTData);
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        if (materiasPrimas.length > 0 && Array.isArray(movimientosMP)) {
            const stockCalculado = {};
            movimientosMP.forEach(mov => {
                stockCalculado[mov.materiaPrimaId] = (stockCalculado[mov.materiaPrimaId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
            });
            const nuevasAlertas = materiasPrimas.map(mp => ({ ...mp, stockActual: stockCalculado[mp.id] || 0 })).filter(mp => mp.stockActual <= 5);
            setAlertasStockMP(nuevasAlertas);
        }
    }, [materiasPrimas, movimientosMP]);

    useEffect(() => {
        if (productosTerminados.length > 0 && Array.isArray(movimientosPT)) {
            const stockCalculado = {};
            movimientosPT.forEach(mov => {
                stockCalculado[mov.productoTerminadoId] = (stockCalculado[mov.productoTerminadoId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
            });
            const nuevasAlertas = productosTerminados.map(pt => ({ ...pt, stockActual: stockCalculado[pt.id] || 0 })).filter(pt => pt.stockActual <= 5);
            setAlertasStockPT(nuevasAlertas);
        }
    }, [productosTerminados, movimientosPT]);

    const handleAnadirDesdeAlerta = (productoId) => {
        const yaExiste = productosSeleccionados.some(p => p.productoId === productoId);
        if (yaExiste) {
            alert("Este producto ya está en la orden de compra.");
            return;
        }
        setProductosSeleccionados(prev => [...prev, { productoId, cantidad: 1 }]);
    };

    const handleEliminarProducto = (index) => {
        const nuevos = [...productosSeleccionados];
        nuevos.splice(index, 1);
        setProductosSeleccionados(nuevos);
    };

    const handleRegistrarOrden = async () => {
        try {
            const nuevaOrdenParaBD = {
                empresaId: formulario.empresaId,
                proveedorId: formulario.proveedorId,
                fechaEmision: formulario.fechaEmision,
                estado: formulario.estado,
                codigoOrden: codigoGenerado,
                tipo: tipoOrden, // Guardar el tipo de orden
                detalles: productosSeleccionados.map(p => ({
                    [tipoOrden === 'materiasPrimas' ? 'materiaPrimaId' : 'productoTerminadoId']: p.productoId,
                    cantidad: parseInt(p.cantidad, 10) || 0
                }))
            };

            if (ordenEditando) {
                await updateOrdenCompra({ ...nuevaOrdenParaBD, id: ordenEditando.id });
            } else {
                await addOrdenCompra(nuevaOrdenParaBD);
            }

            setMostrarModal(false);
            fetchOrdenes();
        } catch (error) {
            console.error("❌ Error en handleRegistrarOrden:", error);
            alert("Hubo un error al registrar la orden.");
        }
    };

    const handleEditarOrden = (orden) => {
        setOrdenEditando(orden);
        const tipo = orden.tipo || (orden.detalles && orden.detalles[0]?.materiaPrimaId ? 'materiasPrimas' : 'productosTerminados');
        setTipoOrden(tipo);

        setFormulario({
            empresaId: orden.empresaId,
            proveedorId: orden.proveedorId,
            fechaEmision: orden.fechaEmision,
            estado: orden.estado
        });
        setCodigoGenerado(orden.codigoOrden);
        setProductosSeleccionados(orden.detalles?.map(d => ({
            productoId: d.materiaPrimaId || d.productoTerminadoId,
            cantidad: d.cantidad
        })) || []);
        setMostrarModal(true);
    };

    const handleOpenModal = () => {
        const siguienteId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];
        setCodigoGenerado(`OC-${siguienteId.toString().padStart(4, '0')}`);
        setFormulario({ empresaId: '', proveedorId: '', fechaEmision: today, estado: 'Aprobada' });
        setOrdenEditando(null);
        setProductosSeleccionados([]);
        setProductoActual({ productoId: '', cantidad: '' });
        setMostrarModal(true);
    };

    const renderEstado = (estado) => {
        const estilos = { padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content', gap: '5px' };
        switch (estado) {
            case 'En proceso': return (<div style={{ ...estilos, backgroundColor: '#FFF8E1', color: '#FFC107' }}><Clock size={16} /> En Proceso</div>);
            case 'Aprobada': return (<div style={{ ...estilos, backgroundColor: '#E3F2FD', color: '#2196F3' }}><Loader2 size={16} /> Aprobada</div>);
            case 'Recibida': return (<div style={{ ...estilos, backgroundColor: '#E8F5E9', color: '#4CAF50' }}><CheckCircle2 size={16} /> Recibida</div>);
            case 'Rechazada': return (<div style={{ ...estilos, backgroundColor: '#FFEBEE', color: '#F44336' }}><XCircle size={16} /> Rechazada</div>);
            default: return estado;
        }
    };

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2>Gestión de Órdenes de Compra</h2>
                <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    <Plus /> Nueva Orden
                </Button>
            </div>

            <div className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Código</strong></TableCell>
                            <TableCell><strong>Tipo de Orden</strong></TableCell>
                            <TableCell><strong>Proveedor</strong></TableCell>
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordenes.map((orden) => (
                            <TableRow key={orden.id}>
                                <TableCell><strong>{orden.codigoOrden}</strong></TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{orden.tipo?.replace('Primas', ' primas').replace('Terminados', ' terminados') || 'N/A'}</TableCell>
                                <TableCell>{proveedores.find(p => p.id === orden.proveedorId)?.nombreEmpresaProveedor || "-"}</TableCell>
                                <TableCell>{orden.fechaEmision}</TableCell>
                                <TableCell>{renderEstado(orden.estado)}</TableCell>
                                <TableCell>
                                    <Button color="success"><MessageSquareMore size={18} /></Button>
                                    <Button color="primary"><FileText size={18} /></Button>
                                    <Button color="info" onClick={() => handleEditarOrden(orden)}><Edit size={18} /></Button>
                                    <Button color="error"><Trash2 size={18} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{ordenEditando ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h3>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tipoOrden} onChange={(e, newValue) => setTipoOrden(newValue)} centered>
                            <Tab label="Materias Primas" value="materiasPrimas" />
                            <Tab label="Productos Terminados" value="productosTerminados" />
                        </Tabs>
                    </Box>

                    {tipoOrden === 'materiasPrimas' && (
                        <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (MATERIAS PRIMAS)" alertas={alertasStockMP} onAnadirProducto={handleAnadirDesdeAlerta} />
                    )}
                    {tipoOrden === 'productosTerminados' && (
                        <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (PRODUCTOS TERMINADOS)" alertas={alertasStockPT} onAnadirProducto={handleAnadirDesdeAlerta} />
                    )}

                    <div className="formulario-fila">
                        <TextField fullWidth select label="Empresa" value={formulario.empresaId} onChange={e => setFormulario({ ...formulario, empresaId: e.target.value })} margin="normal">
                            {empresas.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                        </TextField>
                        <TextField fullWidth label="Código de Orden" value={codigoGenerado} disabled margin="normal" />
                    </div>
                    
                    <TextField fullWidth select label="Proveedor" value={formulario.proveedorId} onChange={e => setFormulario({ ...formulario, proveedorId: e.target.value })} margin="normal">
                        {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombreEmpresaProveedor}</MenuItem>)}
                    </TextField>

                    <div className="formulario-fila">
                        <TextField fullWidth type="date" label="Fecha de Emisión" InputLabelProps={{ shrink: true }} value={formulario.fechaEmision} onChange={e => setFormulario({ ...formulario, fechaEmision: e.target.value })} size="medium" />
                        <TextField fullWidth select label="Estado" value={formulario.estado} onChange={e => setFormulario({ ...formulario, estado: e.target.value })} size="medium">
                            <MenuItem value="En proceso">En proceso</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                            <MenuItem value="Recibida">Recibida</MenuItem>
                            <MenuItem value="Rechazada">Rechazada</MenuItem>
                        </TextField>
                    </div>

                    <h4>Productos de la Orden</h4>
                    <div className="producto-formulario-contenedor">
                        <div className="producto-formulario-labels">
                            <div className="label-item">Producto</div>
                            <div className="label-item">Cantidad</div>
                        </div>
                        <div className="producto-formulario-inputs">
                            <TextField select label="Producto" value={productoActual.productoId} onChange={e => setProductoActual({ ...productoActual, productoId: e.target.value })} size="small" className="input-producto">
                                {tipoOrden === 'materiasPrimas' ?
                                    materiasPrimas.map(mp => <MenuItem key={mp.id} value={mp.id}>{mp.nombre}</MenuItem>) :
                                    productosTerminados.map(pt => <MenuItem key={pt.id} value={pt.id}>{pt.nombre}</MenuItem>)
                                }
                            </TextField>
                            <TextField type="number" value={productoActual.cantidad} onChange={e => setProductoActual({ ...productoActual, cantidad: e.target.value === '' ? '' : Number(e.target.value) })} onFocus={e => e.target.select()} size="small" className="input-cantidad" InputProps={{ inputProps: { min: 1 } }} />
                        </div>
                        <div className="producto-formulario-boton">
                            <Button variant="outlined" onClick={() => {
                                if (!productoActual.productoId || !productoActual.cantidad || productoActual.cantidad < 1) {
                                    alert('Seleccione un producto y una cantidad válida (mayor a 0).');
                                    return;
                                }
                                setProductosSeleccionados([...productosSeleccionados, productoActual]);
                                setProductoActual({ productoId: '', cantidad: '' });
                            }} className="boton-agregar">
                                + Agregar Producto
                            </Button>
                        </div>
                    </div>

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
                                const lista = tipoOrden === 'materiasPrimas' ? materiasPrimas : productosTerminados;
                                const producto = lista.find(p => p.id === item.productoId);
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{producto?.nombre || '-'}</TableCell>
                                        <TableCell>{item.cantidad}</TableCell>
                                        <TableCell><Button color="error" onClick={() => handleEliminarProducto(index)}><Trash2 /></Button></TableCell>
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
        </div>
    );
};

export default OrdenCompra;