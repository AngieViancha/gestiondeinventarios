const Inventory = require('../models/Inventory');

class InventoryService {
  async getInventoryByStore(storeId) {
    return await Inventory.getByStore(storeId);
  }

  async getInventoryItem(inventoryId) {
    const item = await Inventory.getById(inventoryId);
    if (!item) throw new Error('Ítem de inventario no encontrado');
    return item;
  }

  async addInventoryItem(itemData) {
    // Validaciones adicionales pueden ir aquí
    return await Inventory.create(itemData);
  }

  async updateInventoryItem(inventoryId, updateData) {
    await this.getInventoryItem(inventoryId); // Verifica que exista
    return await Inventory.update(inventoryId, updateData);
  }

  async deleteInventoryItem(inventoryId) {
    await this.getInventoryItem(inventoryId); // Verifica que exista
    await Inventory.delete(inventoryId);
  }

  async checkLowInventory(storeId, threshold = 5) {
    return await Inventory.checkLowStock(storeId, threshold);
  }
}

module.exports = new InventoryService();