import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, MenuItem } from '@mui/material';
import { Plus, Trash2, Edit } from 'lucide-react';
import { getUsuarios, addUsuario, updateUsuario, deleteUsuario } from '../services/UsuarioService';
import { getEmpresas } from '../services/EmpresaService';
import { getRoles } from '../services/RolService';

const Usuario = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [roles, setRoles] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({
        id: '',
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        username: '',
        genero: '',
        dni: '',
        fechaNacimiento: '',
        telefono: '',
        enabled: true,
        empresaId: '',
        rol: { id: '', rol: '' }
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(5);
    const [errors, setErrors] = useState({});

    // Opciones para el género
    const opcionesGenero = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' },
        { value: 'O', label: 'Otro' }
    ];

    useEffect(() => {
        fetchUsuarios();
        fetchEmpresas();
        fetchRoles();
    }, []);

    // Asegurarse de limpiar el estado de edición cuando se cierra el modal
    useEffect(() => {
        if (!mostrarFormulario) {
            setUsuarioEditando(null);
            resetearFormulario();
        }
    }, [mostrarFormulario]);

    const resetearFormulario = () => {
        setNuevoUsuario({
            id: '',
            nombre: '',
            apellido: '',
            correo: '',
            password: '',
            username: '',
            genero: '',
            dni: '',
            fechaNacimiento: '',
            telefono: '',
            enabled: true,
            empresaId: '',
            rol: { id: '', rol: '' }
        });
        setErrors({});
    };

    const fetchUsuarios = async () => {
        try {
            const usuarios = await getUsuarios();
            setUsuarios(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios', error);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const empresas = await getEmpresas();
            setEmpresas(empresas);
        } catch (error) {
            console.error('Error al obtener empresas', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const roles = await getRoles();
            setRoles(roles);
        } catch (error) {
            console.error('Error al obtener roles', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validación para DNI y teléfono
        if (name === "dni" || name === "telefono") {
            // Solo permitir números
            if (value !== '' && !/^\d+$/.test(value)) {
                return; // No actualizar el estado si no es un número
            }
        }

        // Limpiar error específico cuando el usuario empieza a corregir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Manejo especial para el campo rol
        if (name === "rol") {
            // Encontrar el objeto rol completo basado en el id seleccionado
            const rolSeleccionado = roles.find(r => r.id.toString() === value.toString());

            if (rolSeleccionado) {
                setNuevoUsuario((prev) => ({
                    ...prev,
                    rol: {
                        id: rolSeleccionado.id,
                        rol: rolSeleccionado.rol
                    }
                }));
            }
        } else {
            setNuevoUsuario((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validarFormulario = () => {
        const nuevoErrors = {};

        // Validar campos obligatorios
        if (!nuevoUsuario.nombre) nuevoErrors.nombre = 'El nombre es obligatorio';
        if (!nuevoUsuario.apellido) nuevoErrors.apellido = 'El apellido es obligatorio';
        if (!nuevoUsuario.correo) nuevoErrors.correo = 'El correo es obligatorio';
        if (!nuevoUsuario.password && !usuarioEditando) nuevoErrors.password = 'La contraseña es obligatoria';
        if (!nuevoUsuario.username) nuevoErrors.username = 'El nombre de usuario es obligatorio';
        if (!nuevoUsuario.rol.id) nuevoErrors.rol = 'El rol es obligatorio';

        // Validar formato correo
        if (nuevoUsuario.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.correo)) {
            nuevoErrors.correo = 'Formato de correo inválido';
        }

        // Validar que DNI tenga solo números
        if (nuevoUsuario.dni && !/^\d+$/.test(nuevoUsuario.dni)) {
            nuevoErrors.dni = 'El DNI debe contener solo números';
        }

        // Validar que teléfono tenga solo números
        if (nuevoUsuario.telefono && !/^\d+$/.test(nuevoUsuario.telefono)) {
            nuevoErrors.telefono = 'El teléfono debe contener solo números';
        }

        setErrors(nuevoErrors);
        return Object.keys(nuevoErrors).length === 0;
    };

    const handleAgregarUsuario = async () => {
        if (!validarFormulario()) {
            return;
        }

        try {
            if (usuarioEditando) {
                // Si estamos editando un usuario, lo actualizamos
                const usuarioActualizado = await updateUsuario(usuarioEditando.id, nuevoUsuario);

                // Actualizar la lista inmediatamente con el usuario actualizado
                setUsuarios((prev) =>
                    prev.map((u) =>
                        u.id === usuarioEditando.id ? usuarioActualizado : u
                    )
                );
            } else {
                // Si es un nuevo usuario, lo agregamos
                const usuarioCreado = await addUsuario(nuevoUsuario);

                // Añadir el nuevo usuario a la lista inmediatamente
                setUsuarios((prev) => [usuarioCreado, ...prev]);
            }

            resetearFormulario();
            setMostrarFormulario(false);

            // Opcional: Refrescar toda la lista para asegurarnos de tener datos actualizados
            fetchUsuarios();
        } catch (error) {
            console.error('Error al agregar o actualizar usuario', error);
            alert('Error al guardar el usuario. Por favor, intente nuevamente.');
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
    };

    const handleEditarUsuario = (usuario) => {
        // Asegurarse de que el rol tenga el formato correcto cuando editamos
        const usuarioParaEditar = {
            ...usuario,
            // Asegurarse de que el rol tenga tanto el id como el nombre
            rol: usuario.rol && typeof usuario.rol === 'object'
                ? usuario.rol
                : {
                    id: usuario.rol?.id || '',
                    rol: usuario.rol?.rol || ''
                }
        };

        setUsuarioEditando(usuario);
        setNuevoUsuario(usuarioParaEditar);
        setMostrarFormulario(true);
    };

    const handleEliminarUsuario = async (id) => {
        if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
            try {
                await deleteUsuario(id);
                setUsuarios((prev) => prev.filter((u) => u.id !== id));
            } catch (error) {
                console.error('Error al eliminar usuario', error);
                alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
            }
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const indexOfLastUsuario = paginaActual * usuariosPorPagina;
    const indexOfFirstUsuario = indexOfLastUsuario - usuariosPorPagina;
    const usuariosPaginados = usuarios.slice(indexOfFirstUsuario, indexOfLastUsuario);

    const totalPages = Math.ceil(usuarios.length / usuariosPorPagina);

    // Función para renderizar el fondo de los roles
    const renderBackgroundRol = (rol) => {
        // Asegurándonos de que podemos manejar tanto "rol" como objeto o como string directamente
        const rolName = typeof rol === 'object' ? rol?.rol : rol;

        switch (rolName) {
            case "ADMIN":
                return (
                    <div style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Administrador
                    </div>
                );
            case "USER":
                return (
                    <div style={{
                        backgroundColor: '#4a7fff',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Usuario
                    </div>
                );
            default:
                return <div>{rolName}</div>;
        }
    };

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2>Gestión de Usuarios</h2>
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
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Username</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Genero</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Estado</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Rol</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosPaginados.length > 0 ? (
                                usuariosPaginados.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                                        <TableCell>{usuario.correo}</TableCell>
                                        <TableCell>{usuario.username}</TableCell>
                                        <TableCell>{
                                            usuario.genero === 'M' ? 'Masculino' :
                                                usuario.genero === 'F' ? 'Femenino' :
                                                    usuario.genero === 'O' ? 'Otro' : usuario.genero
                                        }</TableCell>
                                        <TableCell>{usuario.telefono}</TableCell>
                                        <TableCell>{usuario.enabled ? 'Activo' : 'Inactivo'}</TableCell>
                                        <TableCell>{renderBackgroundRol(usuario.rol)}</TableCell>
                                        <TableCell>
                                            <Button color="primary" onClick={() => handleEditarUsuario(usuario)}>
                                                <Edit size={18} />
                                            </Button>
                                            <Button color="error" onClick={() => handleEliminarUsuario(usuario.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} style={{ textAlign: 'center' }}>No hay usuarios registrados</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                        <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                    </div>
                </div>
            </div>

            <Modal
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>

                    {/* Primer fila: Nombre y Apellido */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            value={nuevoUsuario.nombre}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            label="Apellido"
                            name="apellido"
                            value={nuevoUsuario.apellido}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.apellido}
                            helperText={errors.apellido}
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Segunda fila: Correo y Género */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            label="Correo"
                            name="correo"
                            type="email"
                            value={nuevoUsuario.correo}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.correo}
                            helperText={errors.correo}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            select
                            label="Género"
                            name="genero"
                            value={nuevoUsuario.genero}
                            onChange={handleInputChange}
                            fullWidth
                            style={{ flex: 1 }}
                        >
                            {opcionesGenero.map((opcion) => (
                                <MenuItem key={opcion.value} value={opcion.value}>
                                    {opcion.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Tercera fila: Username y Contraseña */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            label="Username"
                            name="username"
                            value={nuevoUsuario.username}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            error={!!errors.username}
                            helperText={errors.username}
                            style={{ flex: 1 }}
                        />

                        <TextField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={nuevoUsuario.password}
                            onChange={handleInputChange}
                            fullWidth
                            required={!usuarioEditando}
                            error={!!errors.password}
                            helperText={errors.password}
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Cuarta fila: DNI y Teléfono */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            label="DNI"
                            name="dni"
                            value={nuevoUsuario.dni}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.dni}
                            helperText={errors.dni}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            label="Teléfono"
                            name="telefono"
                            value={nuevoUsuario.telefono}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.telefono}
                            helperText={errors.telefono}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Quinta fila: Fecha de Nacimiento y Empresa */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha de Nacimiento"
                            InputLabelProps={{ shrink: true }}
                            name="fechaNacimiento"
                            value={nuevoUsuario.fechaNacimiento}
                            onChange={handleInputChange}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Empresa"
                            value={nuevoUsuario.empresaId}
                            onChange={handleInputChange}
                            name="empresaId"
                            style={{ flex: 1 }}
                        >
                            {empresas.map((empresa) => (
                                <MenuItem key={empresa.id} value={empresa.id}>
                                    {empresa.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Sexta fila: Rol */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            fullWidth
                            select
                            label="Rol"
                            value={nuevoUsuario.rol.id}
                            onChange={handleInputChange}
                            name="rol"
                            required
                            error={!!errors.rol}
                            helperText={errors.rol}
                            style={{ flex: 1 }}
                        >
                            {roles.map((rol) => (
                                <MenuItem key={rol.id} value={rol.id}>
                                    {rol.rol}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleCancelar}
                            style={{ minWidth: '120px' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAgregarUsuario}
                            style={{ minWidth: '120px' }}
                        >
                            {usuarioEditando ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Usuario;