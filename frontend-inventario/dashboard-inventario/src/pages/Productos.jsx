import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const apiURL = 'http://localhost:3000/api/productos';
  const apiCategorias = 'http://localhost:3000/api/categorias';

  const fetchProductos = async () => {
    try {
      const response = await axios.get(apiURL);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(apiCategorias);
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      // No bloqueamos la aplicación si fallan las categorías
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crear el objeto de producto con los datos del formulario
    const productoData = {
      nombre,
      descripcion,
      precio: Number(precio),
      categoria
    };
    
    try {
      if (editandoId) {
        // Si estamos editando, usamos el ID correcto que espera el backend (id_producto)
        await axios.put(`${apiURL}/${editandoId}`, productoData);
        
        // Actualizar el estado local para reflejar los cambios inmediatamente
        setProductos(productos.map(producto => 
          producto.id_producto === editandoId 
            ? { ...producto, ...productoData, id_producto: editandoId } 
            : producto
        ));
        
        Swal.fire('¡Actualizado!', 'El producto se actualizó correctamente.', 'success');
        
        // Si agregamos una nueva categoría, actualizamos la lista
        if (modoPersonalizado && !categorias.includes(categoria)) {
          setCategorias([...categorias, categoria]);
        }
      } else {
        // Si estamos creando un nuevo producto
        const response = await axios.post(apiURL, productoData);
        
        // Refrescar todos los productos para obtener el nuevo ID asignado por la BD
        fetchProductos();
        
        Swal.fire('¡Creado!', 'El producto se creó exitosamente.', 'success');
        
        // Si agregamos una nueva categoría, actualizamos la lista
        if (modoPersonalizado && !categorias.includes(categoria)) {
          setCategorias([...categorias, categoria]);
        }
      }
      
      // Limpiar el formulario
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCategoria('');
      setEditandoId(null);
      setModoPersonalizado(false);
      
    } catch (error) {
      console.error('Error al guardar producto:', error);
      Swal.fire('Error', 'Ocurrió un error al guardar el producto.', 'error');
    }
  };

  const handleEliminar = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await axios.delete(`${apiURL}/${id}`);
        
        // Actualizar el estado local eliminando el producto
        setProductos(productos.filter(producto => producto.id_producto !== id));
        
        Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        
        // Manejo específico para el error de restricción de clave foránea
        if (error.response && error.response.data && 
            error.response.data.code === 'ER_ROW_IS_REFERENCED_2') {
          Swal.fire({
            icon: 'error',
            title: 'No se puede eliminar',
            text: 'Este producto está asociado a ventas existentes y no puede eliminarse.',
            footer: 'Considere marcar el producto como inactivo en lugar de eliminarlo.'
          });
        } else {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        }
      }
    }
  };

  const handleEditar = (producto) => {
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio);
    setCategoria(producto.categoria || ''); // Manejar caso donde categoria pueda ser null
    setEditandoId(producto.id_producto); // Usar el id_producto que viene de la base de datos
    setModoPersonalizado(false); // Inicialmente mostramos la lista desplegable
  };

  const toggleModoCategoria = () => {
    setModoPersonalizado(!modoPersonalizado);
    if (!modoPersonalizado) {
      // Si estamos cambiando a modo personalizado, limpiamos la selección
      setCategoria('');
    }
  };

  const handleCategoriaChange = (e) => {
    const valor = e.target.value;
    if (valor === "otra") {
      setModoPersonalizado(true);
      setCategoria('');
    } else {
      setCategoria(valor);
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">CRUD de Productos</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border p-2 w-full"
          required
          min="0"
          step="0.01"
        />
        
        {/* Selector/Input de categoría */}
        <div>
          {!modoPersonalizado ? (
            <div className="flex items-center gap-2">
              <select
                value={categoria}
                onChange={handleCategoriaChange}
                className="border p-2 flex-grow"
                required
              >
                <option value="" disabled>Seleccione una categoría</option>
                {categorias.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="otra">Otra categoría...</option>
              </select>
              <button 
                type="button" 
                onClick={toggleModoCategoria}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Personalizada
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escriba la categoría"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border p-2 flex-grow"
                required
              />
              <button 
                type="button" 
                onClick={toggleModoCategoria}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Usar existente
              </button>
            </div>
          )}
        </div>
        
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {editandoId ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
        {editandoId && (
          <button
            type="button"
            onClick={() => {
              setEditandoId(null);
              setNombre('');
              setDescripcion('');
              setPrecio('');
              setCategoria('');
              setModoPersonalizado(false);
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Listado de productos */}
      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((producto) => (
            <div key={producto.id_producto} className="border p-4 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold">{producto.nombre}</h2>
              <p className="text-gray-600">{producto.descripcion}</p>
              <p className="text-gray-600">
                Categoría: <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                  {producto.categoria || 'N/A'}
                </span>
              </p>
              <p className="text-green-600 font-bold mb-2">Precio: ${producto.precio}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(producto)}
                  className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(producto.id_producto)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}