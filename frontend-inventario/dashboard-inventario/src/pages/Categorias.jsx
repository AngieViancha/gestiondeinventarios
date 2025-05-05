import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const apiCategorias = 'http://localhost:3000/api/categorias';
  const apiProductos = 'http://localhost:3000/api/productos';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriasResponse = await axios.get(apiCategorias);
        setCategorias(categoriasResponse.data);
        
        // Cargar todos los productos
        const productosResponse = await axios.get(apiProductos);
        setProductos(productosResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos por la categoría seleccionada
  const productosFiltrados = categoriaSeleccionada 
    ? productos.filter(producto => producto.categoria === categoriaSeleccionada)
    : productos;

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Categorías de Productos</h1>
      
      {/* Selector de categorías */}
      <div className="mb-6">
        <label htmlFor="categoria-select" className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por categoría:
        </label>
        <select
          id="categoria-select"
          value={categoriaSeleccionada || ''}
          onChange={(e) => setCategoriaSeleccionada(e.target.value || null)}
          className="border p-2 w-full md:w-1/2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>
      
      {/* Lista de categorías */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {categoriaSeleccionada 
            ? `Productos en categoría: ${categoriaSeleccionada}`
            : 'Todos los productos'}
        </h2>
        
        {productosFiltrados.length === 0 ? (
          <p>No hay productos disponibles en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => (
              <div key={producto.id_producto} className="border p-4 rounded shadow hover:shadow-md transition">
                <h3 className="text-lg font-medium">{producto.nombre}</h3>
                <p className="text-gray-600">{producto.descripcion}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {producto.categoria || 'Sin categoría'}
                  </span>
                  <span className="font-bold text-green-600">${producto.precio}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Resumen de categorías */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Resumen de Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria, index) => {
            const cantidadProductos = productos.filter(p => p.categoria === categoria).length;
            return (
              <div key={index} className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer"
                onClick={() => setCategoriaSeleccionada(categoria === categoriaSeleccionada ? null : categoria)}>
                <h3 className="text-lg font-medium">{categoria}</h3>
                <p>{cantidadProductos} producto{cantidadProductos !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
