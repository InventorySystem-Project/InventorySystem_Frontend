import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Table, TableBody, TableCell, TableHead, TableRow, Pagination, MenuItem, Alert, TableContainer, Typography } from '@mui/material';
import { Plus, Trash2, Edit, Key } from 'lucide-react';
import { getUsuarios, addUsuario, updateUsuario, deleteUsuario, updatePassword } from '../services/UsuarioService';
import { getEmpresas } from '../services/EmpresaService';
import { getRoles } from '../services/RolService';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import * as tableStyles from '../styles/tableStyles';

const Usuario = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [roles, setRoles] = useState([]);
    const [rolesMap, setRolesMap] = useState({}); // Mapa de rolId -> nombre del rol
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
        rolId: ''
    });

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [usuariosPorPagina, setUsuariosPorPagina] = useState(5);
    const [errors, setErrors] = useState({});
    
    // Estado para el modal de restablecer contraseña
    const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, showSuccess, hideModal } = useModal();
    const [usuarioParaPassword, setUsuarioParaPassword] = useState(null);
    const [errorPassword, setErrorPassword] = useState('');

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
            rolId: ''
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
            
            // Crear un mapa de rolId -> nombre del rol
            const map = {};
            roles.forEach(rol => {
                map[rol.id] = rol.rol || rol.nombreRol || 'Sin rol';
            });
            setRolesMap(map);
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

        // Actualizar el estado directamente
        setNuevoUsuario((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validarFormulario = () => {
        const nuevoErrors = {};

        // Validar campos obligatorios
        if (!nuevoUsuario.nombre || nuevoUsuario.nombre.trim() === '') nuevoErrors.nombre = 'El nombre es obligatorio';
        if (!nuevoUsuario.apellido || nuevoUsuario.apellido.trim() === '') nuevoErrors.apellido = 'El apellido es obligatorio';
        if (!nuevoUsuario.correo || nuevoUsuario.correo.trim() === '') nuevoErrors.correo = 'El correo es obligatorio';
        if ((!nuevoUsuario.password || nuevoUsuario.password.trim() === '') && !usuarioEditando) nuevoErrors.password = 'La contraseña es obligatoria';
        if (!nuevoUsuario.username || nuevoUsuario.username.trim() === '') nuevoErrors.username = 'El nombre de usuario es obligatorio';
        if (!nuevoUsuario.rolId) nuevoErrors.rolId = 'El rol es obligatorio';

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
                await updateUsuario(usuarioEditando.id, nuevoUsuario);
                showSuccess('Usuario actualizado correctamente');
            } else {
                // Si es un nuevo usuario, lo agregamos
                await addUsuario(nuevoUsuario);
                showSuccess('Usuario creado correctamente');
            }

            // Recargar la lista completa desde el servidor
            await fetchUsuarios();

            resetearFormulario();
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al agregar o actualizar usuario', error);
            showError('Error al guardar el usuario. Por favor, intente nuevamente.');
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
    };

    const handleEditarUsuario = (usuarioAEditar) => {
        if (!usuarioAEditar) return;

        // Mapear género del backend (texto completo) al formato del formulario (letra)
        let generoMapeado = usuarioAEditar.genero || '';
        if (generoMapeado === 'Masculino') generoMapeado = 'M';
        else if (generoMapeado === 'Femenino') generoMapeado = 'F';
        else if (generoMapeado === 'Otro') generoMapeado = 'O';
        // Si ya viene como 'M', 'F', 'O', se mantiene igual

        setUsuarioEditando(usuarioAEditar);
        setNuevoUsuario({
            id: usuarioAEditar.id,
            nombre: usuarioAEditar.nombre || '',
            apellido: usuarioAEditar.apellido || '',
            correo: usuarioAEditar.correo || '',
            dni: usuarioAEditar.dni || '',
            fechaNacimiento: usuarioAEditar.fechaNacimiento ? new Date(usuarioAEditar.fechaNacimiento).toISOString().split('T')[0] : '',
            telefono: usuarioAEditar.telefono || '',
            genero: generoMapeado,
            empresaId: usuarioAEditar.empresa?.id || usuarioAEditar.empresaId || '',
            rolId: usuarioAEditar.rol?.id || usuarioAEditar.rolId || '',
            enabled: usuarioAEditar.enabled ?? true,
            username: usuarioAEditar.username || ''
            // No incluimos password al editar
        });
        setMostrarFormulario(true);
    };

    const handleEliminarUsuario = async (id) => {
        showConfirm(
            '¿Está seguro que desea eliminar este usuario?',
            async () => {
                try {
                    await deleteUsuario(id);
                    showSuccess('Usuario eliminado correctamente');
                    
                    // Recargar la lista completa desde el servidor
                    await fetchUsuarios();
                } catch (error) {
                    console.error('Error al eliminar usuario', error);
                    showError('Error al eliminar el usuario. Por favor, intente nuevamente.');
                }
            },
            'Eliminar Usuario'
        );
    };

    // Función para abrir el modal de restablecer contraseña
    const handleAbrirModalPassword = (usuario) => {
        setUsuarioParaPassword(usuario);
        setNuevaPassword('');
        setConfirmarPassword('');
        setErrorPassword('');
        setMostrarModalPassword(true);
    };

    // Función para cerrar el modal de contraseña
    const handleCerrarModalPassword = () => {
        setMostrarModalPassword(false);
        setUsuarioParaPassword(null);
        setNuevaPassword('');
        setConfirmarPassword('');
        setErrorPassword('');
    };

    // Función para restablecer contraseña
    const handleRestablecerPassword = async () => {
        setErrorPassword('');

        // Validaciones
        if (!nuevaPassword || !confirmarPassword) {
            setErrorPassword('Por favor complete todos los campos');
            return;
        }

        if (nuevaPassword.length < 6) {
            setErrorPassword('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            setErrorPassword('Las contraseñas no coinciden');
            return;
        }

        try {
            await updatePassword(usuarioParaPassword.id, nuevaPassword);
            showSuccess('Contraseña actualizada exitosamente');
            handleCerrarModalPassword();
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            setErrorPassword('Error al actualizar la contraseña. Por favor, intente nuevamente.');
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
    const renderBackgroundRol = (usuario) => {
        // Obtener el nombre del rol usando el rolId del usuario
        let rolName = '';
        
        // Si el usuario tiene un objeto rol, usarlo
        if (usuario.rol && typeof usuario.rol === 'object') {
            rolName = usuario.rol.rol || usuario.rol.nombreRol;
        } 
        // Si tiene rolId, buscar en el mapa
        else if (usuario.rolId && rolesMap[usuario.rolId]) {
            rolName = rolesMap[usuario.rolId];
        }

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
            case "SOPORTE_N1":
                return (
                    <div style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Soporte N1
                    </div>
                );
            case "SOPORTE_N2":
                return (
                    <div style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Soporte N2
                    </div>
                );
            case "GESTOR_CAMBIOS":
                return (
                    <div style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Gestor de Cambios
                    </div>
                );
            case "CAB_MEMBER":
                return (
                    <div style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Miembro CAB
                    </div>
                );
            case "PROJECT_MANAGER":
                return (
                    <div style={{
                        backgroundColor: '#ec4899',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Project Manager
                    </div>
                );
            default:
                return <div style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    width: 'fit-content'
                }}>{rolName || 'Sin rol'}</div>;
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

                <TableContainer sx={tableStyles.enhancedTableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.enhancedTableHead}>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Correo</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Genero</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Teléfono</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Estado</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosPaginados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={tableStyles.emptyTableMessage}>
                                        <Box className="empty-icon">👥</Box>
                                        <Typography>No hay usuarios registrados</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuariosPaginados.map((usuario) => (
                                    <TableRow key={usuario.id} sx={tableStyles.enhancedTableRow}>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{usuario.nombre} {usuario.apellido}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{usuario.correo}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{usuario.username}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>
                                            {usuario.genero === 'M' ? 'Masculino' : usuario.genero === 'F' ? 'Femenino' : usuario.genero === 'O' ? 'Otro' : usuario.genero}
                                        </TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{usuario.telefono}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{usuario.enabled ? 'Activo' : 'Inactivo'}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{renderBackgroundRol(usuario)}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                            <Box sx={tableStyles.enhancedTableCellActions}>
                                                <Button color="primary" onClick={() => handleEditarUsuario(usuario)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                                                </Button>
                                                <Button color="error" onClick={() => handleEliminarUsuario(usuario.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
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

                        {usuarioEditando ? (
                            // Modo edición: mostrar asteriscos y deshabilitar
                            <TextField
                                label="Contraseña"
                                name="password"
                                type="password"
                                value="********"
                                fullWidth
                                disabled
                                style={{ flex: 1 }}
                                helperText="Use el botón 'Restablecer Contraseña' para cambiarla"
                            />
                        ) : (
                            // Modo creación: permitir ingresar contraseña
                            <TextField
                                label="Contraseña"
                                name="password"
                                type="password"
                                value={nuevoUsuario.password}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                error={!!errors.password}
                                helperText={errors.password}
                                style={{ flex: 1 }}
                            />
                        )}
                    </div>

                    {/* Cuarta fila: DNI y Teléfono */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <TextField
                            type="number"
                            label="DNI"
                            name="dni"
                            value={nuevoUsuario.dni}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.dni}
                            helperText={errors.dni || "Solo números positivos"}
                            InputProps={{ inputProps: { min: 0, step: 1 } }}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                            style={{ flex: 1 }}
                        />
                        <TextField
                            type="number"
                            label="Teléfono"
                            name="telefono"
                            value={nuevoUsuario.telefono}
                            onChange={handleInputChange}
                            fullWidth
                            error={!!errors.telefono}
                            helperText={errors.telefono || "Solo números positivos"}
                            InputProps={{ inputProps: { min: 0, step: 1 } }}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
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
                            value={nuevoUsuario.rolId || ''}
                            onChange={handleInputChange}
                            name="rolId"
                            required
                            error={!!errors.rolId}
                            helperText={errors.rolId}
                            style={{ flex: 1 }}
                        >
                            <MenuItem value=""><em>-- Seleccione un rol --</em></MenuItem>
                            {roles.map((rol) => (
                                <MenuItem key={rol.id} value={rol.id}>
                                    {rol.rol}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleCancelar}
                            style={{ minWidth: '120px' }}
                        >
                            Cancelar
                        </Button>
                        
                        {usuarioEditando && (
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={() => handleAbrirModalPassword(usuarioEditando)}
                                startIcon={<Key size={18} />}
                                style={{ minWidth: '180px' }}
                            >
                                Restablecer Contraseña
                            </Button>
                        )}
                        
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

            {/* Modal para Restablecer Contraseña */}
            <Modal
                open={mostrarModalPassword}
                onClose={handleCerrarModalPassword}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Box style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '450px', maxWidth: '90%' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Restablecer Contraseña
                    </h3>
                    
                    {usuarioParaPassword && (
                        <Alert severity="info" style={{ marginBottom: '20px' }}>
                            Usuario: <strong>{usuarioParaPassword.nombre} {usuarioParaPassword.apellido}</strong>
                        </Alert>
                    )}

                    {errorPassword && (
                        <Alert severity="error" style={{ marginBottom: '15px' }}>
                            {errorPassword}
                        </Alert>
                    )}

                    <TextField
                        label="Nueva Contraseña"
                        type="password"
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="Mínimo 6 caracteres"
                    />

                    <TextField
                        label="Confirmar Contraseña"
                        type="password"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        placeholder="Repita la contraseña"
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
                        <Button
                            variant="outlined"
                            onClick={handleCerrarModalPassword}
                            style={{ minWidth: '120px' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRestablecerPassword}
                            style={{ minWidth: '120px' }}
                        >
                            Actualizar
                        </Button>
                    </div>
                </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default Usuario;