import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiFileText, FiFilter, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiUser, FiShoppingBag } from 'react-icons/fi';

const Reportes = () => {
  const [tiendas, setTiendas] = useState([]);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('');
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Estado para nuevo reporte
  const [nuevoReporte, setNuevoReporte] = useState({
    tipo: 'Ventas',
    contenido: '',
    id_usuario: 1, // Esto debería venir de la autenticación
    id_tienda: ''
  });

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar tiendas
      const tiendasResponse = await fetch('/api/tienda');
      const tiendasData = await tiendasResponse.json();
      
      if (!tiendasResponse.ok) throw new Error(tiendasData.message || 'Error al cargar tiendas');
      
      // Cargar reportes
      const reportesResponse = await fetch('/api/reporte');
      const reportesData = await reportesResponse.json();
      
      if (!reportesResponse.ok) throw new Error(reportesData.message || 'Error al cargar reportes');
      
      setTiendas(tiendasData.data || tiendasData);
      
      if (tiendasData.data?.length > 0 || tiendasData.length > 0) {
        const primeraTienda = tiendasData.data?.[0]?.id_tienda || tiendasData[0]?.id_tienda;
        setTiendaSeleccionada(primeraTienda);
        setNuevoReporte(prev => ({ ...prev, id_tienda: primeraTienda }));
      }
      
      setReportes(reportesData.data || reportesData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar reportes por tienda
  useEffect(() => {
    if (tiendaSeleccionada) {
      const cargarReportesTienda = async () => {
        try {
          const response = await fetch(`/api/reporte?id_tienda=${tiendaSeleccionada}`);
          const data = await response.json();
          
          if (!response.ok) throw new Error(data.message || 'Error al filtrar reportes');
          
          setReportes(data.data || data);
        } catch (err) {
          setError(err.message);
        }
      };
      
      cargarReportesTienda();
    }
  }, [tiendaSeleccionada]);

  // Manejar envío de nuevo reporte
  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    // Validación mejorada
    if (!nuevoReporte.contenido.trim()) {
      setError('El contenido del reporte es requerido');
      setIsSubmitting(false);
      return;
    }
  
    if (!nuevoReporte.id_tienda) {
      setError('Debes seleccionar una tienda');
      setIsSubmitting(false);
      return;
    }
  
    try {
      const response = await fetch('/api/reporte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          tipo: nuevoReporte.tipo,
          contenido: nuevoReporte.contenido,
          id_usuario: nuevoReporte.id_usuario,
          id_tienda: nuevoReporte.id_tienda
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Mostrar mensaje de error del backend si existe
        throw new Error(data.message || data.error || 'Error al generar reporte');
      }
  
      // Actualizar lista de reportes
      setReportes([data.data, ...reportes]);
      
      // Resetear formulario (manteniendo tienda seleccionada)
      setNuevoReporte(prev => ({
        tipo: 'Ventas',
        contenido: '',
        id_usuario: prev.id_usuario,
        id_tienda: prev.id_tienda
      }));
      
      setShowForm(false);
  
    } catch (err) {
      console.error('Detalles del error:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Manejar eliminación de reporte
  const handleEliminarReporte = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;
    
    try {
      const response = await fetch(`/api/reporte/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar reporte');
      }
      
      // Actualizar lista de reportes
      setReportes(reportes.filter(reporte => reporte.id_reporte !== id));
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtrar reportes por término de búsqueda
  const filteredReportes = reportes.filter(reporte => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reporte.contenido.toLowerCase().includes(searchLower) ||
      reporte.tipo.toLowerCase().includes(searchLower) ||
      (reporte.tienda_nombre && reporte.tienda_nombre.toLowerCase().includes(searchLower)) ||
      (reporte.usuario_nombre && reporte.usuario_nombre.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger mx-3 my-5">
      <p>{error}</p>
      <button className="btn btn-sm btn-outline-danger" onClick={cargarDatos}>
        <FiRefreshCw className="me-1" /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-5 fw-bold">
            <FiFileText className="me-2" /> Sistema de Reportes
          </h1>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlus className="me-1" />
            {showForm ? 'Cancelar' : 'Nuevo Reporte'}
          </button>
        </div>
      </div>
      
      {/* Formulario para nuevo reporte */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h2 className="h5 mb-0">Generar Nuevo Reporte</h2>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            
            <form onSubmit={handleGenerarReporte}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tipo de Reporte</label>
                  <select
                    className="form-select"
                    value={nuevoReporte.tipo}
                    onChange={(e) => setNuevoReporte({...nuevoReporte, tipo: e.target.value})}
                    required
                  >
                    <option value="Ventas">Ventas</option>
                    <option value="Inventario">Inventario</option>
                    <option value="Estadísticas">Estadísticas</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Tienda</label>
                  <select
                    className="form-select"
                    value={nuevoReporte.id_tienda}
                    onChange={(e) => setNuevoReporte({...nuevoReporte, id_tienda: e.target.value})}
                    required
                  >
                    <option value="">Seleccione una tienda</option>
                    {tiendas.map(tienda => (
                      <option key={tienda.id_tienda} value={tienda.id_tienda}>
                        {tienda.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-12">
                  <label className="form-label">Contenido</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={nuevoReporte.contenido}
                    onChange={(e) => setNuevoReporte({...nuevoReporte, contenido: e.target.value})}
                    placeholder="Describe el reporte con detalles..."
                    required
                  />
                </div>
                
                <div className="col-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      'Generar Reporte'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Filtros y búsqueda */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Filtrar por tienda</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FiFilter />
                </span>
                <select
                  className="form-select"
                  value={tiendaSeleccionada}
                  onChange={(e) => setTiendaSeleccionada(e.target.value)}
                >
                  <option value="">Todas las tiendas</option>
                  {tiendas.map(tienda => (
                    <option key={tienda.id_tienda} value={tienda.id_tienda}>
                      {tienda.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Buscar reportes</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por tipo, contenido, tienda o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Listado de Reportes */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h5 mb-0">Reportes Existentes</h2>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={cargarDatos}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {filteredReportes.length === 0 ? (
            <div className="text-center py-5">
              <FiFileText size={48} className="text-muted mb-3" />
              <h5>No hay reportes disponibles</h5>
              <p className="text-muted">Intenta cambiar los filtros o crear un nuevo reporte</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{width: '180px'}}>Fecha</th>
                    <th>Tipo</th>
                    <th>Tienda</th>
                    <th>Usuario</th>
                    <th>Contenido</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReportes.map(reporte => (
                    <tr key={reporte.id_reporte}>
                      <td>
                        <small className="text-muted">
                          {format(parseISO(reporte.fecha_generacion), 'PP', { locale: es })}
                        </small>
                        <br />
                        <small>
                          {format(parseISO(reporte.fecha_generacion), 'pp', { locale: es })}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${
                          reporte.tipo === 'Ventas' ? 'bg-success' :
                          reporte.tipo === 'Inventario' ? 'bg-warning' : 'bg-info'
                        }`}>
                          {reporte.tipo}
                        </span>
                      </td>
                      <td>{reporte.tienda_nombre || 'N/A'}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center">
                            <span className="text-muted">{reporte.usuario_nombre?.charAt(0)}</span>
                          </div>
                          {reporte.usuario_nombre}
                        </div>
                      </td>
                      <td>
                        <div 
                          className="text-truncate" 
                          style={{maxWidth: '250px'}} 
                          title={reporte.contenido}
                        >
                          {reporte.contenido}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminarReporte(reporte.id_reporte)}
                          title="Eliminar reporte"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;