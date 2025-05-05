import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const Tienda = () => {
  const [tiendas, setTiendas] = useState([]);
  const [dueños, setDueños] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tiendaEditando, setTiendaEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Estado para nueva tienda
  const [nuevaTienda, setNuevaTienda] = useState({
    nombre: '',
    direccion: '',
    id_dueño: ''
  });

  // Cargar tiendas y dueños
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tiendasRes, dueñosRes] = await Promise.all([
        axios.get('/api/tienda'),
        axios.get('/api/usuarios?rol=Dueño')
      ]);
      setTiendas(tiendasRes.data);
      setDueños(dueñosRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (tiendaEditando) {
      setTiendaEditando({
        ...tiendaEditando,
        [name]: value
      });
    } else {
      setNuevaTienda({
        ...nuevaTienda,
        [name]: value
      });
    }
  };

  // Crear/Actualizar tienda
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tiendaEditando) {
        await axios.put(`/api/tienda/${tiendaEditando.id_tienda}`, tiendaEditando);
      } else {
        await axios.post('/api/tienda', nuevaTienda);
      }
      setModalIsOpen(false);
      cargarDatos();
      setNuevaTienda({
        nombre: '',
        direccion: '',
        id_dueño: ''
      });
      setTiendaEditando(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar tienda');
    }
  };

  // Editar tienda
  const handleEditar = (tienda) => {
    setTiendaEditando(tienda);
    setModalIsOpen(true);
  };

  // Eliminar tienda
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tienda?')) return;
    try {
      await axios.delete(`/api/tienda/${id}`);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar tienda');
    }
  };

  // Filtrar tiendas
  const tiendasFiltradas = tiendas.filter(tienda =>
    tienda.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    tienda.direccion.toLowerCase().includes(filtro.toLowerCase()) ||
    tienda.nombre_dueño.toLowerCase().includes(filtro.toLowerCase())
  );

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
          <FiShoppingBag className="me-2" /> Gestión de Tiendas
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setModalIsOpen(true)}
        >
          <FiPlus className="me-1" /> Nueva Tienda
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
              placeholder="Buscar tiendas..."
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

      {/* Tabla de tiendas */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Dueño</th>
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tiendasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No se encontraron tiendas
                    </td>
                  </tr>
                ) : (
                  tiendasFiltradas.map(tienda => (
                    <tr key={tienda.id_tienda}>
                      <td>{tienda.nombre}</td>
                      <td>{tienda.direccion}</td>
                      <td>{tienda.nombre_dueño}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditar(tienda)}
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(tienda.id_tienda)}
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

      {/* Modal para crear/editar tienda */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {
          setModalIsOpen(false);
          setTiendaEditando(null);
        }}
        contentLabel="Formulario de Tienda"
        className="modal-dialog"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {tiendaEditando ? 'Editar Tienda' : 'Nueva Tienda'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setModalIsOpen(false);
                setTiendaEditando(null);
              }}
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={tiendaEditando ? tiendaEditando.nombre : nuevaTienda.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={tiendaEditando ? tiendaEditando.direccion : nuevaTienda.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dueño</label>
                <select
                  className="form-select"
                  name="id_dueño"
                  value={tiendaEditando ? tiendaEditando.id_dueño : nuevaTienda.id_dueño}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar dueño</option>
                  {dueños.map(dueño => (
                    <option key={dueño.id_usuario} value={dueño.id_usuario}>
                      {dueño.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setModalIsOpen(false);
                    setTiendaEditando(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {tiendaEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tienda;