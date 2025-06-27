// Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado e importado
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  // Table,  // Comentado si no se usa directamente aquí para las órdenes de compra
  // TableHead, // Comentado
  // TableRow, // Comentado
  // TableCell, // Comentado
  // TableBody, // Comentado
  // Pagination, // Comentado
  // Tabs, // Comentado
  // Container, // Comentado
  // Tab // Comentado
} from '@mui/material';
import {
  Package,
  Boxes,
  Warehouse
} from "lucide-react";
import ReactLoading from 'react-loading';
import { getProductosTerminados } from '../services/ProductoTerminadoService';
import { getAlmacenes } from '../services/AlmacenService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getProveedores } from '../services/ProveedorService'; // Importar servicio de proveedores

// Colores para los gráficos
const COLORS = ['#4e79a7', '#f28e2c', '#76b7b2', '#e15759', '#59a14f'];

// Estilos definidos directamente en el componente (tus estilos existentes)
const styles = {
  dashboardContainer: {
    backgroundColor: '#ffffff',
    color: '#333333',
    padding: '20px',
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se ajusta la altura para ocupar el espacio restante y se habilita el scroll
    // El cálculo asume que la barra superior (TopBar) mide 70px
    height: 'calc(100vh - 70px)',
    overflowY: 'auto',
  },
  dashboardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#2c3e50'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '20px'
  },
  tabButton: {
    padding: '10px 15px',
    background: 'none',
    border: 'none',
    color: '#95a5a6',
    cursor: 'pointer'
  },
  activeTab: {
    color: '#3498db',
    borderBottom: '2px solid #3498db'
  },
  statsContainer: {
    display: 'grid', // Usamos grid solo para las dos tarjetas superiores
    gridTemplateColumns: '1fr 1fr', // 2 columnas para las dos tarjetas
    gap: '20px', // Espacio entre las tarjetas
    marginBottom: '20px',
  },
  statCard: { // Estilo general para las tarjetas de stock bajo
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    // overflow: 'auto', // Movido a las tarjetas específicas que lo necesitan
    // maxHeight: '300px' // Movido
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  listContainer: {
    marginBottom: '20px'
  },
  listTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#2c3e50'
  },
  listEmpty: {
    textAlign: 'center',
    color: '#95a5a6',
    padding: '15px'
  },
  selectContainer: {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  almacenSelect: {
    padding: '6px',
    width: '150px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '12px'
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '20px'
  },
  chartCard: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    height: '340px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  chartTitleContainer: {
    flex: '1'
  },
  chartTitle: {
    fontSize: '18px',
    marginBottom: '5px',
    color: '#2c3e50'
  },
  chartSubtitle: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginBottom: '5px'
  },
  contentTabs: {
    display: 'flex',
    borderTop: '1px solid #e0e0e0',
    marginTop: '20px',
    paddingTop: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '300px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  modalStyleProveedor: { // Estilo para el modal de selección de proveedor
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    marginTop: '10px',
  },
  '@media (max-width: 768px)': { // Esto debe estar al final o dentro de un objeto de estilos que se procese correctamente
    statsContainer: {
      gridTemplateColumns: '1fr'
    },
    chartsContainer: {
      gridTemplateColumns: '1fr'
    }
  },
};

