import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
    Pagination, List, ListItem, ListItemText, Paper, ListSubheader, Tabs, Tab,
    Typography, // <-- Añadido
    IconButton // <-- Añadido
} from '@mui/material';
import {
    FileText, Trash2, Plus, Clock, CheckCircle2, Loader2, XCircle, Edit, MessageSquareMore, AlertTriangle
} from "lucide-react";
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';

// --- Importaciones de servicios (sin cambios) ---
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getOrdenesCompra, addOrdenCompra, deleteOrdenCompra, updateOrdenCompra, enviarPdfWhatsAppPorBackend } from '../services/OrdenCompraService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getProductosTerminados } from '../services/ProductoTerminadoService';
import { getEmpresas } from '../services/EmpresaService';
import { getProveedores } from '../services/ProveedorService';
// import { registrarEnGoogleSheet } from '../services/GoogleSheetService'; // Comentado si no se usa

// --- Componente AlertasStockBajo (sin cambios) ---
const AlertasStockBajo = ({ titulo, alertas, onAnadirProducto }) => {
    // ... (código sin cambios) ...
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
// --- Fin AlertasStockBajo ---


const OrdenCompra = () => {
    // --- Estados (igual que antes, incluyendo los de PDF) ---
    const [tipoOrden, setTipoOrden] = useState('materiasPrimas');
    const [ordenes, setOrdenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [productosTerminados, setProductosTerminados] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [formulario, setFormulario] = useState({ empresaId: '', proveedorId: '', fechaEmision: new Date().toISOString().split('T')[0], estado: 'Aprobada' });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productoActual, setProductoActual] = useState({ productoId: '', cantidad: '' });
    const [ordenEditando, setOrdenEditando] = useState(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [mostrarModalPdf, setMostrarModalPdf] = useState(false);
    const [movimientosMP, setMovimientosMP] = useState([]);
    const [alertasStockMP, setAlertasStockMP] = useState([]);
    const [movimientosPT, setMovimientosPT] = useState([]);
    const [alertasStockPT, setAlertasStockPT] = useState([]);

    const ordenesPorPagina = 5;
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    
    // Hook para modals
    const { modalConfig, showAlert, showSuccess, showError, showConfirm, hideModal } = useModal();

    // --- useEffects (sin cambios) ---
    useEffect(() => {
        const fetchData = async () => {
             try {
                const [
                    ordenesData, empresasData, proveedoresData, materiasPrimasData,
                    productosTerminadosData, movimientosMPData, movimientosPTData
                ] = await Promise.all([
                    getOrdenesCompra(), getEmpresas(), getProveedores(), getMateriasPrimas(),
                    getProductosTerminados(), getMovimientosInventarioMP(), getMovimientosInventarioPT()
                ]);
                setOrdenes((ordenesData || []).sort((a,b) => b.id - a.id));
                setEmpresas(empresasData || []);
                setProveedores(proveedoresData || []);
                setMateriasPrimas(materiasPrimasData || []);
                setProductosTerminados(productosTerminadosData || []);
                setMovimientosMP(movimientosMPData || []);
                setMovimientosPT(movimientosPTData || []);
            } catch (error) {
                 console.error("Error cargando datos iniciales:", error);
            }
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
    // --- Fin useEffects ---


    // --- Funciones Handler (sin cambios en la lógica interna) ---
    const handleAnadirDesdeAlerta = (productoId) => {
        const yaExiste = productosSeleccionados.some(p => p.productoId === productoId);
        if (yaExiste) {
                        showAlert("Este producto ya está en la orden de compra.", 'Producto Duplicado', 'warning');
            return;
        }
        // Buscar el producto para determinar el tipo si es necesario
        const mp = materiasPrimas.find(m => m.id === productoId);
        const pt = productosTerminados.find(p => p.id === productoId);
        const tipoProducto = mp ? 'materiasPrimas' : (pt ? 'productosTerminados' : null);

        // Si la orden actual es de otro tipo, preguntar o cambiar
        if(tipoProducto && tipoOrden !== tipoProducto) {
             showAlert(`Este producto es de tipo '${tipoProducto === 'materiasPrimas' ? 'Materias Primas' : 'Productos Terminados'}'. Cambie el tipo de orden o añada productos del tipo correcto.`, 'Tipo Incorrecto', 'warning');
             return; // O cambia setTipoOrden(tipoProducto) si quieres forzar el cambio
        }

        setProductosSeleccionados(prev => [...prev, { productoId, cantidad: 1 }]);
    };

    const handleEliminarProducto = (index) => {
        const nuevos = [...productosSeleccionados];
        nuevos.splice(index, 1);
        setProductosSeleccionados(nuevos);
    };

    const fetchOrdenesYRecalcular = async () => {
         try {
             const ordenesData = await getOrdenesCompra();
             setOrdenes((ordenesData || []).sort((a,b) => b.id - a.id));
         } catch (error) {
            console.error("Error recargando órdenes:", error);
         }
    };

    const handleRegistrarOrden = async () => {
        try {
            if (isGuest) { setShowGuestAlert(true); return; }
            if (!formulario.empresaId || !formulario.proveedorId || !formulario.fechaEmision || !formulario.estado || productosSeleccionados.length === 0) {
                showAlert("Por favor, complete todos los campos de la orden y añada al menos un producto.", 'Campos Requeridos', 'warning');
                return;
            }
            const nuevaOrdenParaBD = {
                empresaId: parseInt(formulario.empresaId, 10),
                proveedorId: parseInt(formulario.proveedorId, 10),
                fechaEmision: formulario.fechaEmision,
                estado: formulario.estado,
                codigoOrden: codigoGenerado,
                // tipo: tipoOrden, // No enviar 'tipo' explícitamente si el backend no lo usa
                detalles: productosSeleccionados.map(p => ({
                    materiaPrimaId: tipoOrden === 'materiasPrimas' ? parseInt(p.productoId, 10) : null,
                     productoTerminadoId: tipoOrden === 'productosTerminados' ? parseInt(p.productoId, 10) : null,
                    cantidad: parseInt(p.cantidad, 10) || 0
                }))
            };

            if (ordenEditando) {
                await updateOrdenCompra({ ...nuevaOrdenParaBD, id: ordenEditando.id });
                showSuccess("Orden actualizada con éxito.");
            } else {
                await addOrdenCompra(nuevaOrdenParaBD);
                showSuccess("Orden registrada con éxito.");
            }            setMostrarModal(false);
            fetchOrdenesYRecalcular();
        } catch (error) {
            console.error("❌ Error en handleRegistrarOrden:", error.response?.data || error.message || error);
            showError("Hubo un error al registrar/actualizar la orden: " + (error.response?.data?.message || error.message));
        }
    };

    const handleEditarOrden = (orden) => {
        setOrdenEditando(orden);
        const tipoDetectado = orden.tipo || (orden.detalles && orden.detalles.length > 0 && orden.detalles[0]?.materiaPrimaId ? 'materiasPrimas' : 'productosTerminados');
        setTipoOrden(tipoDetectado);
        setFormulario({
            empresaId: orden.empresaId || '',
            proveedorId: orden.proveedorId || '',
            fechaEmision: orden.fechaEmision ? new Date(orden.fechaEmision).toISOString().split('T')[0] : '',
            estado: orden.estado || ''
        });
        setCodigoGenerado(orden.codigoOrden || '');
        setProductosSeleccionados(orden.detalles?.map(d => ({
            productoId: tipoDetectado === 'materiasPrimas' ? d.materiaPrimaId : d.productoTerminadoId,
            cantidad: d.cantidad
        })) || []);
        setProductoActual({ productoId: '', cantidad: '' });
        setMostrarModal(true);
    };

    const handleOpenModal = () => {
        // Calcular el siguiente ID basado en las órdenes existentes
        const nextId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];
        setCodigoGenerado(`OC-${nextId.toString().padStart(4, '0')}`); // Usar nextId calculado
        setFormulario({ empresaId: '', proveedorId: '', fechaEmision: today, estado: 'Aprobada' });
        setOrdenEditando(null);
        setProductosSeleccionados([]);
        setProductoActual({ productoId: '', cantidad: '' });
        setTipoOrden('materiasPrimas'); // Resetear a MP al abrir nueva orden
        setMostrarModal(true);
    };

    const handleEliminarOrden = async (id) => {
        if (isGuest) { setShowGuestAlert(true); return; }
        
        showConfirm('¿Está seguro que desea eliminar esta orden de compra?', async () => {
            try {
                await deleteOrdenCompra(id);
                showSuccess('Orden eliminada con éxito.');
                fetchOrdenesYRecalcular();
            } catch (error) {
                console.error('Error eliminando orden:', error);
                showError('No se pudo eliminar la orden.');
            }
        });
    };
    // --- Fin Handlers ---

    // --- Función para generar PDF (devuelve Data URL - sin cambios) ---
    const generarPdfDataUrl = (orden) => {
        // ... (código sin cambios) ...
        const doc = new jsPDF();
        const empresa = empresas.find(e => e.id === orden.empresaId);
        const proveedor = proveedores.find(p => p.id === orden.proveedorId);
        // Determina la lista correcta de productos A PARTIR DEL TIPO DE ORDEN O DETALLES
        const tipoRealOrden = orden.tipo || (orden.detalles && orden.detalles.length > 0 && orden.detalles[0]?.materiaPrimaId ? 'materiasPrimas' : 'productosTerminados');
        const listaProductos = tipoRealOrden === 'materiasPrimas' ? materiasPrimas : productosTerminados;

        // Título y Código
        doc.setFontSize(18);
        doc.text(`Orden de Compra: ${orden.codigoOrden || 'N/A'}`, 14, 22);

        // Información de Empresa y Proveedor
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Empresa: ${empresa?.nombre || 'Desconocida'}`, 14, 32);
        doc.text(`Proveedor: ${proveedor?.nombreEmpresaProveedor || 'Desconocido'}`, 14, 38);
        doc.text(`Fecha Emisión: ${orden.fechaEmision ? new Date(orden.fechaEmision).toLocaleDateString('es-ES') : 'N/A'}`, 14, 44);
        doc.text(`Estado: ${orden.estado || 'N/A'}`, 14, 50);

        // Tabla de Detalles
        const tableColumn = ["Producto", "Cantidad", "Unidad"];
        const tableRows = [];

        orden.detalles?.forEach(detalle => {
            const productoId = tipoRealOrden === 'materiasPrimas' ? detalle.materiaPrimaId : detalle.productoTerminadoId;
            const producto = listaProductos.find(p => p.id === productoId);
            const row = [
                producto?.nombre || `ID: ${productoId}`,
                detalle.cantidad || 0,
                producto?.unidad || (tipoRealOrden === 'materiasPrimas' ? 'N/A' : 'unid')
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [76, 49, 148] }, // Ajusta el color si es necesario
        });

        return doc.output('datauristring');
    };
    // --- Fin generarPdfDataUrl ---

    // --- Handler para abrir el modal de vista previa (sin cambios) ---
    const handleAbrirPdfPreview = (orden) => {
        if (isGuest) { setShowGuestAlert(true); return; }
        try {
            const dataUrl = generarPdfDataUrl(orden);
            setPdfPreviewUrl(dataUrl);
            setMostrarModalPdf(true); // Cambiado a setMostrarModalPdf
        } catch (error) {
            console.error("Error generando PDF para vista previa:", error);
            showError("No se pudo generar la vista previa del PDF.");
        }
    };
    // --- Fin handler abrir PDF ---

    // --- Funciones de formato y renderizado (sin cambios) ---
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
    // --- Fin funciones formato ---

    // Paginación (sin cambios)
    const indiceFinal = paginaActual * ordenesPorPagina;
    const indiceInicial = indiceFinal - ordenesPorPagina;
    const ordenesPaginadas = ordenes.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(ordenes.length / ordenesPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                <h2>Gestión de Órdenes de Compra</h2>
                <Button variant="contained" color="primary" onClick={isGuest ? () => setShowGuestAlert(true) : handleOpenModal} startIcon={<Plus />}>
                    Nueva Orden
                </Button>
            </div>

            <div className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Código</strong></TableCell>
                            {/*<TableCell><strong>Tipo</strong></TableCell>*/}
                            <TableCell><strong>Proveedor</strong></TableCell>
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell><strong>Estado</strong></TableCell>
                            <TableCell align="right"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordenesPaginadas.length > 0 ? ordenesPaginadas.map((orden) => (
                            <TableRow key={orden.id} hover>
                                <TableCell><strong>{orden.codigoOrden}</strong></TableCell>
                                {/* <TableCell sx={{ textTransform: 'capitalize' }}>{orden.tipo?.replace('Primas', ' primas').replace('Terminados', ' terminados') || 'N/A'}</TableCell> */}
                                <TableCell>{proveedores.find(p => p.id === orden.proveedorId)?.nombreEmpresaProveedor || "-"}</TableCell>
                                <TableCell>{orden.fechaEmision ? new Date(orden.fechaEmision).toLocaleDateString('es-ES') : '-'}</TableCell>
                                <TableCell>{renderEstado(orden.estado)}</TableCell>
                                <TableCell align="right">
                                    <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleAbrirPdfPreview(orden)} style={{ minWidth: 'auto', padding: '6px' }}>
                                        <FileText size={18} />
                                    </Button>
                                    <Button color="info" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarOrden(orden)} style={{ minWidth: 'auto', padding: '6px' }}>
                                        <Edit size={18} />
                                    </Button>
                                    <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarOrden(orden.id)} style={{ minWidth: 'auto', padding: '6px' }}>
                                        <Trash2 size={18} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={5} align="center">No hay órdenes de compra registradas.</TableCell> {/* Ajustado colSpan */}
                             </TableRow>
                        )}
                    </TableBody>
                </Table>
                 {totalPaginas > 1 && (
                     <Pagination
                        count={totalPaginas}
                        page={paginaActual}
                        onChange={(e, value) => setPaginaActual(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                        sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                    />
                 )}
            </div>

            {/* --- MODAL PARA CREAR/EDITAR ORDEN --- */}
            {/* ---- MANTENEMOS TU ESTRUCTURA Y CLASES CSS ORIGINALES ---- */}
            <Modal open={mostrarModal} onClose={() => setMostrarModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                     <h3>{ordenEditando ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}</h3>

                     <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                         <Tabs value={tipoOrden} onChange={(e, newValue) => setTipoOrden(newValue)} centered>
                             <Tab label="Materias Primas" value="materiasPrimas" />
                             <Tab label="Productos Terminados" value="productosTerminados" />
                         </Tabs>
                     </Box>

                     {/* Alertas */}
                      {tipoOrden === 'materiasPrimas' && !ordenEditando && (
                         <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (MATERIAS PRIMAS)" alertas={alertasStockMP} onAnadirProducto={handleAnadirDesdeAlerta} />
                     )}
                     {tipoOrden === 'productosTerminados' && !ordenEditando && (
                         <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (PRODUCTOS TERMINADOS)" alertas={alertasStockPT} onAnadirProducto={handleAnadirDesdeAlerta} />
                     )}

                     {/* --- FORMULARIO CON TUS CLASES ORIGINALES --- */}
                     <div className="formulario-fila">
                         <TextField fullWidth select label="Empresa" value={formulario.empresaId} onChange={e => setFormulario({ ...formulario, empresaId: e.target.value })} margin="normal" required>
                             {empresas.map(e => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                         </TextField>
                         <TextField fullWidth label="Código de Orden" value={codigoGenerado} disabled margin="normal" />
                     </div>
                     
                     <TextField fullWidth select label="Proveedor" value={formulario.proveedorId} onChange={e => setFormulario({ ...formulario, proveedorId: e.target.value })} margin="normal" required>
                         {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombreEmpresaProveedor}</MenuItem>)}
                     </TextField>

                     <div className="formulario-fila">
                         <TextField fullWidth type="date" label="Fecha de Emisión" InputLabelProps={{ shrink: true }} value={formulario.fechaEmision} onChange={e => setFormulario({ ...formulario, fechaEmision: e.target.value })} size="medium" required/>
                         <TextField fullWidth select label="Estado" value={formulario.estado} onChange={e => setFormulario({ ...formulario, estado: e.target.value })} size="medium" required>
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
                                     showAlert('Seleccione un producto y una cantidad válida (mayor a 0).', 'Validación', 'warning'); return;
                                 }
                                 if (productosSeleccionados.some(p => p.productoId === productoActual.productoId)) {
                                     showAlert('Este producto ya está en la lista.', 'Producto Duplicado', 'warning'); return;
                                 }
                                 setProductosSeleccionados([...productosSeleccionados, productoActual]);
                                 setProductoActual({ productoId: '', cantidad: '' });
                             }} className="boton-agregar">
                                 + Agregar Producto
                             </Button>
                         </div>
                     </div>

                     {/* Tabla de productos en el modal */}
                     <Table size="small">
                         <TableHead>
                             <TableRow>
                                 <TableCell><strong>Producto</strong></TableCell>
                                 <TableCell align="right"><strong>Cantidad</strong></TableCell> {/* Alineado a la derecha */}
                                 <TableCell align="center"><strong>Eliminar</strong></TableCell> {/* Centrado */}
                             </TableRow>
                         </TableHead>
                         <TableBody>
                             {productosSeleccionados.map((item, index) => {
                                 const lista = tipoOrden === 'materiasPrimas' ? materiasPrimas : productosTerminados;
                                 const producto = lista.find(p => p.id === item.productoId);
                                 return (
                                     <TableRow key={index}>
                                         <TableCell>{producto?.nombre || '-'}</TableCell>
                                         <TableCell align="right">{item.cantidad}</TableCell>
                                         {/* Usar IconButton para el botón de eliminar */}
                                         <TableCell align="center">
                                             <IconButton color="error" size="small" onClick={() => handleEliminarProducto(index)}>
                                                 <Trash2 size={16}/>
                                             </IconButton>
                                         </TableCell>
                                     </TableRow>
                                 );
                             })}
                             {productosSeleccionados.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">Aún no hay productos añadidos.</TableCell>
                                </TableRow>
                             )}
                         </TableBody>
                     </Table>

                    {/* Botones de acción del modal */}
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}> {/* Cambiado a flex-end */}
                         <Button variant="outlined" color="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button> {/* Usar secondary para Cancelar */}
                         <Button variant="contained" color="primary" onClick={handleRegistrarOrden} disabled={productosSeleccionados.length === 0}>
                             {ordenEditando ? 'Actualizar Orden' : 'Registrar Orden'}
                         </Button>
                     </div>
                     {/* --- FIN FORMULARIO CON TUS CLASES --- */}
                 </Box>
            </Modal>
            {/* --- FIN MODAL CREAR/EDITAR --- */}

            {/* --- MODAL ACCIÓN RESTRINGIDA PARA GUESTS --- */}
            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
                    <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
                    <Typography style={{ margin: '15px 0' }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador mediante un ticket de incidente.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
                </Box>
            </Modal>

            {/* --- MODAL PARA VISTA PREVIA PDF (Sin cambios) --- */}
            <Modal
                open={mostrarModalPdf} // Usar el estado correcto
                onClose={() => setMostrarModalPdf(false)} // Usar el setter correcto
                aria-labelledby="pdf-preview-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{
                    bgcolor: 'background.paper',
                    width: '90%',
                    height: '90%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    boxShadow: 24,
                }}>
                    <Typography id="pdf-preview-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                        Vista Previa - Orden de Compra
                    </Typography>
                    {pdfPreviewUrl ? (
                        <iframe
                            src={pdfPreviewUrl}
                            title="Vista Previa PDF"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <Typography sx={{ textAlign: 'center' }}>Generando vista previa...</Typography>
                    )}
                    <Button onClick={() => setMostrarModalPdf(false)} sx={{ mt: 2, alignSelf: 'flex-end' }}>
                        Cerrar
                    </Button>
                </Box>
            </Modal>
            {/* --- FIN MODAL PDF --- */}

            {/* Modal del sistema de alertas profesional */}
            <CustomModal
                config={modalConfig}
                onClose={hideModal}
            />

        </div> // Cierre container-general
    );
};

export default OrdenCompra;