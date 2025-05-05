import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import axios from 'axios';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

// Función de formateo segura
const formatPrice = (price) => {
  if (price === undefined || price === null) return 'N/A';
  const numericPrice = typeof price === 'string' 
    ? parseFloat(price.replace(',', '.')) 
    : Number(price);
  return !isNaN(numericPrice) ? `$${numericPrice.toFixed(2)}` : 'N/A';
};

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('');
  const [filtro, setFiltro] = useState('');
  const [mostrarModalBajoStock, setMostrarModalBajoStock] = useState(false);
  const [productosBajoStock, setProductosBajoStock] = useState([]);
  const [mensajeBajoStock, setMensajeBajoStock] = useState('');

  // Estado para nuevo ítem de inventario
  const [nuevoItem, setNuevoItem] = useState({
    id_tienda: '',
    id_producto: '',
    cantidad_stock: 0
  });

  // Estado para edición
  const [itemEditando, setItemEditando] = useState(null);

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tiendasRes, productosRes] = await Promise.all([
        axios.get('/api/tienda'),
        axios.get('/api/productos')
      ]);
      
      setTiendas(tiendasRes.data);
      setProductos(productosRes.data);
      
      // Cargar inventario si hay tienda seleccionada
      if (tiendaSeleccionada) {
        await cargarInventario(tiendaSeleccionada);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar inventario por tienda
  const cargarInventario = async (idTienda) => {
    try {
      const res = await axios.get(`/api/inventory/tienda/${idTienda}`);
      setInventario(res.data);
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setInventario([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Actualizar inventario cuando cambia la tienda seleccionada
  useEffect(() => {
    if (tiendaSeleccionada) {
      cargarInventario(tiendaSeleccionada);
    }
  }, [tiendaSeleccionada]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (itemEditando) {
      setItemEditando({
        ...itemEditando,
        [name]: value
      });
    } else {
      setNuevoItem({
        ...nuevoItem,
        [name]: value
      });
    }
  };

  // Manejar cambio de tienda
  const handleTiendaChange = (e) => {
    const { value } = e.target;
    setTiendaSeleccionada(value);
  };

  // Agregar nuevo ítem al inventario
  const agregarItem = async (e) => {
    e.preventDefault();
    
    if (!nuevoItem.id_producto || nuevoItem.cantidad_stock < 0) {
      toast.error('Por favor complete todos los campos correctamente');
      return;
    }

    try {
      const itemCompleto = {
        ...nuevoItem,
        id_tienda: tiendaSeleccionada
      };

      await axios.post('/api/inventory', itemCompleto);
      toast.success('Ítem agregado correctamente al inventario');
      setModalIsOpen(false);
      setNuevoItem({
        id_tienda: '',
        id_producto: '',
        cantidad_stock: 0
      });
      cargarInventario(tiendaSeleccionada);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al agregar ítem');
      console.error("Error al agregar ítem:", err);
    }
  };

  // Actualizar ítem de inventario
  const actualizarItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/inventory/${itemEditando.id_inventario}`, {
        cantidad_stock: itemEditando.cantidad_stock
      });
      toast.success('Inventario actualizado correctamente');
      setModalIsOpen(false);
      cargarInventario(tiendaSeleccionada);
      setItemEditando(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar ítem');
      console.error("Error al actualizar ítem:", err);
    }
  };

  // Eliminar ítem de inventario
  const eliminarItem = async (idInventario) => {
    if (!window.confirm('¿Estás seguro de eliminar este ítem del inventario?')) return;
    try {
      await axios.delete(`/api/inventory/${idInventario}`);
      toast.success('Ítem eliminado correctamente');
      cargarInventario(tiendaSeleccionada);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar ítem');
      console.error("Error al eliminar ítem:", err);
    }
  };

  // Verificar bajo stock
  const verificarBajoStock = async () => {
    if (!tiendaSeleccionada) {
      toast.warning('Por favor seleccione una tienda primero', {
        position: "top-center",
        autoClose: 5000
      });
      return;
    }

    try {
      const { data } = await axios.get(`/api/inventory/verificar-bajo-stock/${tiendaSeleccionada}`);
      
      setProductosBajoStock(data.products || []);
      setMensajeBajoStock(data.warning || 'Productos con bajo stock');
      
      if (data.products && data.products.length > 0) {
        setMostrarModalBajoStock(true);
      } else {
        toast.info('No hay productos con bajo stock en esta tienda', {
          position: "top-center"
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error al verificar el stock bajo',
        {
          position: "top-center",
          autoClose: 10000
        }
      );
      console.error("Error al verificar bajo stock:", error);
    }
  };

  // Filtrar inventario
  const inventarioFiltrado = inventario.filter(item => {
    return (
      item.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (item.categoria && item.categoria.toLowerCase().includes(filtro.toLowerCase())) ||
      item.cantidad_stock.toString().includes(filtro)
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
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <FiPackage className="me-2" /> Gestión de Inventario
        </h1>
        <div>
          <button 
            className="btn btn-primary me-2"
            onClick={() => setModalIsOpen(true)}
            disabled={!tiendaSeleccionada}
          >
            <FiPlus className="me-1" /> Nuevo Ítem
          </button>
          <button 
            className="btn btn-warning"
            onClick={verificarBajoStock}
            disabled={!tiendaSeleccionada}
          >
            <FiAlertTriangle className="me-1" /> Verificar Bajo Stock
          </button>
        </div>
      </div>

      {/* Selector de tienda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Seleccionar Tienda</label>
              <select
                className="form-select"
                value={tiendaSeleccionada}
                onChange={handleTiendaChange}
              >
                <option value="">Seleccione una tienda</option>
                {tiendas.map(tienda => (
                  <option key={tienda.id_tienda} value={tienda.id_tienda}>
                    {tienda.nombre} - {tienda.direccion}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Buscar en inventario</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FiRefreshCw />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filtrar por nombre, categoría o stock..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => cargarInventario(tiendaSeleccionada)}
                  title="Recargar"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de inventario */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!tiendaSeleccionada ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Seleccione una tienda para ver su inventario
                    </td>
                  </tr>
                ) : inventarioFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No se encontraron ítems en el inventario
                    </td>
                  </tr>
                ) : (
                  inventarioFiltrado.map(item => (
                    <tr key={item.id_inventario}>
                      <td>
                        <strong>{item.nombre}</strong>
                        {item.descripcion && <div className="text-muted small">{item.descripcion}</div>}
                      </td>
                      <td>{item.categoria || '-'}</td>
                      <td>{formatPrice(item.precio)}</td>
                      <td>
                        <span className={item.cantidad_stock < 5 ? 'text-danger fw-bold' : ''}>
                          {item.cantidad_stock}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => {
                            setItemEditando(item);
                            setModalIsOpen(true);
                          }}
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => eliminarItem(item.id_inventario)}
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar ítem */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {
          setModalIsOpen(false);
          setItemEditando(null);
        }}
        contentLabel={itemEditando ? "Editar Ítem" : "Nuevo Ítem"}
        className="modal-dialog"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {itemEditando ? "Editar Ítem de Inventario" : "Agregar Nuevo Ítem"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setModalIsOpen(false);
                setItemEditando(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={itemEditando ? actualizarItem : agregarItem}>
              {!itemEditando && (
                <div className="mb-3">
                  <label className="form-label">Producto</label>
                  <select
                    className="form-select"
                    name="id_producto"
                    value={nuevoItem.id_producto}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(producto => (
                      <option key={producto.id_producto} value={producto.id_producto}>
                        {producto.nombre} - {producto.categoria || 'Sin categoría'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Cantidad en Stock</label>
                <input
                  type="number"
                  className="form-control"
                  name="cantidad_stock"
                  min="0"
                  value={itemEditando ? itemEditando.cantidad_stock : nuevoItem.cantidad_stock}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setModalIsOpen(false);
                    setItemEditando(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {itemEditando ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Modal para productos con bajo stock */}
      <Modal
        isOpen={mostrarModalBajoStock}
        onRequestClose={() => setMostrarModalBajoStock(false)}
        contentLabel="Productos con bajo stock"
        className="modal-dialog modal-lg"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header bg-warning text-white">
            <h5 className="modal-title">
              <FiAlertTriangle className="me-2" />
              {mensajeBajoStock}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setMostrarModalBajoStock(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosBajoStock.map((producto) => (
                    <tr key={producto.id_inventario}>
                      <td>
                        <strong>{producto.nombre}</strong>
                      </td>
                      <td className="text-danger fw-bold">{producto.cantidad_stock}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setItemEditando({
                              id_inventario: producto.id_inventario,
                              cantidad_stock: producto.cantidad_stock
                            });
                            setModalIsOpen(true);
                            setMostrarModalBajoStock(false);
                          }}
                        >
                          <FiEdit2 className="me-1" /> Actualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMostrarModalBajoStock(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventario;