const express = require('express');
const router = express.Router();
const { obtenerCategorias } = require('../controllers/categoriaController');

router.get('/', obtenerCategorias);

module.exports = router;