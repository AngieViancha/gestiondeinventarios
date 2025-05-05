const db = require('../db/connection');

class Inventory {
  static async getByStore(storeId) {
    const [rows] = await db.query(`
      SELECT i.id_inventario, p.id_producto, p.nombre, p.descripcion, p.categoria, p.precio, 
             i.cantidad_stock, t.nombre AS nombre_tienda
      FROM Inventario i
      JOIN Producto p ON i.id_producto = p.id_producto
      JOIN Tienda t ON i.id_tienda = t.id_tienda
      WHERE i.id_tienda = ?`, [storeId]);
    return rows;
  }

  static async getById(inventoryId) {
    const [rows] = await db.query(`
      SELECT i.*, p.nombre, p.descripcion, p.categoria, p.precio
      FROM Inventario i
      JOIN Producto p ON i.id_producto = p.id_producto
      WHERE i.id_inventario = ?`, [inventoryId]);
    return rows[0] || null;
  }

  static async create({ id_tienda, id_producto, cantidad_stock }) {
    const [result] = await db.query(
      'INSERT INTO Inventario (id_tienda, id_producto, cantidad_stock) VALUES (?, ?, ?)',
      [id_tienda, id_producto, cantidad_stock]
    );
    return this.getById(result.insertId);
  }

  static async update(inventoryId, { cantidad_stock }) {
    await db.query(
      'UPDATE Inventario SET cantidad_stock = ? WHERE id_inventario = ?',
      [cantidad_stock, inventoryId]
    );
    return this.getById(inventoryId);
  }

  static async delete(inventoryId) {
    await db.query('DELETE FROM Inventario WHERE id_inventario = ?', [inventoryId]);
  }

  static async checkLowStock(storeId, threshold = 5) {
    const [rows] = await db.query(`
      SELECT i.id_inventario, p.nombre, i.cantidad_stock
      FROM Inventario i
      JOIN Producto p ON i.id_producto = p.id_producto
      WHERE i.id_tienda = ? AND i.cantidad_stock < ?`, [storeId, threshold]);
    return rows;
  }
}

module.exports = Inventory;