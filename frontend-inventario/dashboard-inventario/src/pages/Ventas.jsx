import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiEye } from 'react-icons/fi';
import Modal from 'react-modal';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

Modal.setAppElement('#root');

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalDetallesIsOpen, setModalDetallesIsOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('');

  const [nuevaVenta, setNuevaVenta] = useState({
    id_usuario: '',
    id_tienda: '',
    productos: [],
    productoSeleccionado: '',
    cantidad: 1
  });

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ventasRes, usuariosRes, tiendasRes] = await Promise.all([
        axios.get('/api/ventas'),
        axios.get('/api/usuarios'),
        axios.get('/api/tienda')
      ]);
      
      setVentas(ventasRes.data.data || ventasRes.data);
      setUsuarios(usuariosRes.data.data || usuariosRes.data);
      setTiendas(tiendasRes.data.data || tiendasRes.data);
      
      if (tiendaSeleccionada) {
        await cargarProductosPorTienda(tiendaSeleccionada);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosPorTienda = async (idTienda) => {
    try {
      const productosRes = await axios.get(`/api/inventory/tienda/${idTienda}`);
      setProductos(productosRes.data.data || productosRes.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setProductos([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (tiendaSeleccionada) {
      cargarProductosPorTienda(tiendaSeleccionada);
    }
  }, [tiendaSeleccionada]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaVenta({
      ...nuevaVenta,
      [name]: value
    });
  };

  const handleTiendaChange = (e) => {
    const { value } = e.target;
    setTiendaSeleccionada(value);
    setNuevaVenta({
      ...nuevaVenta,
      id_tienda: value,
      productos: []
    });
  };

  const agregarProducto = () => {
    if (!nuevaVenta.productoSeleccionado || nuevaVenta.cantidad < 1) return;

    const producto = productos.find(p => p.id_producto == nuevaVenta.productoSeleccionado);
    if (!producto) return;

    if (producto.cantidad_stock < nuevaVenta.cantidad) {
      setError(`No hay suficiente stock para ${producto.nombre}. Stock disponible: ${producto.cantidad_stock}`);
      return;
    }

    const productoExistente = nuevaVenta.productos.find(p => p.id_producto == producto.id_producto);
    
    if (productoExistente) {
      const nuevaCantidad = productoExistente.cantidad + parseInt(nuevaVenta.cantidad);
      if (producto.cantidad_stock < nuevaCantidad) {
        setError(`No hay suficiente stock para ${producto.nombre}. Stock disponible: ${producto.cantidad_stock}`);
        return;
      }

      setNuevaVenta({
        ...nuevaVenta,
        productos: nuevaVenta.productos.map(p => 
          p.id_producto == producto.id_producto 
            ? { ...p, cantidad: nuevaCantidad }
            : p
        ),
        productoSeleccionado: '',
        cantidad: 1
      });
    } else {
      setNuevaVenta({
        ...nuevaVenta,
        productos: [
          ...nuevaVenta.productos,
          {
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: parseInt(nuevaVenta.cantidad)
          }
        ],
        productoSeleccionado: '',
        cantidad: 1
      });
    }
    setError(null);
  };

  const quitarProducto = (idProducto) => {
    setNuevaVenta({
      ...nuevaVenta,
      productos: nuevaVenta.productos.filter(p => p.id_producto !== idProducto)
    });
  };
  const crearVenta = async (e) => {
    e.preventDefault();
    try {
      if (nuevaVenta.productos.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      const response = await axios.post('/api/ventas', {
        id_usuario: nuevaVenta.id_usuario,
        id_tienda: nuevaVenta.id_tienda,
        productos: nuevaVenta.productos.map(p => ({
          id_producto: p.id_producto,
          cantidad: p.cantidad,
          precio: p.precio
        }))
      });

      setModalIsOpen(false);
      cargarDatos();
      setNuevaVenta({
        id_usuario: '',
        id_tienda: '',
        productos: [],
        productoSeleccionado: '',
        cantidad: 1
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error al crear venta:", err);
    }
  };

  // Ver detalles de venta
  const verDetalles = async (idVenta) => {
    try {
      const response = await axios.get(`/api/ventas/${idVenta}`);
      setVentaSeleccionada(response.data);
      setModalDetallesIsOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar detalles');
    }
  };

  // Eliminar venta
  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      await axios.delete(`/api/ventas/${id}`);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar venta');
    }
  };

  // Calcular total de la venta
  const calcularTotal = () => {
    return nuevaVenta.productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  // Formatear moneda
  const formatMoney = (amount) => {
    return parseFloat(amount || 0).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Filtrar ventas
  const ventasFiltradas = ventas.filter(venta => {
    const usuario = usuarios.find(u => u.id_usuario === venta.id_usuario);
    const tienda = tiendas.find(t => t.id_tienda === venta.id_tienda);
    
    return (
      venta.id_venta.toString().includes(filtro) ||
      (usuario?.nombre?.toLowerCase().includes(filtro.toLowerCase())) ||
      (tienda?.nombre?.toLowerCase().includes(filtro.toLowerCase())) ||
      format(new Date(venta.fecha), 'PPPP', { locale: es }).toLowerCase().includes(filtro.toLowerCase())
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <FiDollarSign className="me-2" /> Gestión de Ventas
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setModalIsOpen(true)}
        >
          <FiPlus className="me-1" /> Nueva Venta
        </button>
      </div>

      {/* Filtro de búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar ventas..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <button 
              className="btn btn-outline-secondary" 
              onClick={cargarDatos}
              title="Recargar"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Tienda</th>
                  <th>Total</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No se encontraron ventas
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map(venta => {
                    const usuario = usuarios.find(u => u.id_usuario === venta.id_usuario);
                    const tienda = tiendas.find(t => t.id_tienda === venta.id_tienda);
                    
                    return (
                      <tr key={venta.id_venta}>
                        <td>{venta.id_venta}</td>
                        <td>{format(new Date(venta.fecha), 'PPP', { locale: es })}</td>
                        <td>{usuario?.nombre || 'Desconocido'}</td>
                        <td>{tienda?.nombre || 'Desconocida'}</td>
                        <td>${formatMoney(venta.total)}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => verDetalles(venta.id_venta)}
                            title="Ver detalles"
                          >
                            <FiEye />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarVenta(venta.id_venta)}
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para nueva venta */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Nueva Venta"
        className="modal-dialog modal-lg"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nueva Venta</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setModalIsOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={crearVenta}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Usuario</label>
                  <select
                    className="form-select"
                    name="id_usuario"
                    value={nuevaVenta.id_usuario}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre} ({usuario.rol || 'Sin rol'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tienda</label>
                  <select
                    className="form-select"
                    name="id_tienda"
                    value={nuevaVenta.id_tienda}
                    onChange={handleTiendaChange}
                    required
                  >
                    <option value="">Seleccionar tienda</option>
                    {tiendas.map(tienda => (
                      <option key={tienda.id_tienda} value={tienda.id_tienda}>
                        {tienda.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {nuevaVenta.id_tienda && (
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label className="form-label">Producto</label>
                    <select
                      className="form-select"
                      name="productoSeleccionado"
                      value={nuevaVenta.productoSeleccionado}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map(producto => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre} - ${formatMoney(producto.precio)} (Stock: {producto.cantidad_stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      name="cantidad"
                      min="1"
                      value={nuevaVenta.cantidad}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={agregarProducto}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h6>Productos en la venta</h6>
                {nuevaVenta.productos.length === 0 ? (
                  <p className="text-muted">No hay productos agregados</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio Unitario</th>
                          <th>Cantidad</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {nuevaVenta.productos.map((producto, index) => (
                          <tr key={index}>
                            <td>{producto.nombre}</td>
                            <td>${formatMoney(producto.precio)}</td>
                            <td>{producto.cantidad}</td>
                            <td>${formatMoney(producto.precio * producto.cantidad)}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => quitarProducto(producto.id_producto)}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                          <td><strong>${formatMoney(calcularTotal())}</strong></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setModalIsOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={nuevaVenta.productos.length === 0}
                >
                  Registrar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Modal para detalles de venta */}
      <Modal
        isOpen={modalDetallesIsOpen}
        onRequestClose={() => setModalDetallesIsOpen(false)}
        contentLabel="Detalles de Venta"
        className="modal-dialog modal-lg"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles de Venta #{ventaSeleccionada?.id_venta}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setModalDetallesIsOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            {ventaSeleccionada && (
              <>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p><strong>Fecha:</strong> {format(new Date(ventaSeleccionada.fecha), 'PPPPpp', { locale: es })}</p>
                    <p><strong>Usuario:</strong> {
                      usuarios.find(u => u.id_usuario === ventaSeleccionada.id_usuario)?.nombre || 'Desconocido'
                    }</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Tienda:</strong> {
                      tiendas.find(t => t.id_tienda === ventaSeleccionada.id_tienda)?.nombre || 'Desconocida'
                    }</p>
                    <p><strong>Total:</strong> ${formatMoney(ventaSeleccionada.total)}</p>
                  </div>
                </div>

                <h6>Productos vendidos</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventaSeleccionada.detalles?.map((detalle, index) => (
                        <tr key={index}>
                          <td>{detalle.nombre_producto || detalle.nombreProducto || `Producto ${detalle.id_producto}`}</td>
                          <td>${formatMoney(detalle.precio_unitario || detalle.precioUnitario)}</td>
                          <td>{detalle.cantidad}</td>
                          <td>${formatMoney(detalle.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalDetallesIsOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Ventas;