// Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { getProductos, addProducto, updateProducto, deleteProducto } from '../services/ProductoService';
import { getAlmacenes, addAlmacen, updateAlmacen, deleteAlmacen } from '../services/AlmacenService';
import { getMateriasPrimas, addMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from '../services/MateriaPrimaService';
import { getMovimientosInventarioMP, addMovimientoInventarioMP, updateMovimientoInventarioMP, deleteMovimientoInventarioMP } from '../services/MovimientoInventarioMPService';

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


  const [stockReal, setStockReal] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
  
        // Obtener las materias primas
        const materiasData = await getMateriasPrimas();
  
        // Obtener los movimientos de inventario
        const movimientosData = await getMovimientosInventarioMP();
  
        // Calcular el stock real en base a los movimientos
        const stockCalculado = calcularStock(movimientosData);
        setStockReal(stockCalculado);  // Actualiza el estado con el stock calculado
  
        // Crear datos para el gráfico de distribución de materias primas
        const distribucionMPData = Object.keys(stockCalculado).map((materiaPrimaId) => {
          // Buscar el nombre de la materia prima usando su ID
          const materiaPrima = materiasData.find(mp => mp.id === parseInt(materiaPrimaId));
  
          return {
            name: materiaPrima ? materiaPrima.nombre : `Materia Prima ${materiaPrimaId}`,  // Usamos el nombre en vez del ID
            value: stockCalculado[materiaPrimaId]
          };
        });
  
        console.log("Distribución de materias primas:", distribucionMPData);
        setDistribucionMPData(distribucionMPData);  // Actualiza el estado de distribucionMPData
  
        // Obtener otros datos de productos y almacenes
        const productosData = await getProductos();
        setTotalProductos(productosData.length);
  
setTotalMateriasPrimas(materiasData.length)

        // Filtrar productos con stock bajo
        const stockBajo = productosData.filter(p => p.stock < 5);
        setProductosStockBajo(stockBajo);
  
        // Crear datos para gráfico de distribución de productos
        const categoriasCounts = productosData.reduce((acc, producto) => {
          acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
          return acc;
        }, {});
  
        const distribucionData = Object.keys(categoriasCounts).map(categoria => ({
          name: categoria,
          value: categoriasCounts[categoria],
        }));
  
        setDistribucionProductos(distribucionData);
  
        // Obtener almacenes
        const almacenesData = await getAlmacenes();
        setAlmacenes(almacenesData);
        if (almacenesData.length > 0) {
          setAlmacenSeleccionado(almacenesData[0].id);
        }
  
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);
  


  const handleAlmacenChange = (e) => {
    setAlmacenSeleccionado(e.target.value);
  };

  // Datos de ejemplo para el gráfico de pie (distribución de productos)
  const productChartData = distribucionProductos.length > 0 ? distribucionProductos : [
    { name: 'Classic', value: 40 },
    { name: 'Sport', value: 23 },
    { name: 'Premium', value: 13 },
    { name: 'Slim', value: 5 },
    { name: 'Eco', value: 19 },
  ];

  // Datos de ejemplo para el gráfico de barras (distribución de materias primas)


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
          <p>{`${label || payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.dashboardContainer}>
      <h1 style={styles.dashboardTitle}>Dashboard de Inventario</h1>

      {/* Contadores de totales */}
      <div style={styles.statsWrapper}> {/* Contenedor para las tarjetas centradas */}
        <div style={styles.statCardTop}>
          <div style={styles.statLabelTop}>Total Productos</div>
          <div style={styles.statValueTop}>{totalProductos}</div>
        </div>
        <div style={styles.statCardTop}>
          <div style={styles.statLabelTop}>Total Materias Primas</div>
          <div style={styles.statValueTop}>{totalMateriasPrimas}</div>
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
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ color: '#333' }}>{producto.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                      Categoría: {producto.categoria}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Stock: {producto.stock}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay productos con stock bajo</div>
          )}
        </div>

        <div style={{ ...styles.statCard, overflow: 'auto', maxHeight: '300px' }}>
          <h2 style={styles.listTitle}>Materias Primas con stock bajo</h2>
          {materiasPrimasStockBajo.length > 0 ? (
            <div>
              {materiasPrimasStockBajo.map(materia => (
                <div key={materia.id} style={{
                  padding: '10px',
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ color: '#333' }}>{materia.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                      Tipo: {materia.tipo}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Stock: {materia.stock}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.listEmpty}>No hay materias primas con stock bajo</div>
          )}
        </div>
      </div>

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
                    outerRadius={80}
                    fill="#4e79a7"
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
    {/* Cambiar el color de la cuadrícula */}
    <CartesianGrid strokeDasharray="3 3" stroke="#dcdcdc" /> {/* Cambié el color de la cuadrícula a un gris claro */}

    {/* Cambiar el color de los ticks en el eje X */}
    <XAxis dataKey="name" tick={{ fill: '#2c3e50' }} /> {/* Color oscuro para los ticks del eje X */}

    {/* Cambiar el color de los ticks en el eje Y */}
    <YAxis tick={{ fill: '#2c3e50' }} /> {/* Color oscuro para los ticks del eje Y */}

    {/* Tooltip personalizado */}
    <Tooltip content={<CustomTooltip />} />

    {/* Leyenda */}
    <Legend iconType="circle" iconSize={10} />
    
    {/* Cambiar el color de las barras */}
    <Bar dataKey="value" fill="#ff6347" /> {/* Color rojo tomate para las barras */}
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
                <h2 style={styles.chartTitle}>Entradas de Inventario</h2>
                <div style={styles.chartSubtitle}>Movimientos recientes de entrada</div>
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
              La funcionalidad de movimientos de entrada se implementará próximamente.
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <div style={styles.chartTitleContainer}>
                <h2 style={styles.chartTitle}>Salidas de Inventario</h2>
                <div style={styles.chartSubtitle}>Movimientos recientes de salida</div>
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
              La funcionalidad de movimientos de salida se implementará próximamente.
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