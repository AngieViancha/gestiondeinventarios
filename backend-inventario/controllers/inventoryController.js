const inventoryService = require('../services/inventoryService');

exports.getInventoryByStore = async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryByStore(req.params.idTienda);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductFromInventory = async (req, res) => {
  try {
    const item = await inventoryService.getInventoryItem(req.params.idInventario);
    res.json(item);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.addProductToInventory = async (req, res) => {
  try {
    const { id_tienda, id_producto, cantidad_stock } = req.body;
    
    if (!id_tienda || !id_producto || cantidad_stock === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const newItem = await inventoryService.addInventoryItem({
      id_tienda,
      id_producto,
      cantidad_stock
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Este producto ya existe en el inventario de la tienda' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateInventoryStock = async (req, res) => {
  try {
    const { cantidad_stock } = req.body;
    
    if (cantidad_stock === undefined) {
      return res.status(400).json({ error: 'La cantidad de stock es requerida' });
    }

    const updatedItem = await inventoryService.updateInventoryItem(
      req.params.idInventario,
      { cantidad_stock }
    );
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProductFromInventory = async (req, res) => {
  try {
    await inventoryService.deleteInventoryItem(req.params.idInventario);
    res.json({ message: 'Ítem de inventario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkLowStock = async (req, res) => {
  try {
    const lowStockItems = await inventoryService.checkLowInventory(req.params.idTienda);
    
    if (lowStockItems.length > 0) {
      return res.json({ 
        warning: 'Existen productos con bajo stock',
        products: lowStockItems 
      });
    }
    
    res.json({ message: 'No hay productos con bajo stock' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};