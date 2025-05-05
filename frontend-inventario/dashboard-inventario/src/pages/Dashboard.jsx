import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiStar, 
  FiAlertTriangle, 
  FiUsers,
  FiTrendingUp,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Chart.register(...registerables);

// Función segura para formatear números
const safeFormat = (value) => {
  if (value === undefined || value === null) return '0';
  return Number(value).toLocaleString('es-ES');
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    ventas_mes: { total: 0, cantidad: 0 },
    productos_vendidos: 0,
    producto_mas_vendido: null,
    productos_stock_bajo: [],
    usuarios: { total: 0 },
    ventas_por_tienda: []
  });
  
  const [ventasData, setVentasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resumenRes, ventasRes] = await Promise.all([
        axios.get('/api/dashboard/resumen'),
        axios.get('/api/dashboard/ventas-7dias')
      ]);
      
      console.log("Respuesta del backend - Resumen:", resumenRes.data);
      console.log("Respuesta del backend - Ventas:", ventasRes.data);
  
      if (!resumenRes.data?.success || !ventasRes.data?.success) {
        throw new Error(resumenRes.data?.message || 'Error en los datos recibidos');
      }
  
      // Procesamiento seguro de los datos del resumen
      const resumenData = resumenRes.data.data || {};
      
      // Corregir estructura de producto_mas_vendido (puede venir como array vacío)
      let productoMasVendido = null;
      if (Array.isArray(resumenData.producto_mas_vendido) && resumenData.producto_mas_vendido.length > 0) {
        productoMasVendido = resumenData.producto_mas_vendido[0];
      } else if (resumenData.producto_mas_vendido && !Array.isArray(resumenData.producto_mas_vendido)) {
        productoMasVendido = resumenData.producto_mas_vendido;
      }
  
      // Corregir estructura de productos_stock_bajo (viene como array de arrays)
      let productosStockBajo = [];
      if (Array.isArray(resumenData.productos_stock_bajo)) {
        // Aplanar el array de arrays
        productosStockBajo = resumenData.productos_stock_bajo.flat();
      }
  
      // Corregir estructura de ventas_por_tienda (viene como array de arrays)
      let ventasPorTienda = [];
      if (Array.isArray(resumenData.ventas_por_tienda)) {
        // Aplanar el array de arrays
        ventasPorTienda = resumenData.ventas_por_tienda.flat();
      }
  
      setDashboardData({
        ventas_mes: {
          total: resumenData.ventas_mes?.total || 0,
          cantidad: resumenData.ventas_mes?.cantidad || 0
        },
        productos_vendidos: resumenData.productos_vendidos || 0,
        producto_mas_vendido: productoMasVendido,
        productos_stock_bajo: productosStockBajo,
        usuarios: {
          total: resumenData.usuarios?.total || 0
        },
        ventas_por_tienda: ventasPorTienda
      });
  
      setVentasData(Array.isArray(ventasRes.data.data) ? ventasRes.data.data : []);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Error al cargar el dashboard';
      setError(errorMsg);
      console.error("Error detallado:", err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  // Datos para el gráfico con validación
  const ventasChartData = {
    labels: ventasData.map((item, index) => item?.fecha || `Día ${index + 1}`),
    datasets: [
      {
        label: 'Ventas Diarias ($)',
        data: ventasData.map(item => item?.total_dia || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <h4 className="alert-heading">Error en el dashboard</h4>
              <p>{error}</p>
            </div>
            <button 
              className="btn btn-outline-danger"
              onClick={cargarDashboard}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "spin" : ""} /> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Panel de Control</h1>
        <button 
          className="btn btn-outline-primary"
          onClick={cargarDashboard}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "spin" : ""} /> Actualizar
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="row mb-4">
        {/* Tarjeta Ventas */}
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Ventas del Mes</h6>
                  <h3 className="mb-0">${safeFormat(dashboardData.ventas_mes.total)}</h3>
                  <small className="text-muted">{safeFormat(dashboardData.ventas_mes.cantidad)} transacciones</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiDollarSign className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Productos Vendidos */}
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Productos Vendidos</h6>
                  <h3 className="mb-0">{safeFormat(dashboardData.productos_vendidos)}</h3>
                  <small className="text-muted">Este mes</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiShoppingBag className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Usuarios */}
        <div className="col-md-4 mb-3">
          <div className="card h-100 border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Usuarios Registrados</h6>
                  <h3 className="mb-0">{safeFormat(dashboardData.usuarios.total)}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FiUsers className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y Secciones Inferiores */}
      <div className="row">
        {/* Gráfico de Ventas */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <FiTrendingUp className="me-2" />
                Ventas últimos 7 días
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {ventasData.length > 0 ? (
                  <Bar
                    data={ventasChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return `$${safeFormat(value)}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">No hay datos de ventas recientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Producto más vendido */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <FiStar className="me-2" />
                Producto más vendido
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.producto_mas_vendido ? (
                <div className="text-center">
                  <div className="mb-3">
                    <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                         style={{ height: '120px' }}>
                      <span className="text-muted">Sin imagen</span>
                    </div>
                  </div>
                  <h4>{dashboardData.producto_mas_vendido.nombre || 'Producto sin nombre'}</h4>
                  <p className="text-success fs-5">
                    {safeFormat(dashboardData.producto_mas_vendido.cantidad)} unidades vendidas
                  </p>
                </div>
              ) : (
                <p className="text-muted">No hay datos de productos vendidos</p>
              )}
            </div>
          </div>
        </div>

        {/* Productos con bajo stock */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 border-warning">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <FiAlertTriangle className="me-2 text-warning" />
                Productos con bajo stock
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.productos_stock_bajo.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-end">Stock</th>
                        <th className="text-end">Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.productos_stock_bajo.map((producto, index) => (
                        <tr key={index}>
                          <td>{producto.nombre || 'Producto sin nombre'}</td>
                          <td className="text-end text-danger fw-bold">
                            {safeFormat(producto.cantidad_stock)}
                          </td>
                          <td className="text-end">{safeFormat(producto.stock_minimo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay productos con bajo stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Ventas por tienda */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <FiShoppingBag className="me-2" />
                Ventas por tienda (este mes)
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.ventas_por_tienda.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Tienda</th>
                        <th className="text-end">Ventas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ventas_por_tienda.map((tienda, index) => (
                        <tr key={index}>
                          <td>{tienda.tienda || 'Tienda sin nombre'}</td>
                          <td className="text-end fw-bold">
                            ${safeFormat(tienda.total_ventas)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay datos de ventas por tienda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Estilos para el spinner
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);