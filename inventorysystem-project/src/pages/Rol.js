import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, MenuItem, TableContainer, Typography } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from 'lucide-react';
import { getRoles, addRol, updateRol, deleteRol } from '../services/RolService';
import { getUsuarios } from '../services/UsuarioService';  // Asumí que tienes un servicio para obtener usuarios
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import * as tableStyles from '../styles/tableStyles';

const Rol = () => {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);  // Nuevo estado para los usuarios
    const [nuevoRol, setNuevoRol] = useState({
        rol: ''
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [rolEditando, setRolEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [rolesPorPagina, setRolesPorPagina] = useState(5);
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, showSuccess, hideModal } = useModal();

    // Obtener roles y usuarios cuando se monta el componente
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const roles = await getRoles();
                setRoles(roles);
            } catch (error) {
                console.error('Error al obtener roles', error);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const usuarios = await getUsuarios(); // Asegúrate de tener este servicio
                setUsers(usuarios);
            } catch (error) {
                console.error('Error al obtener usuarios', error);
            }
        };

        fetchRoles();
        fetchUsuarios();  // Llamamos a la función para obtener los usuarios
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoRol((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAgregarRol = async () => {
        if (!nuevoRol.rol || !nuevoRol.rol.trim()) {
            showAlert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            if (rolEditando && rolEditando.id) {
                // Si estamos editando un rol, lo actualizamos
                console.log('🔄 ACTUALIZANDO rol con ID:', rolEditando.id);
                
                // CRÍTICO: Enviar TODO el objeto nuevoRol con el ID incluido
                const rolCompleto = {
                    ...nuevoRol,
                    id: rolEditando.id  // Asegurar que el ID está presente
                };
                
                console.log('📝 Enviando al backend:', rolCompleto);
                await updateRol(rolEditando.id, rolCompleto);
                showSuccess('Rol actualizado correctamente');
            } else {
                // Si es un nuevo rol, lo agregamos
                console.log('✨ CREANDO nuevo rol:', { rol: nuevoRol.rol });
                await addRol({ rol: nuevoRol.rol });
                showSuccess('Rol creado correctamente');
            }

            // Recargar la lista completa desde el servidor
            const rolesActualizados = await getRoles();
            setRoles(rolesActualizados);

            // Limpiar formulario
            setNuevoRol({
                rol: ''
            });

            setRolEditando(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('❌ Error al agregar o actualizar rol:', error);
            showError('Error al guardar el rol. Por favor, intente nuevamente.');
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setRolEditando(null);
        setNuevoRol({
            rol: ''
        });
    };

    const handleEditarRol = (rol) => {
        setRolEditando(rol);
        setNuevoRol(rol);
        setMostrarFormulario(true);
    };

    const handleEliminarRol = async (id) => {
        showConfirm(
            '¿Está seguro que desea eliminar este rol?',
            async () => {
                try {
                    await deleteRol(id);
                    showSuccess('Rol eliminado correctamente');
                    
                    // Recargar la lista completa desde el servidor
                    const rolesActualizados = await getRoles();
                    setRoles(rolesActualizados);
                    
                    // Ajustar página si la actual queda vacía
                    const nuevaPaginaActual = Math.ceil(rolesActualizados.length / rolesPorPagina);
                    if (paginaActual > nuevaPaginaActual && nuevaPaginaActual > 0) {
                        setPaginaActual(nuevaPaginaActual);
                    }
                } catch (error) {
                    console.error('Error al eliminar rol', error);
                    showError('Error al eliminar el rol. Por favor, intente nuevamente.');
                }
            }
        );
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const indexOfLastRol = paginaActual * rolesPorPagina;
    const indexOfFirstRol = indexOfLastRol - rolesPorPagina;
    const rolesPaginados = roles.slice(indexOfFirstRol, indexOfLastRol);

    const totalPages = Math.ceil(roles.length / rolesPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 >Gestión de Roles</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nuevo Rol
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Roles</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre los roles de usuarios</p>
                </div>

                <TableContainer sx={tableStyles.enhancedTableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.enhancedTableHead}>
                            <TableRow>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>ID</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rolesPaginados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} sx={tableStyles.emptyTableMessage}>
                                        <Box className="empty-icon">🔐</Box>
                                        <Typography>No hay roles registrados</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rolesPaginados.map((rol) => (
                                    <TableRow key={rol.id} sx={tableStyles.enhancedTableRow}>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{rol.id}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{rol.rol}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                            <Box sx={tableStyles.enhancedTableCellActions}>
                                                <Button color="primary" onClick={() => handleEditarRol(rol)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                                                </Button>
                                                <Button color="error" onClick={() => handleEliminarRol(rol.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <Box sx={tableStyles.enhancedPagination}>
                        <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                    </Box>
                </TableContainer>
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{rolEditando ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                    <TextField label="Rol" name="rol" value={nuevoRol.rol} onChange={handleInputChange} fullWidth margin="normal" />

                    {/* Desplegable para seleccionar usuario 
                    <TextField
                        select
                        label="Seleccionar Usuario"
                        name="userId"
                        value={nuevoRol.userId}
                        onChange={handleInputChange}
                        fullWidth
                    >
                        {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.nombre} {user.apellido} {/* Muestra el nombre y apellido del usuario 
                            </MenuItem>
                        ))}
                    </TextField>*/}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarRol}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default Rol;
