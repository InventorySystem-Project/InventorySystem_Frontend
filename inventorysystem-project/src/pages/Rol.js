import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, MenuItem } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from 'lucide-react';
import { getRoles, addRol, updateRol, deleteRol } from '../services/RolService';
import { getUsuarios } from '../services/UsuarioService';  // Asumí que tienes un servicio para obtener usuarios
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';

const Rol = () => {
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);  // Nuevo estado para los usuarios
    const [nuevoRol, setNuevoRol] = useState({
        id: '',
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
        if (!nuevoRol.rol) {
            showAlert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            if (rolEditando) {
                // Si estamos editando un rol, lo actualizamos
                const rolActualizado = await updateRol(rolEditando.id, nuevoRol);
                setRoles((prev) =>
                    prev.map((r) =>
                        r.id === rolEditando.id ? (rolActualizado || { ...nuevoRol, id: rolEditando.id }) : r
                    )
                );
                showSuccess('Rol actualizado correctamente');
            } else {
                // Si es un nuevo rol, lo agregamos
                const rolCreado = await addRol(nuevoRol);
                setRoles((prev) => [rolCreado, ...prev]);
                showSuccess('Rol creado correctamente');
            }

            setNuevoRol({
                rol: ''
            });

            setRolEditando(null);
            setMostrarFormulario(false);  // Cerrar el formulario
        } catch (error) {
            console.error('Error al agregar o actualizar rol', error);
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
                    setRoles((prev) => prev.filter((r) => r.id !== id));
                    showSuccess('Rol eliminado correctamente');
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

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>ID</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Rol</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rolesPaginados.map((rol) => (
                                <TableRow key={rol.id}>
                                    <TableCell>{rol.id}</TableCell>
                                    <TableCell>{rol.rol}</TableCell>
                                    {/* Muestra el nombre del usuario asociado al rol 
                                    <TableCell>{rol.user ? `${rol.user.nombre} ${rol.user.apellido}` : 'No asignado'}</TableCell>*/}
                                    <TableCell>
                                        <Button color="primary" onClick={() => handleEditarRol(rol)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarRol(rol.id)}><Trash2 size={18} /></Button>
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
