const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/', reporteController.obtenerReportes);
router.post('/', reporteController.generarReporte);
router.get('/:id', reporteController.obtenerReportePorId);
router.delete('/:id', reporteController.eliminarReporte);
router.get('/descargar/:id', reporteController.descargarReporte);

module.exports = router;

