const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.registrarVenta);
router.get('/', ventaController.obtenerVentas);
router.get('/:id', ventaController.obtenerVentaPorId);
router.delete('/:id', ventaController.eliminarVenta);

module.exports = router;