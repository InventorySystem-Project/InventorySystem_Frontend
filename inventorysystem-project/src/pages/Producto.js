import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Typography } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from 'lucide-react';
import { getProductosTerminados, addProductoTerminado, updateProductoTerminado, deleteProductoTerminado } from '../services/ProductoTerminadoService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';

const Producto = () => {
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    const [productos, setProductos] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        tipo: '',
        modelo: '',
        color: '',
        precioUnitario: ''
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [productoEditando, setProductoEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productosPorPagina, setProductosPorPagina] = useState(5);
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, hideModal } = useModal();

    // Obtener productos
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const productos = await getProductosTerminados();
                setProductos(productos);
            } catch (error) {
                console.error('Error al obtener productos', error);
            }
        };

        fetchProductos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAgregarProducto = async () => {
        // Guest users cannot perform this action
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }

        if (
            !nuevoProducto.nombre ||
            !nuevoProducto.tipo ||
            !nuevoProducto.precioUnitario
        ) {
            showAlert('Por favor complete los campos obligatorios', 'Validación', 'warning');
            return;
        }

        try {

            let producto;

            if (productoEditando) {
                // Si estamos editando un producto, lo actualizamos
                await updateProductoTerminado(productoEditando.id, nuevoProducto);
                setProductos((prev) =>
                    prev.map((p) =>
                        p.id === productoEditando.id ? { ...nuevoProducto, id: productoEditando.id } : p
                    )
                );
            } else {
                // Si es un nuevo producto, lo agregamos
                producto = { ...nuevoProducto, id: Date.now() };  // Usamos una id temporal
                setProductos((prev) => [producto, ...prev]);  // Actualizamos inmediatamente el estado
                await addProductoTerminado(nuevoProducto);  // Ahora sincronizamos con el backend
            }


            setNuevoProducto({
                nombre: '',
                tipo: '',
                modelo: '',
                color: '',
                precioUnitario: ''
            });

            setProductoEditando(null);
            setMostrarFormulario(false); // Cerrar el formulario
        } catch (error) {
            console.error('Error al agregar o actualizar producto', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setProductoEditando(null);
        setNuevoProducto({
            nombre: '',
            tipo: '',
            modelo: '',
            color: '',
            precioUnitario: ''
        });
    };

    const handleEditarProducto = (producto) => {
        setProductoEditando(producto);
        setNuevoProducto(producto);
        setMostrarFormulario(true);
    };

    const handleEliminarProducto = async (id) => {
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }
        
        showConfirm('¿Está seguro que desea eliminar este producto?', async () => {
            try {
                await deleteProductoTerminado(id);
                setProductos((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
                console.error('Error al eliminar producto', error);
            }
        });
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const indexOfLastProducto = paginaActual * productosPorPagina;
    const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
    const productosPaginados = productos.slice(indexOfFirstProducto, indexOfLastProducto);

    const totalPages = Math.ceil(productos.length / productosPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2>Gestión de Productos Terminados</h2>
                <Button variant="contained" color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : setMostrarFormulario(true)}>
                    <Plus /> Nuevo Producto
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Productos</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre los productos terminados</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Tipo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Modelo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Color</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Precio</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productosPaginados.map((producto) => (
                                <TableRow key={producto.id}>
                                    <TableCell>{producto.nombre}</TableCell>
                                    <TableCell>{producto.tipo}</TableCell>
                                    <TableCell>{producto.modelo}</TableCell>
                                    <TableCell>{producto.color}</TableCell>
                                    <TableCell>{"S/. "+producto.precioUnitario}</TableCell>
                                    <TableCell>
                                        <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarProducto(producto)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarProducto(producto.id)}><Trash2 size={18} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                </div>
            </div>

<Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevoProducto.nombre} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField label="Tipo" name="tipo" value={nuevoProducto.tipo} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField label="Modelo" name="modelo" value={nuevoProducto.modelo} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField label="Color" name="color" value={nuevoProducto.color} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField label="Precio Unitario" name="precioUnitario" value={nuevoProducto.precioUnitario} onChange={handleInputChange} fullWidth margin="normal" />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarProducto}>Guardar</Button>
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
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default Producto;
