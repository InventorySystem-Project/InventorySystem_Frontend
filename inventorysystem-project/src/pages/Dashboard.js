
// Dashboard.js
import React, { useState, useEffect } from 'react';
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Tabs,
  Container,
  Tab
} from '@mui/material';
import {
  Package,
  Boxes
} from "lucide-react";
import ReactLoading from 'react-loading';
import { getProductosTerminados, addProductoTerminadoTerminado, updateProductoTerminadoTerminado, deleteProductoTerminadoTerminado } from '../services/ProductoTerminadoService';
import { getAlmacenes, addAlmacen, updateAlmacen, deleteAlmacen } from '../services/AlmacenService';
import { getMateriasPrimas, addMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from '../services/MateriaPrimaService';
import { getMovimientosInventarioMP, addMovimientoInventarioMP, updateMovimientoInventarioMP, deleteMovimientoInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
// Colores para los gráficos
const COLORS = ['#4e79a7', '#f28e2c', '#76b7b2', '#e15759', '#59a14f'];


// Estilos definidos directamente en el componente
const styles = {
  dashboardContainer: {
    backgroundColor: '#ffffff',
    color: '#333333',
    padding: '20px',
    minHeight: '100vh',
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
    display: 'flex',
    justifyContent: 'center', // Centra las tarjetas horizontalmente
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statLabel: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50'
  }, statsContainer: {
    display: 'grid',  // Usamos grid solo para las dos tarjetas superiores
    gridTemplateColumns: '1fr 1fr', // 2 columnas para las dos tarjetas
    gap: '20px',  // Espacio entre las tarjetas
    marginBottom: '20px',
  },
  statCardTop: {  // Estilo para las tarjetas de arriba (2 tarjetas)
    backgroundColor: 'white',
    padding: '10px 15px',   // Menos padding
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    maxWidth: '200px',     // Limita el ancho máximo de cada tarjeta
    width: '100%',         // Ocupa el 100% del espacio disponible dentro del contenedor
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',  // Borde azul de 2px
    borderColor: "lightgray",  // Color del borde
  },
  statLabelTop: {
    fontSize: '14px',
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statValueTop: {
    fontSize: '20px',  // Fuente más grande
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  }, statsWrapper: {
    display: 'flex',
    justifyContent: 'center', // Centra las dos tarjetas superiores
    alignItems: 'center',      // Centra las tarjetas verticalmente
    gap: '20px',
    marginBottom: '20px',
    // Esto asegura que las tarjetas estén centradas en la pantalla
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
  // Estilos para pantallas pequeñas
  '@media (max-width: 768px)': {
    statsContainer: {
      gridTemplateColumns: '1fr'
    },
    chartsContainer: {
      gridTemplateColumns: '1fr'
    }
  },
  loader: {
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 2s linear infinite'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  // Estilo del fondo opaco (overlay)
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Fondo oscuro semitransparente
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,  // Asegura que el modal esté sobre el contenido principal
  },
  // Estilo del contenedor del popup/modal
  modalContainer: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '300px',  // Ajusta el ancho según el diseño
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',

  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',  // Coloca el texto y el spinner en columna
    justifyContent: 'center',
    alignItems: 'center', // Centra el contenido
    gap: '10px', // Espacio entre el texto y el spinner
  },
  cancelButton: {
    backgroundColor: '#e74c3c', // Rojo para destacar
    color: 'white',
    padding: '8px 15px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    marginTop: '10px',  // Espacio entre el spinner y el botón
  },
};
{/* Estilos para las tarjetas mejoradas */ }
const cardStyles = {
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
  const [isLoading, setIsLoading] = useState(true);
  const [distribucionMPData, setDistribucionMPData] = useState([]);
  const [stockRealProductos, setStockRealProductos] = useState({});
  const [stockReal, setStockReal] = useState({});

  // Nuevos estados para la funcionalidad de movimientos
  const [periodoEntradas, setPeriodoEntradas] = useState("mensual");
  const [periodoSalidas, setPeriodoSalidas] = useState("mensual");
  const [datosMovimientosEntrada, setDatosMovimientosEntrada] = useState([]);
  const [datosMovimientosSalida, setDatosMovimientosSalida] = useState([]);
  const [movimientosMP, setMovimientosMP] = useState([]);
  const [movimientosPT, setMovimientosPT] = useState([]);

  // Añade estos nuevos estados
  const [datosMovimientosEntradaMP, setDatosMovimientosEntradaMP] = useState([]);
  const [datosMovimientosSalidaMP, setDatosMovimientosSalidaMP] = useState([]);
  const [datosMovimientosEntradaPT, setDatosMovimientosEntradaPT] = useState([]);
  const [datosMovimientosSalidaPT, setDatosMovimientosSalidaPT] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [productos, setProductos] = useState([]);

  const [loading, setLoading] = useState(false);  // Estado para el círculo de carga
  const [showForm, setShowForm] = useState(false); // Estado para mostrar el formulario

  const iniciarAutomatizacion = (nombre) => {
    setLoading(true);
    setShowForm(true);

    // Simulando un proceso de automatización
    setTimeout(() => {
      setLoading(false);
      //alert(`Iniciando automatización para ${nombre}`);
      setShowForm(false); // Cierra el popup después de 3 segundos
    }, 3000);  // Simulación de 3 segundos de automatización
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

  // Función para agrupar movimientos por producto
  const agruparMovimientosPorProducto = (movimientos) => {
    const agrupados = {};

    movimientos.forEach(movimiento => {
      const productoId = movimiento.productoTerminadoId;
      // Buscar el nombre del producto usando su ID
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



  // Función para filtrar datos por periodo
  const filtrarPorPeriodo = (datos, periodo, fechaActual = new Date()) => {
    return datos.filter(item => {
      if (!item.fechaMovimiento) return true;

      const fechaMovimiento = new Date(item.fechaMovimiento);

      switch (periodo) {
        case 'semanal':
          // Últimos 7 días
          const unaSemanaMenos = new Date(fechaActual);
          unaSemanaMenos.setDate(fechaActual.getDate() - 7);
          return fechaMovimiento >= unaSemanaMenos;

        case 'mensual':
          // Último mes
          const unMesMenos = new Date(fechaActual);
          unMesMenos.setMonth(fechaActual.getMonth() - 1);
          return fechaMovimiento >= unMesMenos;

        case 'trimestral':
          // Últimos 3 meses
          const tresMesesMenos = new Date(fechaActual);
          tresMesesMenos.setMonth(fechaActual.getMonth() - 3);
          return fechaMovimiento >= tresMesesMenos;

        default:
          return true;
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Obtener los productos y las materias primas
        const materiasData = await getMateriasPrimas();
        const productosData = await getProductosTerminados();
        console.log('Productos:', productosData); // Verifica que productosData tenga el nombre
        console.log('Materias Primas:', materiasData); // Verifica que materiasData tenga el nombre

        // Guardar los productos y materias primas
        setTotalProductos(productosData.length);
        setTotalMateriasPrimas(materiasData.length);
        setMateriasPrimas(materiasData);
        setProductos(productosData);

        // Obtener los movimientos de inventario de materias primas
        const movimientosMPData = await getMovimientosInventarioMP();
        setMovimientosMP(movimientosMPData);

        // Calcular el stock real de materias primas en base a los movimientos
        const stockCalculado = calcularStock(movimientosMPData);
        setStockReal(stockCalculado);

        // Crear datos para el gráfico de distribución de materias primas
        const distribucionMPData = Object.keys(stockCalculado).map((materiaPrimaId) => {
          // Buscar el nombre de la materia prima usando su ID
          const materiaPrima = materiasData.find(mp => mp.id === parseInt(materiaPrimaId));
          return {
            name: materiaPrima ? materiaPrima.nombre : `Materia Prima ${materiaPrimaId}`,
            value: stockCalculado[materiaPrimaId]
          };
        });
        console.log("Distribución de materias primas:", distribucionMPData);
        setDistribucionMPData(distribucionMPData);

        // Obtener los movimientos de inventario de productos terminados
        const movimientosPTData = await getMovimientosInventarioPT();
        setMovimientosPT(movimientosPTData);

        // Calcular el stock real de productos en base a los movimientos
        const stockCalculadoPT = calcularStockProductos(movimientosPTData);
        setStockRealProductos(stockCalculadoPT);

        // Crear datos para el gráfico de distribución de productos
        const distribucionProductosData = Object.keys(stockCalculadoPT).map((productoId) => {
          // Buscar el nombre del producto usando su ID
          const producto = productosData.find(p => p.id === parseInt(productoId));
          return {
            name: producto ? producto.nombre : `Producto ${productoId}`,
            value: stockCalculadoPT[productoId]
          };
        });
        console.log("Distribución de productos terminados:", distribucionProductosData);
        setDistribucionProductos(distribucionProductosData);

        // Filtrar productos con stock bajo basado en el stock calculado
        const stockBajo = productosData.filter(p => {
          const stockActual = stockCalculadoPT[p.id] || 0;
          return stockActual < 5;
        });
        setProductosStockBajo(stockBajo);

        // Filtrar materias primas con stock bajo basado en el stock calculado
        const materiasBajo = materiasData.filter(mp => {
          const stockActual = stockCalculado[mp.id] || 0;
          return stockActual < 5;
        });
        setMateriasPrimasStockBajo(materiasBajo);

        // Obtener almacenes
        const almacenesData = await getAlmacenes();
        setAlmacenes(almacenesData);
        if (almacenesData.length > 0) {
          setAlmacenSeleccionado(almacenesData[0].id);
        }

        // Procesar datos para los gráficos de movimientos
        // Aquí pasamos `productosData` y `materiasData` a la función `agruparMovimientosPorItem`
        const datosMateriasPrimas = agruparMovimientosPorItem(movimientosMPData, "materiaPrimaId", productosData, materiasData);
        const datosProductos = agruparMovimientosPorItem(movimientosPTData, "productoTerminadoId", productosData, materiasData);

        setDatosMovimientosEntradaMP(datosMateriasPrimas);
        setDatosMovimientosEntradaPT(datosProductos);

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);



  // Añade esta función a tu componente
  const prepararDatosEntradaSalida = (movimientos, idKeyName, itemsData) => {
    // Agrupar entradas y salidas
    const entradas = {};
    const salidas = {};

    // Procesar movimientos
    movimientos.forEach(mov => {
      const itemId = mov[idKeyName];
      // Buscar el nombre del ítem
      const item = itemsData.find(i => i.id === parseInt(itemId));
      const nombreItem = item ? item.nombre : `Item ${itemId}`;

      if (mov.tipoMovimiento === "Entrada") {
        entradas[nombreItem] = (entradas[nombreItem] || 0) + mov.cantidad;
      } else if (mov.tipoMovimiento === "Salida") {
        salidas[nombreItem] = (salidas[nombreItem] || 0) + mov.cantidad;
      }
    });

    // Combinar datos para el gráfico
    const datosFormateados = Object.keys({ ...entradas, ...salidas }).map(nombre => ({
      name: nombre,
      Entradas: entradas[nombre] || 0,
      Salidas: salidas[nombre] || 0
    }));

    return datosFormateados;
  };

  // Función para procesar los datos de movimientos
  // Primero, modifica la función para procesar los datos de movimientos
  // Reemplaza tu función procesarDatosMovimientos con esta
  const procesarDatosMovimientos = (movimientosMPData, movimientosPTData) => {
    try {
      // Filtrar por periodo actual
      const movimientosMPFiltrados = filtrarPorPeriodo(movimientosMPData, periodoEntradas);
      const movimientosPTFiltrados = filtrarPorPeriodo(movimientosPTData, periodoSalidas);

      // Procesar datos de materias primas
      const datosMateriasPrimas = agruparMovimientosPorItem(movimientosMPFiltrados, "materiaPrimaId");
      setDatosMovimientosEntradaMP(datosMateriasPrimas);

      // Procesar datos de productos terminados
      const datosProductos = agruparMovimientosPorItem(movimientosPTFiltrados, "productoTerminadoId");
      setDatosMovimientosEntradaPT(datosProductos);

    } catch (error) {
      console.error("Error al procesar datos de movimientos:", error);
    }
  };

  // Nueva función para agrupar movimientos por ítem específico
  const agruparMovimientosPorItem = (movimientos, idKey, productosData, materiasPrimas) => {
    const agrupados = {};

    movimientos.forEach(movimiento => {
      let itemId, itemName;

      // Si el idKey es "materiaPrimaId", buscamos el nombre en materiasPrimas
      if (idKey === "materiaPrimaId") {
        itemId = movimiento[idKey];
        const materiaPrima = materiasPrimas.find(mp => mp.id === parseInt(itemId));
        itemName = materiaPrima ? materiaPrima.nombre : `Materia Prima ${itemId}`;
      } else if (idKey === "productoTerminadoId") {  // Si el idKey es "productoTerminadoId", buscamos en productosData
        itemId = movimiento[idKey];
        const producto = productosData.find(p => p.id === parseInt(itemId));
        itemName = producto ? producto.nombre : `Producto ${itemId}`;
      }

      // Si no existe el ítem, lo inicializamos
      if (!agrupados[itemName]) {
        agrupados[itemName] = {
          Entradas: 0,
          Salidas: 0
        };
      }

      // Sumar la cantidad dependiendo del tipo de movimiento
      if (movimiento.tipoMovimiento === "Entrada") {
        agrupados[itemName].Entradas += movimiento.cantidad;
      } else if (movimiento.tipoMovimiento === "Salida") {
        agrupados[itemName].Salidas += movimiento.cantidad;
      }
    });

    // Convertir el objeto agrupado en formato para gráfico
    return Object.keys(agrupados).map(name => ({
      name,
      Entradas: agrupados[name].Entradas,
      Salidas: agrupados[name].Salidas
    }));
  };




  // Función para obtener el nombre del ítem
  const getItemName = (id, idKey) => {
    const parsedId = parseInt(id);
    console.log(`Buscando ${idKey} con ID: ${id} (parsed: ${parsedId})`);

    if (idKey === "materiaPrimaId") {
      console.log("Materias primas disponibles:", materiasPrimas);
      const materiaPrima = materiasPrimas.find(mp => mp.id === parsedId);
      console.log("Materia prima encontrada:", materiaPrima);
      return materiaPrima ? materiaPrima.nombre : `Materia Prima ${id}`;
    } else {
      console.log("Productos disponibles:", productos);
      const producto = productos.find(p => p.id === parsedId);
      console.log("Producto encontrado:", producto);
      return producto ? producto.nombre : `Productoxd ${id}`;
    }
  };

  const handleAlmacenChange = (e) => {
    setAlmacenSeleccionado(e.target.value);
  };

  const handlePeriodoEntradasChange = (e) => {
    const nuevoPeriodo = e.target.value;
    setPeriodoEntradas(nuevoPeriodo);

    // Obtener los movimientos de entrada y filtrarlos por el nuevo periodo
    const entradasMP = movimientosMP.filter(m => m.tipoMovimiento === "Entrada");
    const entradasPT = movimientosPT.filter(m => m.tipoMovimiento === "Entrada");

    const entradasFiltradas = filtrarPorPeriodo([...entradasMP, ...entradasPT], nuevoPeriodo);
    const datosAgrupados = agruparMovimientosPorProducto(entradasFiltradas);

    setDatosMovimientosEntrada(datosAgrupados);
  };

  const handlePeriodoSalidasChange = (e) => {
    const nuevoPeriodo = e.target.value;
    setPeriodoSalidas(nuevoPeriodo);

    // Obtener los movimientos de salida y filtrarlos por el nuevo periodo
    const salidasMP = movimientosMP.filter(m => m.tipoMovimiento === "Salida");
    const salidasPT = movimientosPT.filter(m => m.tipoMovimiento === "Salida");

    const salidasFiltradas = filtrarPorPeriodo([...salidasMP, ...salidasPT], nuevoPeriodo);
    const datosAgrupados = agruparMovimientosPorProducto(salidasFiltradas);

    setDatosMovimientosSalida(datosAgrupados);
  };

  // Datos de ejemplo para el gráfico de pie (distribución de productos)
  const productChartData = distribucionProductos.length > 0 ? distribucionProductos : [];

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
          <p>{`${label || payload[0].name} : ${payload[0].value} unidades`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.dashboardContainer}>
      <h1 style={styles.dashboardTitle}>Dashboard de Inventario</h1>

      {/* Contadores de totales con nuevo diseño */}
      <div style={cardStyles.statsContainer}>
        {/* Tarjeta de Total Productos */}
        <div style={{
          ...cardStyles.statCard,
          borderTop: '4px solid #3B82F6',
        }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{
                ...cardStyles.iconBackground,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              }}>
                <Package size={24} color="#3B82F6" />
              </div>
              <span style={{
                ...cardStyles.cardBadge,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
              }}>
                Productos
              </span>
            </div>

            <div style={cardStyles.cardLabel}>Total Productos</div>
            <div style={cardStyles.cardValue}>
              {totalProductos}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>unidades</span>
            </div>

            <div style={cardStyles.cardFooter}>
              <span style={{
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                5%
              </span>
              vs. mes anterior
            </div>
          </div>
          <div style={{
            ...cardStyles.cardDecoration,
            backgroundColor: '#3B82F6',
          }}></div>
        </div>

        {/* Tarjeta de Total Materias Primas */}
        <div style={{
          ...cardStyles.statCard,
          borderTop: '4px solid #F59E0B',
        }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{
                ...cardStyles.iconBackground,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
              }}>
                <Boxes size={24} color="#F59E0B" />
              </div>
              <span style={{
                ...cardStyles.cardBadge,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#F59E0B',
              }}>
                Materiales
              </span>
            </div>

            <div style={cardStyles.cardLabel}>Total Materias Primas</div>
            <div style={cardStyles.cardValue}>
              {totalMateriasPrimas}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>unidades</span>
            </div>

            <div style={cardStyles.cardFooter}>
              <span style={{
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L7 17M7 17H16M7 17V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                3%
              </span>
              vs. mes anterior
            </div>
          </div>
          <div style={{
            ...cardStyles.cardDecoration,
            backgroundColor: '#F59E0B',
          }}></div>
        </div>

        {/* Tarjeta adicional de Almacenes */}
        <div style={{
          ...cardStyles.statCard,
          borderTop: '4px solid #10B981',
        }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{
                ...cardStyles.iconBackground,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 9H21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 21V9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{
                ...cardStyles.cardBadge,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
              }}>
                Bodegas
              </span>
            </div>

            <div style={cardStyles.cardLabel}>Total Almacenes</div>
            <div style={cardStyles.cardValue}>
              {almacenes ? almacenes.length : 0}
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>activos</span>
            </div>

            <div style={cardStyles.cardFooter}>
              <span style={{
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                2%
              </span>
              Capacidad usada
            </div>
          </div>
          <div style={{
            ...cardStyles.cardDecoration,
            backgroundColor: '#10B981',
          }}></div>
        </div>

        {/* Tarjeta adicional de Valor del Inventario */}
        <div style={{
          ...cardStyles.statCard,
          borderTop: '4px solid #8B5CF6',
        }}>
          <div style={cardStyles.cardContent}>
            <div style={cardStyles.iconContainer}>
              <div style={{
                ...cardStyles.iconBackground,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1V23" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{
                ...cardStyles.cardBadge,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8B5CF6',
              }}>
                Valor
              </span>
            </div>

            <div style={cardStyles.cardLabel}>Valor del Inventario</div>
            <div style={cardStyles.cardValue}>
              $45,890
              <span style={{ fontSize: '16px', color: '#6B7280', marginLeft: '5px' }}>USD</span>
            </div>

            <div style={cardStyles.cardFooter}>
              <span style={{
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                8.2%
              </span>
              vs. mes anterior
            </div>
          </div>
          <div style={{
            ...cardStyles.cardDecoration,
            backgroundColor: '#8B5CF6',
          }}></div>
        </div>
      </div>
      {/* Productos y Materias Primas con stock bajo */}
      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, overflow: 'auto', maxHeight: '300px' }}>
          <h2 style={styles.listTitle}>Productos con Stock Bajo</h2>
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
                      Categoría: {producto.tipo}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      width: '100px',
                      height: '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <div>Stock: {stockRealProductos[producto.id] || 0}</div>
                    </div>
                    {/* Botón de automatización */}
                    <button
                      style={{
                        backgroundColor: '#3498db', // Azul
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        width: '100px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onClick={() => iniciarAutomatizacion(producto.nombre)} // Llamada a iniciar automatización
                    >
                      Iniciar Automatización
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay productos con stock bajo</div>
          )}
        </div>

        <div style={{ ...styles.statCard, overflow: 'auto', maxHeight: '300px' }}>
          <h2 style={styles.listTitle}>Materias Primas con Stock Bajo</h2>
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      width: '100px',
                      height: '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <div>Stock: {stockReal[materia.id] || 0}</div>
                    </div>
                    {/* Botón de automatización */}
                    <button
                      style={{
                        backgroundColor: '#3498db', // Azul
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        width: '100px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onClick={() => iniciarAutomatizacion(materia.nombre)} // Llamada a iniciar automatización
                    >
                      Iniciar Automatización
                    </button>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay materias primas con stock bajo</div>
          )}
        </div>
      </div>

      {/* Mostrar el formulario cuando showForm sea verdadero */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <p>Iniciando automatización de Orden de compra...</p>
                <ReactLoading type="spin" color="#3498db" height={50} width={50} />
                {/* Botón de cancelar */}
                <button
                  style={styles.cancelButton}
                  onClick={() => {
                    setLoading(false);
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <p>La automatización fue completada exitosamente.</p>
              </div>
            )}
          </div>
        </div>
      )}








      {/* Tabs de Inventario y Movimientos (Movido abajo) */}
      <div style={styles.contentTabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "inventario" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("inventario")}
        >
          Inventario
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "movimientos" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("movimientos")}
        >
          Movimientos
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "predicciones" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("predicciones")}
        >
          Predicciones
        </button>
      </div>

      {/* Contenido del tab Inventario */}
      {activeTab === "inventario" && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Distribución de Productos</h2>
                <div style={styles.chartSubtitle}>Stock actual por tipo de billetera</div>
              </div>
              <div style={{ width: '150px' }}>
                <select
                  value={almacenSeleccionado || ''}
                  onChange={handleAlmacenChange}
                  style={styles.almacenSelect}
                >
                  {almacenes.map(almacen => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#2c90e5"
                    dataKey="value"
                  >
                    {productChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {distribucionMPData && distribucionMPData.length > 0 ? (
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <div style={styles.chartTitleContainer}>
                  <h2 style={styles.chartTitle}>Distribución de Materias Primas</h2>
                  <div style={styles.chartSubtitle}>Stock actual por tipo de material</div>
                </div>
                <div style={{ width: '150px' }}>
                  <select
                    value={almacenSeleccionado || ''}
                    onChange={handleAlmacenChange}
                    style={styles.almacenSelect}
                  >
                    {almacenes.map(almacen => (
                      <option key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distribucionMPData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                    <XAxis dataKey="name" tick={{ fill: '#2c3e50' }} />
                    <YAxis tick={{ fill: '#2c3e50' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} />
                    <ReferenceLine y={0} stroke="#000" />
                    <Bar name="Cantidad" dataKey="value" fill="#ff6347" /> {/* Color rojo tomate para las barras */}
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay datos disponibles para mostrar.</div>
          )}

        </div>
      )}

      {/* Contenido del tab Movimientos */}
      {activeTab === "movimientos" && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Entradas y Salidas - Productos Terminados</h2>
                <div style={styles.chartSubtitle}>Movimientos por producto terminado</div>
              </div>
              <div style={{ width: '150px' }}>
                <select
                  value={periodoSalidas}
                  onChange={handlePeriodoSalidasChange}
                  style={styles.almacenSelect}
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosMovimientosEntradaPT}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50' }} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip />
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
                <div style={styles.chartSubtitle}>Movimientos por materia prima</div>
              </div>
              <div style={{ width: '150px' }}>
                <select
                  value={periodoEntradas}
                  onChange={handlePeriodoEntradasChange}
                  style={styles.almacenSelect}
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosMovimientosEntradaMP}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" />
                  <XAxis dataKey="name" tick={{ fill: '#2c3e50' }} />
                  <YAxis tick={{ fill: '#2c3e50' }} />
                  <Tooltip />
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
                <div style={styles.chartSubtitle}>Proyección de ventas para los próximos 30 días</div>
              </div>
              <div style={{ width: '150px' }}>
                <select
                  value={almacenSeleccionado || ''}
                  onChange={handleAlmacenChange}
                  style={styles.almacenSelect}
                >
                  {almacenes.map(almacen => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
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
                <div style={styles.chartSubtitle}>Productos que necesitarán reabastecimiento pronto</div>
              </div>
              <div style={{ width: '150px' }}>
                <select
                  value={almacenSeleccionado || ''}
                  onChange={handleAlmacenChange}
                  style={styles.almacenSelect}
                >
                  {almacenes.map(almacen => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
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