const db = require('../db/connection');

const obtenerProductos = async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM producto');
  res.json(rows);
};

const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute(
    'SELECT * FROM producto WHERE id_producto = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  res.json(rows[0]);
};

const crearProducto = async (req, res) => {
  const { nombre, descripcion, categoria, precio } = req.body;
  await db.execute(
    'INSERT INTO producto (nombre, descripcion, categoria, precio) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, categoria, precio]
  );
  res.status(201).json({ mensaje: 'Producto creado correctamente' });
};

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria, precio } = req.body;
  await db.execute(
    'UPDATE producto SET nombre = ?, descripcion = ?, categoria = ?, precio = ? WHERE id_producto = ?',
    [nombre, descripcion, categoria, precio, id]
  );
  res.json({ mensaje: 'Producto actualizado correctamente' });
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM producto WHERE id_producto = ?', [id]);
  res.json({ mensaje: 'Producto eliminado correctamente' });
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
