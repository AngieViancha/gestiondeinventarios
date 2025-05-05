const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Obtener inventario completo por tienda
router.get('/tienda/:idTienda', inventoryController.getInventoryByStore);

// Obtener un producto específico en el inventario
router.get('/:idInventario', inventoryController.getProductFromInventory);

// Agregar producto al inventario
router.post('/', inventoryController.addProductToInventory);

// Actualizar cantidad del producto en inventario
router.put('/:idInventario', inventoryController.updateInventoryStock);

// Eliminar producto del inventario
router.delete('/:idInventario', inventoryController.deleteProductFromInventory);

// Verificar productos con bajo stock
router.get('/verificar-bajo-stock/:idTienda', inventoryController.checkLowStock);

module.exports = router;