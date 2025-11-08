import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow,MenuItem, Typography } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import { getProveedores, addProveedor, updateProveedor, deleteProveedor, getProveedorById, getPaises } from '../services/ProveedorService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';

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
    const [paises, setPaises] = useState([]);  // Nuevo estado para los países
    const [paisesNombreCompleto, setPaisesNombreCompleto] = useState({});  // Mapa de códigos ISO a nombres completos de países
    const [intentoGuardar, setIntentoGuardar] = useState(false);
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, showSuccess, hideModal } = useModal();

    useEffect(() => {
        const initializeData = async () => {
            try {
                await fetchProveedores();
                await fetchPaises();
            } catch (error) {
                console.error('Error al inicializar datos:', error);
                showError('Error al cargar datos iniciales');
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
                // ✅ Filtrar y validar países de API externa
                const paisesValidos = data.filter(pais => 
                    pais && pais.name && pais.name.common && pais.cca2
                );
                
                const paisesOrdenados = paisesValidos.sort((a, b) => {
                    const nombreA = a.name?.common || '';
                    const nombreB = b.name?.common || '';
                    return nombreA.localeCompare(nombreB);
                });
                
                setPaises(paisesOrdenados);
                
                // ✅ Crear mapa de códigos a nombres para API externa también
                const mapaCodigosNombres = {};
                paisesOrdenados.forEach(pais => {
                    if (pais.cca2 && pais.name?.common) {
                        mapaCodigosNombres[pais.cca2] = pais.name.common;
                    }
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
            showAlert('El campo "Nombre de Empresa Proveedor" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.ruc || nuevoProveedor.ruc.trim() === '') {
            showAlert('El campo "RUC" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.nombreContacto || nuevoProveedor.nombreContacto.trim() === '') {
            showAlert('El campo "Nombre de Contacto" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.telefono || nuevoProveedor.telefono.trim() === '') {
            showAlert('El campo "Teléfono" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.correo || nuevoProveedor.correo.trim() === '') {
            showAlert('El campo "Correo" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '') {
            showAlert('El campo "País" es obligatorio', 'Campo Obligatorio', 'warning');
            return;
        }
        
        if (!nuevoProveedor.direccion || nuevoProveedor.direccion.trim() === '') {
            showAlert('El campo "Dirección" es obligatorio', 'Campo Obligatorio', 'warning');
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
                <Button variant="contained" color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : setMostrarFormulario(true)}>
                    <Plus /> Nuevo Proveedor
                </Button>

            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Proveedores</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus proveedores de materias primas</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre Empresa</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>RUC</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Contacto</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>País</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {proveedoresPaginados.map((proveedor) => (
                                <TableRow key={proveedor.id}>
                                    <TableCell>{proveedor.nombreEmpresaProveedor}</TableCell>
                                    <TableCell>{proveedor.ruc}</TableCell>
                                    <TableCell>{proveedor.nombreContacto}</TableCell>
                                    <TableCell>
                                        {/* Contenedor para la bandera y el nombre del país */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {proveedor.pais ? (
                                                <img
                                                    src={`https://flagcdn.com/w320/${proveedor.pais.toLowerCase()}.png`}
                                                    alt={proveedor.pais}
                                                    style={{
                                                        width: '24px',
                                                        height: '16px',
                                                        borderRadius: '2px',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : null}
                                            <span>{paisesNombreCompleto[proveedor.pais] || proveedor.pais || 'Sin país'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{proveedor.telefono}</TableCell>
                                    <TableCell>{proveedor.correo}</TableCell>
                                    <TableCell>
                                        <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarProveedor(proveedor)} style={{ minWidth: 'auto', padding: '6px' }}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarProveedor(proveedor.id)} style={{ minWidth: 'auto', padding: '6px' }}><Trash2 size={18} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                </div>
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
                        error={nuevoProveedor.nombreEmpresaProveedor !== undefined && nuevoProveedor.nombreEmpresaProveedor.trim() === ''}
                        helperText={nuevoProveedor.nombreEmpresaProveedor !== undefined && nuevoProveedor.nombreEmpresaProveedor.trim() === '' ? 'Este campo es obligatorio' : ''}
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
                        error={nuevoProveedor.ruc !== undefined && nuevoProveedor.ruc.trim() === ''}
                        helperText={
                            nuevoProveedor.ruc !== undefined && nuevoProveedor.ruc.trim() === ''
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
                        error={nuevoProveedor.nombreContacto !== undefined && nuevoProveedor.nombreContacto.trim() === ''}
                        helperText={nuevoProveedor.nombreContacto !== undefined && nuevoProveedor.nombreContacto.trim() === '' ? 'Este campo es obligatorio' : ''}
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
                        error={nuevoProveedor.telefono !== undefined && nuevoProveedor.telefono.trim() === ''}
                        helperText={
                            nuevoProveedor.telefono !== undefined && nuevoProveedor.telefono.trim() === ''
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
                        error={nuevoProveedor.correo !== undefined && nuevoProveedor.correo.trim() === ''}
                        helperText={nuevoProveedor.correo !== undefined && nuevoProveedor.correo.trim() === '' ? 'Este campo es obligatorio' : ''}
                    />
                    <TextField
                        fullWidth
                        select
                        label="País"
                        name="pais"
                        value={nuevoProveedor.pais || ""}
                        onChange={(e) => {
                            console.log('País seleccionado:', e.target.value);
                            console.log('Opciones disponibles:', paises.map(p => p.code || p.cca2));
                            handleInputChange(e);
                        }}
                        disabled={paises.length === 0}
                        margin="normal"
                        required
                        error={nuevoProveedor.pais !== undefined && (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '')}
                        helperText={nuevoProveedor.pais !== undefined && (!nuevoProveedor.pais || nuevoProveedor.pais.trim() === '') ? 'Este campo es obligatorio' : ''}
                    >
                        {paises.length === 0 ? (
                            <MenuItem disabled value=""><em>Cargando países...</em></MenuItem>
                        ) : (
                            paises.map((pais, index) => {
                                // ✅ Validaciones de seguridad para evitar crashes
                                if (!pais) return null;
                                
                                const codigo = pais.code || pais.cca2 || `pais-${index}`;
                                const nombre = (typeof pais.name === 'string' ? pais.name : pais.name?.common) || 'País sin nombre';
                                
                                // Validar que tenemos datos válidos antes de renderizar
                                if (!codigo || !nombre) {
                                    console.warn('País con datos inválidos:', pais);
                                    return null;
                                }
                                
                                return (
                                    <MenuItem key={codigo} value={codigo}>
                                        {nombre}
                                    </MenuItem>
                                );
                            }).filter(Boolean) // Filtrar elementos nulos
                        )}
                    </TextField>

                    <TextField 
                        label="Dirección" 
                        name="direccion" 
                        value={nuevoProveedor.direccion} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        error={nuevoProveedor.direccion !== undefined && nuevoProveedor.direccion.trim() === ''}
                        helperText={nuevoProveedor.direccion !== undefined && nuevoProveedor.direccion.trim() === '' ? 'Este campo es obligatorio' : ''}
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
