import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Typography, TableContainer, CircularProgress, Autocomplete } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import { getProveedores, addProveedor, updateProveedor, deleteProveedor, getProveedorById, getPaises } from '../services/ProveedorService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import * as tableStyles from '../styles/tableStyles';

const Proveedores = () => {
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);

    const [proveedores, setProveedores] = useState([]);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombreEmpresaProveedor: "",
        nombreContacto: "",
        telefono: "",
        correo: "",
        direccion: "",
        categoria: "",
        pais: "",
        enabled: true,
        ruc: ""
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [proveedorEditando, setProveedorEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [proveedoresPorPagina, setProveedoresPorPagina] = useState(5);
    const [paises, setPaises] = useState([]);  // Lista de países [{ code, name, flag }]
    const [paisesNombreCompleto, setPaisesNombreCompleto] = useState({});  // Mapa de códigos ISO a nombres completos de países
    const [intentoGuardar, setIntentoGuardar] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, showSuccess, hideModal } = useModal();

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                await fetchProveedores();
                await fetchPaises();
            } catch (error) {
                console.error('Error al inicializar datos:', error);
                showError('Error al cargar datos iniciales');
            } finally {
                setLoading(false);
            }
        };
        
        initializeData();
    }, []);

    // ✅ Monitorear cuando se cargan los países
    useEffect(() => {
        console.log('Países actualizados:', paises.length, paises);
    }, [paises]);

    // ✅ Monitorear cuando se actualiza nuevoProveedor
    useEffect(() => {
        if (proveedorEditando) {
            console.log('NuevoProveedor actualizado:', nuevoProveedor);
            console.log('País en nuevoProveedor:', nuevoProveedor.pais);
        }
    }, [nuevoProveedor, proveedorEditando]);

    // ✅ Función para validar y ajustar el país del proveedor
    const validarPaisProveedor = (proveedor) => {
        console.log('Validando país del proveedor:', proveedor.pais);
        console.log('Países disponibles para validar:', paises.map(p => ({ 
            code: p.code || p.cca2, 
            name: p.name || p.name?.common 
        })));

        if (!proveedor.pais || paises.length === 0) {
            console.log('País vacío o países no cargados, devolviendo proveedor original');
            return proveedor;
        }

        // Buscar el país en diferentes formatos
        const paisExiste = paises.find(pais => 
            (pais.code === proveedor.pais) || 
            (pais.cca2 === proveedor.pais) ||
            (pais.name === proveedor.pais) ||
            (pais.name?.common === proveedor.pais)
        );

        if (paisExiste) {
            console.log('País encontrado:', paisExiste);
            // Asegurar que usamos el código correcto
            const codigoPais = paisExiste.code || paisExiste.cca2;
            return {
                ...proveedor,
                pais: codigoPais
            };
        } else {
            console.warn(`País "${proveedor.pais}" no encontrado en lista de países disponibles`);
            // Si el país no existe, agregar temporalmente a la lista
            const paisTemporal = {
                code: proveedor.pais,
                name: proveedor.pais
            };
            setPaises(prev => {
                const yaExiste = prev.some(p => (p.code === proveedor.pais) || (p.cca2 === proveedor.pais));
                if (!yaExiste) {
                    console.log('Agregando país temporal:', paisTemporal);
                    return [...prev, paisTemporal];
                }
                return prev;
            });
            return proveedor;
        }
    };

    const fetchProveedores = async () => {
        try {
            const proveedores = await getProveedores();
            setProveedores(proveedores);
        } catch (error) {
            console.error('Error al obtener proveedores', error);
        }
    };

