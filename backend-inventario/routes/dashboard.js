const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/resumen', dashboardController.resumenDashboard);
router.get('/ventas-7dias', dashboardController.ventasUltimos7Dias);

module.exports = router;