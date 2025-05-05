import React, { useState, useEffect } from 'react';
import { FiUser, FiEdit, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [filtro, setFiltro] = useState('');

  // Estado para nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    rol: 'Empleado'
  });

  // Cargar usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (usuarioEditando) {
      setUsuarioEditando({
        ...usuarioEditando,
        [name]: value
      });
    } else {
      setNuevoUsuario({
        ...nuevoUsuario,
        [name]: value
      });
    }
  };

  // Crear nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (usuarioEditando) {
        await axios.put(`/api/usuarios/${usuarioEditando.id_usuario}`, usuarioEditando);
      } else {
        await axios.post('/api/usuarios/registrar', nuevoUsuario);
      }
      setModalIsOpen(false);
      cargarUsuarios();
      setNuevoUsuario({
        nombre: '',
        email: '',
        contraseña: '',
        rol: 'Empleado'
      });
      setUsuarioEditando(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar usuario');
    }
  };

  // Editar usuario
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalIsOpen(true);
  };

  // Eliminar usuario
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await axios.delete(`/api/usuarios/${id}`);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(filtro.toLowerCase())
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
      <button className="btn btn-sm btn-outline-danger" onClick={cargarUsuarios}>
        <FiRefreshCw className="me-1" /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <FiUser className="me-2" /> Gestión de Usuarios
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setModalIsOpen(true)}
        >
          <FiPlus className="me-1" /> Nuevo Usuario
        </button>
      </div>

      {/* Filtro de búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <FiRefreshCw />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuarios..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id_usuario}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`badge ${
                          usuario.rol === 'Administrador' ? 'bg-primary' :
                          usuario.rol === 'Dueño' ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditar(usuario)}
                          title="Editar"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(usuario.id_usuario)}
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

      {/* Modal para crear/editar usuario */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {
          setModalIsOpen(false);
          setUsuarioEditando(null);
        }}
        contentLabel="Formulario de Usuario"
        className="modal-dialog"
        overlayClassName="modal-backdrop"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setModalIsOpen(false);
                setUsuarioEditando(null);
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
                  value={usuarioEditando ? usuarioEditando.nombre : nuevoUsuario.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={usuarioEditando ? usuarioEditando.email : nuevoUsuario.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="contraseña"
                  value={usuarioEditando ? '' : nuevoUsuario.contraseña}
                  onChange={handleInputChange}
                  required={!usuarioEditando}
                  placeholder={usuarioEditando ? 'Dejar en blanco para no cambiar' : ''}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  name="rol"
                  value={usuarioEditando ? usuarioEditando.rol : nuevoUsuario.rol}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Empleado">Empleado</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Dueño">Dueño</option>
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setModalIsOpen(false);
                    setUsuarioEditando(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {usuarioEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Usuarios;
  