const cardStyles = { // Tus cardStyles existentes
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '30px',
    width: '100%',
    padding: '10px 0',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    width: '220px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #f0f0f0',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
    }
  },
  cardContent: {
    position: 'relative',
    zIndex: 2,
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  iconBackground: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '12px',
    fontSize: '12px',
  },
  cardBadge: {
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardDecoration: {
    position: 'absolute',
    right: '-10px',
    bottom: '-15px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    opacity: '0.08',
    zIndex: 1,
  }
};


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("inventario");
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [totalMateriasPrimas, setTotalMateriasPrimas] = useState(0);
  const [materiasPrimasStockBajo, setMateriasPrimasStockBajo] = useState([]);
  const [distribucionProductos, setDistribucionProductos] = useState([]);
  const [distribucionMateriasPrimas, setDistribucionMateriasPrimas] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState(null);
  const [almacenes, setAlmacenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Para la carga inicial de datos
  const [distribucionMPData, setDistribucionMPData] = useState([]);
  const [stockRealProductos, setStockRealProductos] = useState({});
  const [stockReal, setStockReal] = useState({});
  const [periodoEntradas, setPeriodoEntradas] = useState("mensual");
  const [periodoSalidas, setPeriodoSalidas] = useState("mensual");
  const [datosMovimientosEntrada, setDatosMovimientosEntrada] = useState([]);
  const [datosMovimientosSalida, setDatosMovimientosSalida] = useState([]);
  const [movimientosMP, setMovimientosMP] = useState([]);
  const [movimientosPT, setMovimientosPT] = useState([]);
  const [datosMovimientosEntradaMP, setDatosMovimientosEntradaMP] = useState([]);
  const [datosMovimientosSalidaMP, setDatosMovimientosSalidaMP] = useState([]); // No parece usarse, considerar eliminar
  const [datosMovimientosEntradaPT, setDatosMovimientosEntradaPT] = useState([]);
  const [datosMovimientosSalidaPT, setDatosMovimientosSalidaPT] = useState([]); // No parece usarse, considerar eliminar
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [productos, setProductos] = useState([]);

  // Estados para la nueva funcionalidad de automatización
  const [loadingAutomatizacion, setLoadingAutomatizacion] = useState(false); // Loading específico para la automatización
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Para el popup de feedback de automatización
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [proveedores, setProveedoresList] = useState([]); // Renombrado para evitar conflicto
  const [proveedorSeleccionadoId, setProveedorSeleccionadoId] = useState('');
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  const [itemParaAutomatizar, setItemParaAutomatizar] = useState(null); // Para guardar la materia prima o producto
  const [cantidadAPedir, setCantidadAPedir] = useState(1); // Estado para la cantidad, inicializado en 1
    const navigate = useNavigate(); // <-- AÑADE ESTA LÍNEA

 const handleGestionarCompras = () => {
        navigate('/ordenes-compra');
    };

  const calcularStock = (movimientos) => {
    const stockPorMateriaPrima = {};
    movimientos.forEach((movimiento) => {
      const { materiaPrimaId, cantidad, tipoMovimiento } = movimiento;
      if (!stockPorMateriaPrima[materiaPrimaId]) {
        stockPorMateriaPrima[materiaPrimaId] = 0;
      }
      if (tipoMovimiento === "Entrada") {
        stockPorMateriaPrima[materiaPrimaId] += cantidad;
      } else if (tipoMovimiento === "Salida") {
        stockPorMateriaPrima[materiaPrimaId] -= cantidad;
      }
    });
    console.log("Stock por materia prima: ", stockPorMateriaPrima);
    return stockPorMateriaPrima;
  };

  const calcularStockProductos = (movimientos) => {
    const stockPorProducto = {};
    movimientos.forEach((movimiento) => {
      const { productoTerminadoId, cantidad, tipoMovimiento } = movimiento;
      if (!stockPorProducto[productoTerminadoId]) {
        stockPorProducto[productoTerminadoId] = 0;
      }
      if (tipoMovimiento === "Entrada") {
        stockPorProducto[productoTerminadoId] += cantidad;
      } else if (tipoMovimiento === "Salida") {
        stockPorProducto[productoTerminadoId] -= cantidad;
      }
    });
    console.log("Stock por producto terminado: ", stockPorProducto);
    return stockPorProducto;
  };

  const agruparMovimientosPorProducto = (movimientos) => {
    const agrupados = {};
    movimientos.forEach(movimiento => {
      const productoId = movimiento.productoTerminadoId;
      const producto = productos.find(p => p.id === productoId);
      const nombreProducto = producto ? producto.nombre : `Producto ${productoId}`;
      if (!agrupados[nombreProducto]) {
        agrupados[nombreProducto] = 0;
      }
      agrupados[nombreProducto] += movimiento.cantidad;
    });
    return Object.keys(agrupados).map(nombre => ({
      name: nombre,
      cantidad: agrupados[nombre]
    }));
  };

  const filtrarPorPeriodo = (datos, periodo, fechaActual = new Date()) => {
    return datos.filter(item => {
      if (!item.fechaMovimiento) return true; // o false, dependiendo de cómo quieras manejar datos sin fecha
      const fechaMovimiento = new Date(item.fechaMovimiento);
      switch (periodo) {
        case 'semanal':
          const unaSemanaMenos = new Date(fechaActual);
          unaSemanaMenos.setDate(fechaActual.getDate() - 7);
          return fechaMovimiento >= unaSemanaMenos && fechaMovimiento <= fechaActual;
        case 'mensual':
          const unMesMenos = new Date(fechaActual);
          unMesMenos.setMonth(fechaActual.getMonth() - 1);
          return fechaMovimiento >= unMesMenos && fechaMovimiento <= fechaActual;
        case 'trimestral':
          const tresMesesMenos = new Date(fechaActual);
          tresMesesMenos.setMonth(fechaActual.getMonth() - 3);
          return fechaMovimiento >= tresMesesMenos && fechaMovimiento <= fechaActual;
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [materiasData, productosData, movimientosMPData, movimientosPTData, almacenesData, proveedoresData] = await Promise.all([
          getMateriasPrimas(),
          getProductosTerminados(),
          getMovimientosInventarioMP(),
          getMovimientosInventarioPT(),
          getAlmacenes(),
          getProveedores()
        ]);

        // CAMBIO 1: Filtrar los movimientos para incluir solo los confirmados.
        // Para Materias Primas, filtramos por 'estadoRecepcion'.
        const movimientosMPConfirmados = movimientosMPData.filter(
          mov => mov.estadoRecepcion === true
        );

        // Para Productos Terminados, filtramos por 'estadoEntrega'.
        const movimientosPTConfirmados = movimientosPTData.filter(
          mov => mov.estadoEntrega === true
        );

        setMateriasPrimas(materiasData);
        setProductos(productosData);

        // CAMBIO 2: Guardar en el estado los movimientos ya filtrados (confirmados).
        setMovimientosMP(movimientosMPConfirmados);
        setMovimientosPT(movimientosPTConfirmados);

        setAlmacenes(almacenesData);
        setProveedoresList(proveedoresData);

        setTotalProductos(productosData.length);
        setTotalMateriasPrimas(materiasData.length);

        // CAMBIO 3: Usar los movimientos confirmados para calcular el stock real.
        const stockCalculadoMP = calcularStock(movimientosMPConfirmados);
        setStockReal(stockCalculadoMP);

        const distribucionMP = Object.keys(stockCalculadoMP).map((id) => {
          const mp = materiasData.find(m => m.id === parseInt(id));
          return { name: mp ? mp.nombre : `MP ${id}`, value: stockCalculadoMP[id] };
        });
        setDistribucionMPData(distribucionMP);
        setDistribucionMateriasPrimas(distribucionMP);

        const stockBajoMP = materiasData.filter(mp => {
          const stockActual = stockCalculadoMP[mp.id] || 0;
          return stockActual < 5;
        });
        setMateriasPrimasStockBajo(stockBajoMP);

        // CAMBIO 4: Usar los movimientos confirmados para calcular el stock de productos.
        const stockCalculadoPT = calcularStockProductos(movimientosPTConfirmados);
        setStockRealProductos(stockCalculadoPT);

        const distribucionPT = Object.keys(stockCalculadoPT).map((id) => {
          const p = productosData.find(prod => prod.id === parseInt(id));
          return { name: p ? p.nombre : `PT ${id}`, value: stockCalculadoPT[id] };
        });
        setDistribucionProductos(distribucionPT);

        const stockBajoPT = productosData.filter(p => {
          const stockActual = stockCalculadoPT[p.id] || 0;
          return stockActual < 5;
        });
        setProductosStockBajo(stockBajoPT);

        if (almacenesData.length > 0) {
          setAlmacenSeleccionado(almacenesData[0].id);
        }

        // CAMBIO 5: Pasar los movimientos confirmados para procesar los gráficos de Entradas/Salidas.
        procesarDatosMovimientosGraficos(movimientosMPConfirmados, movimientosPTConfirmados, materiasData, productosData, periodoEntradas, periodoSalidas);

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Sin dependencias para que se ejecute solo una vez al montar

  const procesarDatosMovimientosGraficos = (movimientosMPData, movimientosPTData, materiasData, productosData, periodoEnt, periodoSal) => {
    const hoy = new Date();

    const movMPEntradasFiltrados = filtrarPorPeriodo(movimientosMPData.filter(m => m.tipoMovimiento === "Entrada"), periodoEnt, hoy);
    const movMPSalidasFiltrados = filtrarPorPeriodo(movimientosMPData.filter(m => m.tipoMovimiento === "Salida"), periodoSal, hoy);

    const movPTEntradasFiltrados = filtrarPorPeriodo(movimientosPTData.filter(m => m.tipoMovimiento === "Entrada"), periodoEnt, hoy);
    const movPTSalidasFiltrados = filtrarPorPeriodo(movimientosPTData.filter(m => m.tipoMovimiento === "Salida"), periodoSal, hoy);

    setDatosMovimientosEntradaMP(agruparMovimientosPorItem(movMPEntradasFiltrados, "materiaPrimaId", materiasData, true));
    // Para el gráfico combinado de entradas y salidas de MP:
    const datosCombinadosMP = prepararDatosEntradaSalida(movimientosMPData, "materiaPrimaId", materiasData, periodoEnt); // Usar el mismo periodo para E/S o diferentes según se necesite
    setDatosMovimientosEntradaMP(datosCombinadosMP);


    // Para el gráfico combinado de entradas y salidas de PT:
    const datosCombinadosPT = prepararDatosEntradaSalida(movimientosPTData, "productoTerminadoId", productosData, periodoSal);
    setDatosMovimientosEntradaPT(datosCombinadosPT);
  };


  // Función para agrupar movimientos por ítem (materia prima o producto)
  const agruparMovimientosPorItem = (movimientos, idKeyName, itemsData, soloEntradas = false, soloSalidas = false) => {
    const agrupados = {};
    movimientos.forEach(mov => {
      const itemId = mov[idKeyName];
      const item = itemsData.find(i => i.id === parseInt(itemId));
      const nombreItem = item ? item.nombre : `Item ${itemId}`;

      if (!agrupados[nombreItem]) {
        agrupados[nombreItem] = { Entradas: 0, Salidas: 0 };
      }
      if (mov.tipoMovimiento === "Entrada" && !soloSalidas) {
        agrupados[nombreItem].Entradas += mov.cantidad;
      } else if (mov.tipoMovimiento === "Salida" && !soloEntradas) {
        agrupados[nombreItem].Salidas += mov.cantidad;
      }
    });

    return Object.keys(agrupados).map(nombre => ({
      name: nombre,
      Entradas: agrupados[nombre].Entradas,
      Salidas: agrupados[nombre].Salidas
    }));
  };


  const prepararDatosEntradaSalida = (movimientos, idKeyName, itemsData, periodo) => {
    const hoy = new Date();
    const movimientosFiltrados = filtrarPorPeriodo(movimientos, periodo, hoy);
    return agruparMovimientosPorItem(movimientosFiltrados, idKeyName, itemsData);
  };


  const handleAlmacenChange = (e) => {
    setAlmacenSeleccionado(e.target.value);
  };

  const handlePeriodoEntradasChange = (e) => {
    const nuevoPeriodo = e.target.value;
    setPeriodoEntradas(nuevoPeriodo);
    procesarDatosMovimientosGraficos(movimientosMP, movimientosPT, materiasPrimas, productos, nuevoPeriodo, periodoSalidas);
  };

  const handlePeriodoSalidasChange = (e) => {
    const nuevoPeriodo = e.target.value;
    setPeriodoSalidas(nuevoPeriodo);
    procesarDatosMovimientosGraficos(movimientosMP, movimientosPT, materiasPrimas, productos, periodoEntradas, nuevoPeriodo);
  };


  // Funciones para la automatización
  const handleAbrirModalProveedor = (item) => {
    setItemParaAutomatizar(item);
    setMostrarModalProveedor(true);
  };

  const handleCerrarModalProveedor = () => {
    setMostrarModalProveedor(false);
    setProveedorSeleccionadoId('');
    setItemParaAutomatizar(null);
    setCantidadAPedir(1); // <-- Añade esta línea para resetear la cantidad

  };

  const iniciarConversacionWhatsApp = async () => {
    if (!proveedorSeleccionadoId) {
      alert("Por favor, selecciona un proveedor.");
      return;
    }

    const proveedorInfo = proveedores.find(p => p.id === proveedorSeleccionadoId);
    if (!proveedorInfo || !proveedorInfo.telefono) {
      alert("El proveedor seleccionado no tiene un número de teléfono configurado o no se encontró la información del proveedor.");
      return;
    }

    setLoadingAutomatizacion(true);
    setShowFeedbackModal(true);
    setFeedbackMessage("Iniciando solicitud de compra con el proveedor...");

    try {
      const glitchWebhookUrl = 'https://jhonsikos2.app.n8n.cloud/webhook/prueba1'; // ¡¡¡REEMPLAZA ESTO!!!

      await axios.post(glitchWebhookUrl, {
        telefonoProveedor: proveedorInfo.telefono,
        nombreProveedor: proveedorInfo.nombreEmpresaProveedor,
        materiaPrimaNombre: itemParaAutomatizar ? itemParaAutomatizar.nombre : null,
        cantidad: cantidadAPedir, // <-- Añade esta línea con la cantidad
        proveedorId: proveedorSeleccionadoId, // <-- AÑADE ESTA LÍNEA

        // materiaPrimaId: itemParaAutomatizar ? itemParaAutomatizar.id : null // Opcional
      });

      setFeedbackMessage(`Solicitud de inicio de conversación enviada a ${proveedorInfo.nombreEmpresaProveedor}. Por favor, revisa WhatsApp para continuar la negociación.`);
      // Mantener el modal de feedback abierto por un momento, luego limpiar.
      // No cerramos inmediatamente el modal de proveedor aquí, podría hacerse después del feedback.
      // setTimeout(() => {
      //   setShowFeedbackModal(false); // Opcional: cerrar el feedback automáticamente
      //   handleCerrarModalProveedor();
      // }, 5000); 

    } catch (error) {
      console.error("Error al iniciar la conversación por WhatsApp:", error.response ? error.response.data : error.message);
      setFeedbackMessage("Hubo un error al intentar iniciar la conversación. Revisa la consola e inténtalo de nuevo.");
    } finally {
      setLoadingAutomatizacion(false);
      // No cerramos el modal de proveedor aquí para que el usuario pueda ver el feedback.
      // Se podría añadir un botón "Cerrar" al modal de feedback o cerrar el modal de proveedor manualmente.
    }
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #e0e0e0',
          color: '#333',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ margin: '2px 0', color: entry.color }}>
              {`${entry.name} : ${entry.value} unidades`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', ...styles.dashboardContainer }}>
        <ReactLoading type="spin" color="#3498db" height={100} width={100} />
      </div>
    );
  }

  const productChartData = distribucionProductos.length > 0 ? distribucionProductos : [{ name: 'Sin Datos', value: 1 }];
  const materiaPrimaChartData = distribucionMateriasPrimas.length > 0 ? distribucionMateriasPrimas : [{ name: 'Sin Datos', value: 1 }];


  return (
    <div style={styles.dashboardContainer}>
      <h1 style={styles.dashboardTitle}>Dashboard de Inventario</h1>

      {/* Contadores de totales con nuevo diseño */}
      <div style={cardStyles.statsContainer}>
        {/* Tarjeta de Total Productos */}
        <div style={{ ...cardStyles.statCard, borderTop: '4px solid #3B82F6' }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{ ...cardStyles.iconBackground, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Package size={24} color="#3B82F6" />
              </div>
              <span style={{ ...cardStyles.cardBadge, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                Productos
              </span>
            </div>
            <div style={cardStyles.cardLabel}>Total Productos terminados en Catálogo</div>
            <div style={cardStyles.cardValue}>
              {totalProductos}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>tipos</span>
            </div>
            {/* <div style={cardStyles.cardFooter}> 
              Actualizaciones dinámicas si las tienes
            </div> */}
          </div>
          <div style={{ ...cardStyles.cardDecoration, backgroundColor: '#3B82F6' }}></div>
        </div>

        {/* Tarjeta de Total Materias Primas */}
        <div style={{ ...cardStyles.statCard, borderTop: '4px solid #F59E0B' }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{ ...cardStyles.iconBackground, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Boxes size={24} color="#F59E0B" />
              </div>
              <span style={{ ...cardStyles.cardBadge, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                Materiales
              </span>
            </div>
            <div style={cardStyles.cardLabel}>Total Materias Primas en Catálogo</div>
            <div style={cardStyles.cardValue}>
              {totalMateriasPrimas}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>tipos</span>
            </div>
            {/* <div style={cardStyles.cardFooter}>
              Actualizaciones dinámicas si las tienes
            </div> */}
          </div>
          <div style={{ ...cardStyles.cardDecoration, backgroundColor: '#F59E0B' }}></div>
        </div>

        {/* Tarjeta adicional de Almacenes */}
        <div style={{ ...cardStyles.statCard, borderTop: '4px solid rgb(15, 190, 94)' }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{ ...cardStyles.iconBackground, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Warehouse size={24} color='rgb(10, 192, 92)' />
              </div>
              <span style={{ ...cardStyles.cardBadge, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                Almacenes
              </span>
            </div>
            <div style={cardStyles.cardLabel}>Total Almacenes</div>
            <div style={cardStyles.cardValue}>
              {almacenes ? almacenes.length : 0}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>activos</span>
            </div>
          </div>
          <div style={{ ...cardStyles.cardDecoration, backgroundColor: '#10B981' }}></div>
        </div>

        {/* Tarjeta adicional de Proveedores (Nueva) */}
        <div style={{ ...cardStyles.statCard, borderTop: '4px solid #8B5CF6' }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{ ...cardStyles.iconBackground, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                {/* Icono de camión o similar para proveedores */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <span style={{ ...cardStyles.cardBadge, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                Proveedores
              </span>
            </div>
            <div style={cardStyles.cardLabel}>Total Proveedores</div>
            <div style={cardStyles.cardValue}>
              {proveedores ? proveedores.length : 0}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>registrados</span>
            </div>
          </div>
          <div style={{ ...cardStyles.cardDecoration, backgroundColor: '#8B5CF6' }}></div>
        </div>
      </div>


      {/* Productos y Materias Primas con stock bajo */}
      <div style={{ ...styles.statsContainer, gridTemplateColumns: '1fr 1fr' }}> {/* Asegura dos columnas */}

        <div style={{ ...styles.statCard, overflowY: 'auto', maxHeight: '300px' }}> {/* Habilitar scroll vertical */}
          <h2 style={styles.listTitle}>Productos con Stock Bajo (menos de 5 unidades)</h2>
          {productosStockBajo.length > 0 ? (
            <div>
              {productosStockBajo.map(producto => (
                <div key={producto.id} style={{
                  padding: '10px',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <div style={{ color: '#333' }}>{producto.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                      Tipo: {producto.tipo}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#e74c3c', color: 'white', borderRadius: '4px',
                    fontSize: '12px', width: '100px', height: '40px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                  }}>
                    <div>Stock: {stockRealProductos[producto.id] || 0}</div>
                  </div>
                  {/* Aquí podrías añadir un botón de automatización si aplica a productos también */}
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay productos con stock bajo.</div>
          )}
        </div>
{/* Reemplaza el div anterior por este bloque completo */}
<div style={{ ...styles.statCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
    
    {/* Contenedor para el título y la lista */}
    <div>
        <h2 style={styles.listTitle}>Materias Primas con Stock Bajo (menos de 5 unidades)</h2>
        <div style={{ maxHeight: '180px', overflowY: 'auto' }}> {/* Contenedor de la lista con scroll */}
            {materiasPrimasStockBajo.length > 0 ? (
                <div>
                    {materiasPrimasStockBajo.map(materia => (
                        <div key={materia.id} style={{
                            padding: '10px',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ flex: 1, marginRight: '10px' }}>
                                <div style={{ color: '#333' }}>{materia.nombre}</div>
                                <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                                    Unidad: {materia.unidad}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{
                                    backgroundColor: '#e74c3c', color: 'white', borderRadius: '4px',
                                    fontSize: '12px', width: '100px', height: '40px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <div>Stock: {stockReal[materia.id] || 0}</div>
                                </div>
                                {/* 
                                <button
                                    style={{
                                        backgroundColor: '#3498db', color: 'white', borderRadius: '4px',
                                        fontSize: '12px', cursor: 'pointer', border: 'none',
                                        width: '100px', height: '40px',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    }}
                                    onClick={() => handleAbrirModalProveedor(materia)}
                                >
                                    Automatizar compra
                                </button>*/}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.listEmpty}>No hay materias primas con stock bajo.</div>
            )}
        </div>
    </div>

    {/* Contenedor para el nuevo botón */}
    <div style={{ marginTop: '15px', alignSelf: 'flex-end' }}>
        <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleGestionarCompras}
        >
            Gestionar compras
        </Button>
    </div>
</div>


      </div>


      {/* Modal para seleccionar proveedor */}
      <Modal open={mostrarModalProveedor} onClose={handleCerrarModalProveedor}>
        {/* Este Box es el contenedor principal del contenido del modal */}
        <Box sx={{
          // Estilos básicos para la apariencia del modal (puedes ajustarlos)
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto', // O un ancho fijo como 400, 500, etc.
          maxWidth: '90vw', // Para evitar que sea demasiado ancho en pantallas pequeñas
          bgcolor: 'background.paper',
          border: '2px solid #000', // O usa la elevación/sombra de MUI
          boxShadow: 24,
          p: 4, // Padding interno

          // --- Estilos para centrar el contenido ---
          display: 'flex',          // Habilita Flexbox
          flexDirection: 'column',  // Apila los elementos verticalmente
          alignItems: 'center',     // Centra los elementos horizontalmente
          textAlign: 'center',      // Centra el texto dentro de los elementos (como el h2)
        }}>
          {/* Encabezado */}
          <h2 style={{ marginTop: 0, marginBottom: '20px', width: '100%' }}> {/* Asegura que el h2 ocupe el ancho para centrar texto */}
            Seleccionar Proveedor para {itemParaAutomatizar?.nombre}
          </h2>

          {/* Selector de Proveedor */}
          <TextField
            select
            label="Proveedor"
            value={proveedorSeleccionadoId}
            onChange={(e) => setProveedorSeleccionadoId(e.target.value)}
            // fullWidth // Considera quitar fullWidth o ajustar el ancho del Box padre
            margin="normal"
            variant="outlined"
            sx={{ width: '80%', mb: 3 }} // Ajusta el ancho como necesites para el centrado visual
          >
            <MenuItem value="" disabled>
              <em>-- Selecciona un proveedor --</em>
            </MenuItem>
            {proveedores.map((proveedor) => (
              <MenuItem key={proveedor.id} value={proveedor.id}>
                {proveedor.nombreEmpresaProveedor} (Tel: {proveedor.telefono || 'N/A'})
              </MenuItem>
            ))}
          </TextField>
          {/* --- DENTRO DEL MODAL --- */}
          {/* ... (después del TextField del Proveedor) ... */}

          {/* Selector de Cantidad (NUEVO) */}
          <TextField
            label="Cantidad a Pedir"
            type="number" // Para que sea un campo numérico
            value={cantidadAPedir}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setCantidadAPedir(value > 0 ? value : 1); // Asegura que sea al menos 1
            }}
            InputProps={{ inputProps: { min: 1 } }} // Atributo HTML para mínimo 1
            variant="outlined"
            margin="normal"
            sx={{ width: '80%', mb: 3 }} // Estilo similar al selector de proveedor
          />

          {/* ... (antes del Box de los botones Cancelar/Iniciar) ... */}
          {/* --- FIN DE LA MODIFICACIÓN DENTRO DEL MODAL --- */}
          {/* Contenedor de Botones */}
          {/* Ajustado para centrar los botones dentro de este Box */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}>
            <Button onClick={handleCerrarModalProveedor} variant="outlined" color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={iniciarConversacionWhatsApp}
              variant="contained"
              color="primary"
              disabled={!proveedorSeleccionadoId || loadingAutomatizacion}
            >
              {loadingAutomatizacion ? 'Iniciando...' : 'Iniciar Conversación'}
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Modal de feedback de la automatización */}
      {showFeedbackModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {loadingAutomatizacion ? (
              <div style={styles.loadingContainer}>
                <p>{feedbackMessage || "Procesando..."}</p>
                <ReactLoading type="spin" color="#3498db" height={50} width={50} />
              </div>
            ) : (
              <div>
                <p>{feedbackMessage}</p>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    // Opcionalmente, cerrar también el modal de selección de proveedor si aún está abierto
                    if (mostrarModalProveedor) {
                      handleCerrarModalProveedor();
                    }
                  }}
                  sx={{ mt: 2 }}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Tabs de Inventario y Movimientos */}
      <div style={styles.contentTabs}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === "inventario" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("inventario")}
        >
          Inventario Actual
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === "movimientos" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("movimientos")}
        >
          Movimientos
        </button>
        {/* Tabs de Inventario y Movimientos 

        <button
          style={{ ...styles.tabButton, ...(activeTab === "predicciones" ? styles.activeTab : {}) }}
          onClick={() => setActiveTab("predicciones")}
        >
          Predicciones
        </button>
        */}
      </div>

      {/* Contenido del tab Inventario */}
      {activeTab === "inventario" && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Distribución de Productos Terminados</h2>
                <div style={styles.chartSubtitle}>Stock actual por tipo</div>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50', fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar name="Cantidad" dataKey="value" >
                    {productChartData.map((entry, index) => (
                      <Cell key={`cell-pt-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Distribución de Materias Primas</h2>
                <div style={styles.chartSubtitle}>Stock actual por tipo</div>
              </div>
              {/* Selector de Almacén (si aplica a este gráfico) */}
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materiaPrimaChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50', fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar name="Cantidad" dataKey="value" >
                    {materiaPrimaChartData.map((entry, index) => (
                      <Cell key={`cell-mp-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del tab Movimientos */}
      {activeTab === "movimientos" && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Entradas y Salidas - Productos Terminados</h2>
                <div style={styles.chartSubtitle}>Movimientos por producto</div>
              </div>
              <div style={{ width: '150px' }}>
                <select value={periodoSalidas} onChange={handlePeriodoSalidasChange} style={styles.almacenSelect}>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosMovimientosEntradaPT} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50', fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar name="Entradas" dataKey="Entradas" fill="#6489fa" />
                  <Bar name="Salidas" dataKey="Salidas" fill="#fa7864" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Entradas y Salidas - Materias Primas</h2>
                <div style={styles.chartSubtitle}>Movimientos por material</div>
              </div>
              <div style={{ width: '150px' }}>
                <select value={periodoEntradas} onChange={handlePeriodoEntradasChange} style={styles.almacenSelect}>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosMovimientosEntradaMP} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50', fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar name="Entradas" dataKey="Entradas" fill="#6489fa" />
                  <Bar name="Salidas" dataKey="Salidas" fill="#fa7864" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del tab Predicciones */}
      {activeTab === "predicciones" && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Predicción de Demanda</h2>
                <div style={styles.chartSubtitle}>Proyección para los próximos 30 días</div>
              </div>
            </div>
            <div style={styles.listEmpty}>
              La funcionalidad de predicciones se implementará próximamente.
            </div>
          </div>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Alertas de Reabastecimiento</h2>
                <div style={styles.chartSubtitle}>Productos que necesitarán reabastecimiento</div>
              </div>
            </div>
            <div style={styles.listEmpty}>
              La funcionalidad de alertas de reabastecimiento se implementará próximamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;