const fetchPaises = async () => {
        try {
            // ✅ Intentar backend primero, con fallback automático a API externa
            console.log('Intentando obtener países del backend...');
            const paisesData = await getPaises();
            console.log('Países recibidos del backend:', paisesData);
            
            if (Array.isArray(paisesData) && paisesData.length > 0) {
                // ✅ Filtrar y validar países antes de ordenar
                const paisesValidos = paisesData.filter(pais => pais && pais.name && pais.code);
                
                if (paisesValidos.length > 0) {
                    const paisesOrdenados = paisesValidos.sort((a, b) => {
                        const nombreA = a.name || '';
                        const nombreB = b.name || '';
                        return nombreA.localeCompare(nombreB);
                    });
                    
                    setPaises(paisesOrdenados);
                    
                    // ✅ Crear mapa de códigos a nombres para compatibilidad
                    const mapaCodigosNombres = {};
                    paisesOrdenados.forEach(pais => {
                        if (pais.code && pais.name) {
                            mapaCodigosNombres[pais.code] = pais.name;
                        }
                    });
                    setPaisesNombreCompleto(mapaCodigosNombres);
                    
                    console.log('Países cargados desde backend:', paisesOrdenados.length);
                    return; // Éxito, no necesitar fallback
                }
            }
            
            // Si llegamos aquí, el backend no devolvió datos válidos
            throw new Error('Backend no devolvió países válidos');
            
        } catch (error) {
            console.warn('Backend de países falló, usando API externa como fallback:', error);
            await fetchPaisesExternal();
        }
    };

    // Función de fallback para API externa
    const fetchPaisesExternal = async () => {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.message}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const paisesOrdenados = data
                    .filter(pais => pais && pais.name && pais.name.common && pais.cca2)
                    .map(pais => ({
                        code: pais.cca2,
                        name: pais.name.common,
                        flag: `https://flagcdn.com/w40/${pais.cca2.toLowerCase()}.png`
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                setPaises(paisesOrdenados);
                // Mapa de códigos a nombres
                const mapaCodigosNombres = {};
                paisesOrdenados.forEach(pais => {
                    mapaCodigosNombres[pais.code] = pais.name;
                });
                setPaisesNombreCompleto(mapaCodigosNombres);
                console.log('Países cargados desde API externa:', paisesOrdenados.length);
            }
        } catch (error) {
            console.error('Error al obtener países de API externa:', error);
        }
    };

    const handleInputChange = (e) => {
        try {
            const { name, value } = e.target;
            
            // Logging para debug cuando se selecciona país
            if (name === 'pais') {
                console.log('País seleccionado:', value);
            }
            
            setNuevoProveedor(prev => ({
                ...prev,
                [name]: value
            }));
        } catch (error) {
            console.error('Error en handleInputChange:', error);
            showError('Error al actualizar el campo');
        }
    };

    const handleAgregarProveedor = async () => {
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }
        
        // Activar validación visual
        setIntentoGuardar(true);
        
        // Validar campos obligatorios
        if (!nuevoProveedor.nombreEmpresaProveedor || nuevoProveedor.nombreEmpresaProveedor.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.ruc || nuevoProveedor.ruc.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.nombreContacto || nuevoProveedor.nombreContacto.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.telefono || nuevoProveedor.telefono.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.correo || nuevoProveedor.correo.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '') {
            return;
        }
        
        if (!nuevoProveedor.direccion || nuevoProveedor.direccion.trim() === '') {
            return;
        }

        try{
            let proveedor;

            if (proveedorEditando) {
                // ✅ Si estamos editando un proveedor, lo actualizamos con el endpoint corregido
                const proveedorActualizado = await updateProveedor(proveedorEditando.id, nuevoProveedor);
                
                // ✅ Recargar la lista completa para asegurar datos frescos y consistentes
                console.log('Recargando lista de proveedores después de actualizar...');
                await fetchProveedores();
                console.log('Lista de proveedores recargada');
                
                showSuccess('Proveedor actualizado correctamente');
            } else {
                // Si es un nuevo proveedor, lo agregamos
                const nuevoProveedorCreado = await addProveedor(nuevoProveedor);
                
                // Recargar la lista completa para obtener el ID correcto del backend
                await fetchProveedores();
                
                showSuccess('Proveedor agregado correctamente');
            }

            // Limpiar los campos después de agregar o editar el proveedor
            setNuevoProveedor({
                nombreEmpresaProveedor: "",
                nombreContacto: "",
                telefono: "",
                correo: "",
                direccion: "",
                categoria: "",
                pais: "",
                ruc: "",
                enabled: true
            });

            setProveedorEditando(null);
            setIntentoGuardar(false);
            setMostrarFormulario(false);  // Cerrar el formulario
            
            // ✅ Asegurar que los países estén cargados después de operaciones
            if (paises.length === 0) {
                await fetchPaises();
            }
        } catch (error) {
            console.error('Error al agregar o actualizar proveedor', error);
            const mensaje = proveedorEditando ? 'Error al actualizar proveedor' : 'Error al agregar proveedor';
            showError(`${mensaje}: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setProveedorEditando(null);
        setIntentoGuardar(false);
        setNuevoProveedor({
            nombreEmpresaProveedor: "",
            nombreContacto: "",
            telefono: "",
            correo: "",
            direccion: "",
            categoria: "",
            pais: "",
            ruc: "",
            enabled: true
        });
    };

    const handleEditarProveedor = async (proveedor) => {
        try {
            // ✅ Asegurar que los países estén cargados ANTES de editar
            if (paises.length === 0) {
                console.log('Cargando países antes de editar...');
                await fetchPaises();
                // Esperar un poco para asegurar que el estado se actualice
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // ✅ Obtener datos actualizados del proveedor desde el backend
            const proveedorActualizado = await getProveedorById(proveedor.id);
            
            setIntentoGuardar(false);
            
            // ✅ Validar y ajustar el país si es necesario
            const proveedorValidado = validarPaisProveedor(proveedorActualizado);
            
            setProveedorEditando(proveedorValidado);
            setNuevoProveedor(proveedorValidado);
            setMostrarFormulario(true);
        } catch (error) {
            console.error('Error al obtener proveedor para editar:', error);
            showError('Error al cargar los datos del proveedor');
        }
    };

    const handleEliminarProveedor = async (id) => {
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }
        
        showConfirm('¿Está seguro que desea eliminar este proveedor?', async () => {
            try {
                await deleteProveedor(id);
                setProveedores(prev => prev.filter(p => p.id !== id));
                showSuccess('Proveedor eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar el proveedor', error);
            }
        });
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const handleChangeProveedoresPorPagina = (event) => {
        const value = event.target.value;
        if (value === "all") {
            setProveedoresPorPagina(proveedores.length);
            setPaginaActual(1);
        } else {
            setProveedoresPorPagina(Number(value));
            setPaginaActual(1);
        }
    };

    const indexOfLastProveedor = paginaActual * proveedoresPorPagina;
    const indexOfFirstProveedor = indexOfLastProveedor - proveedoresPorPagina;
    const proveedoresPaginados = proveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);

    const totalPages = Math.ceil(proveedores.length / proveedoresPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 >Gestión de Proveedores</h2>
                <Button variant="contained" color="primary" onClick={() => {
                    if (isGuest) {
                        setShowGuestAlert(true);
                    } else {
                        setIntentoGuardar(false);
                        setMostrarFormulario(true);
                    }
                }}>
                    <Plus /> Nuevo Proveedor
                </Button>

            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Proveedores</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus proveedores de materias primas</p>
                </div>

                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            padding: '60px'
                        }}
                    >
                        <CircularProgress size={40} style={{ color: '#6366f1' }} />
                        <Typography variant="body1" sx={{ marginTop: 2, color: '#666' }}>
                            Cargando proveedores...
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={tableStyles.enhancedTableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.enhancedTableHead}>
                            <TableRow>
                                <TableCell>Nombre Empresa</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>RUC</TableCell>
                                <TableCell>Contacto</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>País</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Teléfono</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Correo</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {proveedoresPaginados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={tableStyles.emptyTableMessage}>
                                        <Box className="empty-icon">🏭</Box>
                                        <Typography>No hay proveedores registrados</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                proveedoresPaginados.map((proveedor) => (
                                    <TableRow key={proveedor.id} sx={tableStyles.enhancedTableRow}>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{proveedor.nombreEmpresaProveedor}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{proveedor.ruc}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{proveedor.nombreContacto}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {proveedor.pais && (
                                                    <img
                                                        src={`https://flagcdn.com/w320/${proveedor.pais.toLowerCase()}.png`}
                                                        alt={proveedor.pais}
                                                        style={{
                                                            width: '24px',
                                                            height: '16px',
                                                            borderRadius: '2px',
                                                        }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <span>{paisesNombreCompleto[proveedor.pais] || proveedor.pais || 'Sin país'}</span>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{proveedor.telefono}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{proveedor.correo}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                            <Box sx={tableStyles.enhancedTableCellActions}>
                                                <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarProveedor(proveedor)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                                                </Button>
                                                <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarProveedor(proveedor.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
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
                )}
            </div>

            <Modal
                open={mostrarFormulario}
                onClose={() => setMostrarFormulario(false)}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                    <TextField
                        label="Nombre Empresa"
                        name="nombreEmpresaProveedor"
                        value={nuevoProveedor.nombreEmpresaProveedor}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevoProveedor.nombreEmpresaProveedor || nuevoProveedor.nombreEmpresaProveedor.trim() === '')}
                        helperText={intentoGuardar && (!nuevoProveedor.nombreEmpresaProveedor || nuevoProveedor.nombreEmpresaProveedor.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />

                    <TextField 
                        type="number"
                        label="RUC" 
                        name="ruc" 
                        value={nuevoProveedor.ruc} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        InputProps={{ inputProps: { min: 0, step: 1 } }}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                        error={intentoGuardar && (!nuevoProveedor.ruc || nuevoProveedor.ruc.trim() === '')}
                        helperText={
                            intentoGuardar && (!nuevoProveedor.ruc || nuevoProveedor.ruc.trim() === '')
                            ? 'Este campo es obligatorio'
                            : 'Solo números positivos'
                        }
                    />
                    <TextField 
                        label="Nombre de Contacto" 
                        name="nombreContacto" 
                        value={nuevoProveedor.nombreContacto} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevoProveedor.nombreContacto || nuevoProveedor.nombreContacto.trim() === '')}
                        helperText={intentoGuardar && (!nuevoProveedor.nombreContacto || nuevoProveedor.nombreContacto.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />
                    <TextField 
                        type="number"
                        label="Teléfono" 
                        name="telefono" 
                        value={nuevoProveedor.telefono} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        InputProps={{ inputProps: { min: 0, step: 1 } }}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                        error={intentoGuardar && (!nuevoProveedor.telefono || nuevoProveedor.telefono.trim() === '')}
                        helperText={
                            intentoGuardar && (!nuevoProveedor.telefono || nuevoProveedor.telefono.trim() === '')
                            ? 'Este campo es obligatorio'
                            : 'Solo números positivos'
                        }
                    />
                    <TextField 
                        label="Correo" 
                        name="correo" 
                        value={nuevoProveedor.correo} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevoProveedor.correo || nuevoProveedor.correo.trim() === '')}
                        helperText={intentoGuardar && (!nuevoProveedor.correo || nuevoProveedor.correo.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />
                    <TextField
                        sx={{ marginBottom: 2 }}
                        fullWidth
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '')}
                        helperText={intentoGuardar && (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />
                    <Autocomplete
                        options={paises}
                        getOptionLabel={option => option.name}
                        value={paises.find(p => p.code === nuevoProveedor.pais) || null}
                        onChange={(event, newValue) => {
                            setNuevoProveedor(prev => ({ ...prev, pais: newValue ? newValue.code : '' }));
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', color: '#222' }}>
                                <img src={option.flag} alt={option.code} style={{ width: 24, height: 16, marginRight: 8, borderRadius: 2 }} />
                                {option.name}
                            </Box>
                        )}
                        renderInput={params => (
                            <TextField {...params} label="País" margin="normal" fullWidth variant="outlined"
                                InputProps={{ ...params.InputProps, style: { background: '#f9fafb', color: '#222' } }}
                            />
                        )}
                        sx={{ marginBottom: 2 }}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                    />

                    <TextField 
                        label="Dirección" 
                        name="direccion" 
                        value={nuevoProveedor.direccion} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevoProveedor.direccion || nuevoProveedor.direccion.trim() === '')}
                        helperText={intentoGuardar && (!nuevoProveedor.direccion || nuevoProveedor.direccion.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarProveedor}>Guardar</Button>
                    </div>

                </Box>
            </Modal>
            {/* Guest alert modal */}
            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
                    <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
                    <Typography style={{ margin: '15px 0' }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhastApp 985804246.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
                </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default Proveedores;
