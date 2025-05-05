const express = require('express');
const router = express.Router();

// Importar funciones del controlador
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productoController');


router.get('/', obtenerProductos);             // Obtener todos los productos
router.get('/:id', obtenerProductoPorId);      // Obtener un producto por ID
router.post('/', crearProducto);               // Crear un nuevo producto
router.put('/:id', actualizarProducto);        // Actualizar un producto existente
router.delete('/:id', eliminarProducto);       // Eliminar un producto

module.exports = router;