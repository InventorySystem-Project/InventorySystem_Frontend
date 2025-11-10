import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Typography } from '@mui/material';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getProductosTerminados, addProductoTerminado, updateProductoTerminado, deleteProductoTerminado } from '../services/ProductoTerminadoService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import { PageLayout, PageHeader, FormLayout, FormRow, ButtonGroup } from '../components/ResponsiveWrappers';
import * as styles from '../styles/commonStyles';

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
    const [productosPorPagina] = useState(5);
    const [intentoGuardar, setIntentoGuardar] = useState(false);
    
    const { modalConfig, showConfirm, showSuccess, hideModal } = useModal();

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const data = await getProductosTerminados();
            setProductos(data);
        } catch (error) {
            console.error('Error al obtener productos', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAgregarProducto = async () => {
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }

        setIntentoGuardar(true);
        
        if (!nuevoProducto.nombre || nuevoProducto.nombre.trim() === '') return;
        if (!nuevoProducto.tipo || nuevoProducto.tipo.trim() === '') return;
        if (!nuevoProducto.modelo || nuevoProducto.modelo.trim() === '') return;
        if (!nuevoProducto.color || nuevoProducto.color.trim() === '') return;
        if (!nuevoProducto.precioUnitario || nuevoProducto.precioUnitario <= 0) return;

        try {
            if (productoEditando) {
                await updateProductoTerminado(productoEditando.id, nuevoProducto);
                showSuccess('Producto actualizado correctamente');
            } else {
                await addProductoTerminado(nuevoProducto);
                showSuccess('Producto creado correctamente');
            }

            await fetchProductos();
            handleCancelar();
        } catch (error) {
            console.error('Error al guardar producto', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setProductoEditando(null);
        setIntentoGuardar(false);
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
        setIntentoGuardar(false);
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
                showSuccess('Producto eliminado correctamente');
                await fetchProductos();
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
        <PageLayout>
            {/* Encabezado */}
            <PageHeader 
                title="Productos Terminados"
                subtitle="Administre los productos terminados"
                onAdd={() => {
                    if (isGuest) {
                        setShowGuestAlert(true);
                    } else {
                        setIntentoGuardar(false);
                        setMostrarFormulario(true);
                    }
                }}
                addButtonText="Nuevo Producto"
            />

            {/* Tabla */}
            <Box sx={styles.tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell sx={styles.hideOnMobile}>Tipo</TableCell>
                            <TableCell sx={styles.hideOnMobile}>Modelo</TableCell>
                            <TableCell>Color</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productosPaginados.map((producto) => (
                            <TableRow key={producto.id}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell sx={styles.hideOnMobile}>{producto.tipo}</TableCell>
                                <TableCell sx={styles.hideOnMobile}>{producto.modelo}</TableCell>
                                <TableCell>{producto.color}</TableCell>
                                <TableCell>S/. {producto.precioUnitario}</TableCell>
                                <TableCell>
                                    <Box sx={styles.tableCellActions}>
                                        <Button 
                                            color="primary" 
                                            onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarProducto(producto)} 
                                            sx={styles.actionButton}
                                        >
                                            <Edit size={18} />
                                        </Button>
                                        <Button 
                                            color="error" 
                                            onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarProducto(producto.id)} 
                                            sx={styles.actionButton}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box sx={styles.paginationContainer}>
                    <Pagination 
                        count={totalPages} 
                        page={paginaActual} 
                        onChange={handleChangePage} 
                        color="primary" 
                        showFirstButton 
                        showLastButton
                        size="small"
                    />
                </Box>
            </Box>

            {/* Modal Formulario */}
            <Modal open={mostrarFormulario} onClose={handleCancelar}>
                <Box sx={styles.modalBox}>
                    <Typography variant="h5" sx={styles.centeredTitle}>
                        {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
                    </Typography>
                    
                    <FormLayout>
                        <FormRow>
                            <TextField 
                                label="Nombre" 
                                name="nombre" 
                                value={nuevoProducto.nombre} 
                                onChange={handleInputChange} 
                                fullWidth 
                                required
                                error={intentoGuardar && (!nuevoProducto.nombre || nuevoProducto.nombre.trim() === '')}
                                helperText={intentoGuardar && (!nuevoProducto.nombre || nuevoProducto.nombre.trim() === '') ? 'Este campo es obligatorio' : ''}
                            />
                        </FormRow>

                        <FormRow>
                            <TextField 
                                label="Tipo" 
                                name="tipo" 
                                value={nuevoProducto.tipo} 
                                onChange={handleInputChange} 
                                fullWidth 
                                required
                                error={intentoGuardar && (!nuevoProducto.tipo || nuevoProducto.tipo.trim() === '')}
                                helperText={intentoGuardar && (!nuevoProducto.tipo || nuevoProducto.tipo.trim() === '') ? 'Este campo es obligatorio' : ''}
                            />
                            <TextField 
                                label="Modelo" 
                                name="modelo" 
                                value={nuevoProducto.modelo} 
                                onChange={handleInputChange} 
                                fullWidth 
                                required
                                error={intentoGuardar && (!nuevoProducto.modelo || nuevoProducto.modelo.trim() === '')}
                                helperText={intentoGuardar && (!nuevoProducto.modelo || nuevoProducto.modelo.trim() === '') ? 'Este campo es obligatorio' : ''}
                            />
                        </FormRow>

                        <FormRow>
                            <TextField 
                                label="Color" 
                                name="color" 
                                value={nuevoProducto.color} 
                                onChange={handleInputChange} 
                                fullWidth 
                                required
                                error={intentoGuardar && (!nuevoProducto.color || nuevoProducto.color.trim() === '')}
                                helperText={intentoGuardar && (!nuevoProducto.color || nuevoProducto.color.trim() === '') ? 'Este campo es obligatorio' : ''}
                            />
                            <TextField 
                                type="number" 
                                label="Precio Unitario" 
                                name="precioUnitario" 
                                value={nuevoProducto.precioUnitario} 
                                onChange={handleInputChange} 
                                fullWidth 
                                required
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                                error={intentoGuardar && (!nuevoProducto.precioUnitario || nuevoProducto.precioUnitario <= 0)}
                                helperText={
                                    intentoGuardar && (!nuevoProducto.precioUnitario || nuevoProducto.precioUnitario <= 0)
                                    ? 'Este campo es obligatorio y debe ser mayor a 0'
                                    : 'No puede ser negativo'
                                }
                            />
                        </FormRow>

                        <ButtonGroup>
                            <Button variant="outlined" color="primary" onClick={handleCancelar}>
                                Cancelar
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleAgregarProducto}>
                                Guardar
                            </Button>
                        </ButtonGroup>
                    </FormLayout>
                </Box>
            </Modal>

            {/* Modal Alerta Guest */}
            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)}>
                <Box sx={{...styles.alertModal, borderTopColor: 'error.main'}}>
                    <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, marginBottom: 2 }}>
                        Acción Restringida
                    </Typography>
                    <Typography sx={{ marginBottom: 3 }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhatsApp 985804246.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)} fullWidth>
                        Entendido
                    </Button>
                </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </PageLayout>
    );
};

export default Producto;
