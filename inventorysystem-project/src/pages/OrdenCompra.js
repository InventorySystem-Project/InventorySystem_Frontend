import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
    Pagination, List, ListItem, ListItemText, Paper, ListSubheader
} from '@mui/material';
import {
    FileText, Trash2, Plus, Clock, CheckCircle2, Loader2, XCircle, Edit, MessageSquareMore, AlertTriangle
} from "lucide-react";

import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getOrdenesCompra, addOrdenCompra, deleteOrdenCompra, updateOrdenCompra, enviarPdfWhatsAppPorBackend } from '../services/OrdenCompraService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getEmpresas } from '../services/EmpresaService';
import { getProveedores } from '../services/ProveedorService';
import { registrarEnGoogleSheet } from '../services/GoogleSheetService';

const AlertasStockBajo = ({ alertas, onAnadirProducto }) => {
    if (alertas.length === 0) {
        return null; 
    }

    return (
        <Paper elevation={2} sx={{ my: 2, p: 2, backgroundColor: '#FFFBEB' }}>
            <List
                dense
                subheader={
                    <ListSubheader sx={{ bgcolor: 'transparent', color: '#B7791F', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={20} />
                        ALERTAS DE STOCK BAJO (MENOS DE 5 UNIDADES)
                    </ListSubheader>
                }
            >
                {alertas.map(alerta => (
                    <ListItem
                        key={alerta.id}
                        divider
                        secondaryAction={
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Plus size={16} />}
                                onClick={() => onAnadirProducto(alerta.id)}
                            >
                                Añadir
                            </Button>
                        }
                    >
                        <ListItemText
                            primary={alerta.nombre}
                            secondary={`Stock actual: ${alerta.stockActual} (Mínimo: 5)`}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};


const OrdenCompra = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [formulario, setFormulario] = useState({
        empresaId: '', proveedorId: '', fechaEmision: '', estado: ''
    });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productoActual, setProductoActual] = useState({ materiaPrimaId: '', cantidad: '' }); // Cantidad inicial vacía
    const [ordenEditando, setOrdenEditando] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [openPdfModal, setOpenPdfModal] = useState(false);
    
    const [movimientos, setMovimientos] = useState([]);
    const [alertasStock, setAlertasStock] = useState([]);

    const ordenesPorPagina = 5;

    useEffect(() => {
        const fetchData = async () => {
            const [ordenesData, empresasData, proveedoresData, materiasPrimasData, movimientosData] = await Promise.all([
                getOrdenesCompra(),
                getEmpresas(),
                getProveedores(),
                getMateriasPrimas(),
                getMovimientosInventarioMP()
            ]);
            setOrdenes(ordenesData);
            setEmpresas(empresasData);
            setProveedores(proveedoresData);
            setMateriasPrimas(materiasPrimasData);
            setMovimientos(movimientosData);
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        if (materiasPrimas.length > 0 && Array.isArray(movimientos)) {
            const stockCalculado = {};
            movimientos.forEach(mov => {
                const id = mov.materiaPrimaId;
                const cantidad = mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad;
                stockCalculado[id] = (stockCalculado[id] || 0) + cantidad;
            });
            
            const nuevasAlertas = materiasPrimas
                .map(mp => ({
                    ...mp,
                    stockActual: stockCalculado[mp.id] || 0
                }))
                .filter(mp => mp.stockActual <= 5);
            
            setAlertasStock(nuevasAlertas);
        }
    }, [materiasPrimas, movimientos]);


    const handleAnadirDesdeAlerta = (materiaPrimaId) => {
        const yaExiste = productosSeleccionados.some(p => p.materiaPrimaId === materiaPrimaId);
        if (yaExiste) {
            alert("Este producto ya está en la orden de compra.");
            return;
        }
        setProductosSeleccionados(prev => [...prev, { materiaPrimaId, cantidad: 1 }]);
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
                detalles: productosSeleccionados.map(p => ({
                    materiaPrimaId: p.materiaPrimaId,
                    cantidad: parseInt(p.cantidad, 10) || 0 // Asegurarse que un valor vacío se guarde como 0
                }))
            };

            if (ordenEditando) {
                const ordenCompleta = { ...nuevaOrdenParaBD, id: ordenEditando.id };
                await updateOrdenCompra(ordenCompleta);
            } else {
                const ordenGuardada = await addOrdenCompra(nuevaOrdenParaBD);

                if (ordenGuardada) {
                    const proveedorInfo = proveedores.find(p => p.id === nuevaOrdenParaBD.proveedorId);
                    const rowsForSheet = nuevaOrdenParaBD.detalles.map(detalle => {
                        const materiaPrimaInfo = materiasPrimas.find(mp => mp.id === detalle.materiaPrimaId);
                        return [
                            nuevaOrdenParaBD.codigoOrden, "Materia Prima", "Entrada",
                            "Almacen Principal", materiaPrimaInfo?.nombre || '', detalle.cantidad,
                            "Compra", proveedorInfo?.nombreEmpresaProveedor || '',
                            proveedorInfo?.telefono || '', "N", "", "", new Date().toISOString()
                        ];
                    });
                    await registrarEnGoogleSheet(rowsForSheet);
                }
            }

            setMostrarModal(false);
            setFormulario({ empresaId: '', proveedorId: '', fechaEmision: '', estado: 'Aprobada' });
            setProductosSeleccionados([]);
            setOrdenEditando(null);
            const [ordenesData, materiasPrimasData, movimientosData] = await Promise.all([
                getOrdenesCompra(),
                getMateriasPrimas(),
                getMovimientosInventarioMP()
            ]);
            setOrdenes(ordenesData);
            setMateriasPrimas(materiasPrimasData);
            setMovimientos(movimientosData);

        } catch (error) {
            console.error("❌ Error en handleRegistrarOrden:", error);
            alert("Hubo un error al registrar la orden.");
        }
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
    const handleEnviarWhatsAppConPDF = async (orden) => {
        const proveedor = proveedores.find(p => p.id === orden.proveedorId);
        if (!proveedor || !proveedor.telefono) {
            alert("El proveedor no tiene un número de teléfono configurado.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("ORDEN DE COMPRA", 70, 20);
        doc.setFontSize(12);
        doc.text(`Número de O/C: ${orden.codigoOrden}`, 14, 40);
        doc.text(`Proveedor: ${proveedor?.nombreEmpresaProveedor || '-'}`, 14, 48);
        const columns = ["Cantidad", "Producto"];
        const rows = (orden.detalles || []).map(d => [d.cantidad, materiasPrimas.find(mp => mp.id === d.materiaPrimaId)?.nombre || '-']);
        autoTable(doc, { startY: 60, head: [columns], body: rows });

        const pdfBlob = doc.output('blob');
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);

        reader.onloadend = async function () {
            const pdfBase64 = reader.result.split(',')[1];
            const datosParaBackend = {
                to: proveedor.telefono,
                filename: `Orden-${orden.codigoOrden}.pdf`,
                pdfBase64: pdfBase64,
                providerName: proveedor.nombreEmpresaProveedor
            };

            try {
                alert("Enviando orden por WhatsApp, por favor espere...");
                await enviarPdfWhatsAppPorBackend(datosParaBackend);
                alert("¡Orden de compra enviada por WhatsApp exitosamente!");
            } catch (error) {
                alert("No se pudo enviar la orden por WhatsApp. Revise la consola.");
            }
        };
    };
    const handleEliminarOrden = async (id) => {
        if (window.confirm('¿Estás seguro que quieres eliminar esta orden de compra?')) {
            try {
                await deleteOrdenCompra(id);
                const [ordenesData, movimientosData] = await Promise.all([getOrdenesCompra(), getMovimientosInventarioMP()]);
                setOrdenes(ordenesData);
                setMovimientos(movimientosData);
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
        autoTable(doc, { startY: 70, head: [columns], body: rows });
        const pdfDataUri = doc.output('datauristring');
        setPdfPreview(pdfDataUri);
        setOpenPdfModal(true);
    };

    const indexOfLast = paginaActual * ordenesPorPagina;
    const indexOfFirst = indexOfLast - ordenesPorPagina;
    const ordenesPaginadas = ordenes.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(ordenes.length / ordenesPorPagina);

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
                <Button variant="contained" color="primary" onClick={() => {
                    const siguienteId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
                    const today = new Date().toISOString().split('T')[0];
                    setCodigoGenerado(`OC-${siguienteId.toString().padStart(4, '0')}`);
                    setFormulario(prev => ({ ...prev, fechaEmision: today, estado: 'Aprobada' }));
                    setOrdenEditando(null);
                    setProductosSeleccionados([]);
                    setMostrarModal(true);
                }}>
                    <Plus /> Nueva Orden
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Órdenes</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre las órdenes de compra realizadas</p>
                </div>
                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow >
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Código</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Proveedor</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Fecha</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Estado</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ordenesPaginadas.map((orden) => (
                                <TableRow key={orden.id}>
                                    <TableCell style={{ fontWeight: 'bold' }}>{orden.codigoOrden}</TableCell>
                                    <TableCell>{proveedores.find(p => p.id === orden.proveedorId)?.nombreEmpresaProveedor || "-"}</TableCell>
                                    <TableCell>{orden.fechaEmision}</TableCell>
                                    <TableCell>{renderEstado(orden.estado)}</TableCell>
                                    <TableCell>
                                        <Button color="success" onClick={() => handleEnviarWhatsAppConPDF(orden)}><MessageSquareMore size={18} /></Button>
                                        <Button color="primary" onClick={() => generarPDF(orden)}><FileText size={18} /></Button>
                                        <Button color="info" onClick={() => handleEditarOrden(orden)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarOrden(orden.id)}><Trash2 size={18} /></Button>
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
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{ordenEditando ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h3>

                    <AlertasStockBajo alertas={alertasStock} onAnadirProducto={handleAnadirDesdeAlerta} />
                    
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
                            <TextField select value={productoActual.materiaPrimaId} onChange={e => setProductoActual({ ...productoActual, materiaPrimaId: e.target.value })} size="small" className="input-producto">
                                {materiasPrimas.map(mp => (
                                    <MenuItem key={mp.id} value={mp.id}>{mp.nombre}</MenuItem>
                                ))}
                            </TextField>

                            {/* --- INICIO DEL CAMBIO --- */}
                            <TextField
                                type="number"
                                value={productoActual.cantidad}
                                onChange={e => {
                                    // Permite que el campo esté vacío, de lo contrario lo convierte a número
                                    const value = e.target.value;
                                    setProductoActual({ ...productoActual, cantidad: value === '' ? '' : Number(value) });
                                }}
                                onFocus={event => event.target.select()} // Selecciona todo el texto al hacer foco
                                size="small"
                                className="input-cantidad"
                                InputProps={{
                                    inputProps: { 
                                        min: 1 // No permite valores negativos
                                    }
                                }}
                            />
                            {/* --- FIN DEL CAMBIO --- */}

                        </div>
                        <div className="producto-formulario-boton">
                            <Button variant="outlined" onClick={() => {
                                if (!productoActual.materiaPrimaId || !productoActual.cantidad || productoActual.cantidad < 1) {
                                    alert('Seleccione un producto y una cantidad válida (mayor a 0).');
                                    return;
                                }
                                setProductosSeleccionados([...productosSeleccionados, productoActual]);
                                setProductoActual({ materiaPrimaId: '', cantidad: '' });
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
                                const producto = materiasPrimas.find(mp => mp.id === item.materiaPrimaId);
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
{/*aa */}
            <Modal open={openPdfModal} onClose={() => setOpenPdfModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '10px', borderRadius: '10px', width: '80%', height: '90%', overflow: 'auto' }}>
                    <h3>Vista previa de Orden de Compra</h3>
                    {pdfPreview && (
                        <iframe src={pdfPreview} title="Vista previa de PDF" width="100%" height="600px" style={{ border: '1px solid #ccc', borderRadius: '8px' }} />
                    )}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <Button variant="outlined" color="secondary" onClick={() => setOpenPdfModal(false)}>Cerrar</Button>
                        <Button variant="contained" color="primary" onClick={() => {
                            const link = document.createElement('a');
                            link.href = pdfPreview;
                            link.download = 'OrdenCompra.pdf';
                            link.click();
                        }}>Descargar PDF</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default OrdenCompra;