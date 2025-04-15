import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination } from '@mui/material';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getUsuarios, addUsuario, updateUsuario, deleteUsuario } from '../services/UsuarioService';

const Usuario = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        id: '',
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        username: '',
        genero: '',
        dni: '',
        foto: '',
        fechaNacimiento: '',
        telefono: '',
        enabled: true,
        empresaId: '',
        roles: []
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(5);

    // Obtener usuarios
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const usuarios = await getUsuarios();
                setUsuarios(usuarios);
            } catch (error) {
                console.error('Error al obtener usuarios', error);
            }
        };

        fetchUsuarios();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoUsuario((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAgregarUsuario = async () => {
        if (
            !nuevoUsuario.nombre ||
            !nuevoUsuario.apellido ||
            !nuevoUsuario.correo ||
            !nuevoUsuario.password ||
            !nuevoUsuario.username
        ) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            let usuario;

            if (usuarioEditando) {
                // Si estamos editando un usuario, lo actualizamos
                await updateUsuario(usuarioEditando.id, nuevoUsuario);
                setUsuarios((prev) =>
                    prev.map((u) =>
                        u.id === usuarioEditando.id ? { ...nuevoUsuario, id: usuarioEditando.id } : u
                    )
                );
            } else {
                // Si es un nuevo usuario, lo agregamos
                usuario = { ...nuevoUsuario, id: Date.now() }; // Usamos una id temporal
                setUsuarios((prev) => [usuario, ...prev]);  // Actualizamos inmediatamente el estado
                await addUsuario(nuevoUsuario);  // Ahora sincronizamos con el backend
            }

            setNuevoUsuario({
                id: '',
                nombre: '',
                apellido: '',
                correo: '',
                password: '',
                username: '',
                genero: '',
                dni: '',
                foto: '',
                fechaNacimiento: '',
                telefono: '',
                enabled: true,
                empresaId: '',
                roles: []
            });

            setUsuarioEditando(null);
            setMostrarFormulario(false);  // Cerrar el formulario
        } catch (error) {
            console.error('Error al agregar o actualizar usuario', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setUsuarioEditando(null);
        setNuevoUsuario({
            id: '',
            nombre: '',
            apellido: '',
            correo: '',
            password: '',
            username: '',
            genero: '',
            dni: '',
            foto: '',
            fechaNacimiento: '',
            telefono: '',
            enabled: true,
            empresaId: '',
            roles: []
        });
    };

    const handleEditarUsuario = (usuario) => {
        setUsuarioEditando(usuario);
        setNuevoUsuario(usuario);
        setMostrarFormulario(true);
    };

    const handleEliminarUsuario = async (id) => {
        try {
            await deleteUsuario(id);
            setUsuarios((prev) => prev.filter((u) => u.id !== id));
        } catch (error) {
            console.error('Error al eliminar usuario', error);
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const indexOfLastUsuario = paginaActual * usuariosPorPagina;
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
    const usuariosPaginados = usuarios.slice(indexOfFirstUsuario, indexOfLastUsuario);

    const totalPages = Math.ceil(usuarios.length / usuariosPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Gestión de Usuarios</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nuevo Usuario
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Usuarios</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre los usuarios de la plataforma</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Genero</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosPaginados.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell>{usuario.nombre}</TableCell>
                                    <TableCell>{usuario.correo}</TableCell>
                                    <TableCell>{usuario.username}</TableCell>
                                    <TableCell>{usuario.genero}</TableCell>
                                    <TableCell>{usuario.telefono}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditarUsuario(usuario)}>
                                            <Pencil />
                                        </Button>
                                        <Button onClick={() => handleEliminarUsuario(usuario.id)}>
                                            <Trash2 />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                </div>
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '400px' }}>
                    <h3>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevoUsuario.nombre} onChange={handleInputChange} fullWidth />
                    <TextField label="Apellido" name="apellido" value={nuevoUsuario.apellido} onChange={handleInputChange} fullWidth />
                    <TextField label="Correo" name="correo" value={nuevoUsuario.correo} onChange={handleInputChange} fullWidth />
                    <TextField label="Username" name="username" value={nuevoUsuario.username} onChange={handleInputChange} fullWidth />
                    <TextField label="Password" name="password" value={nuevoUsuario.password} onChange={handleInputChange} fullWidth />
                    <TextField label="Genero" name="genero" value={nuevoUsuario.genero} onChange={handleInputChange} fullWidth />
                    <TextField label="Teléfono" name="telefono" value={nuevoUsuario.telefono} onChange={handleInputChange} fullWidth />
                    <TextField label="DNI" name="dni" value={nuevoUsuario.dni} onChange={handleInputChange} fullWidth />
                    <TextField label="Fecha Nacimiento" name="fechaNacimiento" value={nuevoUsuario.fechaNacimiento} onChange={handleInputChange} fullWidth />
                    <TextField label="Foto" name="foto" value={nuevoUsuario.foto} onChange={handleInputChange} fullWidth />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarUsuario}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Usuario;
