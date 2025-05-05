const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Crear una nueva tienda
router.post('/', async (req, res) => {
  const { nombre, direccion, id_dueño } = req.body;
  const sql = `INSERT INTO Tienda (nombre, direccion, id_dueño) VALUES (?, ?, ?)`;

  try {
    const [result] = await db.query(sql, [nombre, direccion, id_dueño]);
    res.json({ mensaje: 'Tienda creada exitosamente', id_tienda: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la tienda' });
  }
});

// Obtener todas las tiendas
router.get('/', async (req, res) => {
  const sql = `SELECT t.*, u.nombre AS nombre_dueño FROM Tienda t JOIN Usuario u ON t.id_dueño = u.id_usuario`;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las tiendas' });
  }
});

// Obtener una tienda por su ID
router.get('/:idTienda', async (req, res) => {
  const { idTienda } = req.params;
  const sql = `SELECT t.*, u.nombre AS nombre_dueño FROM Tienda t JOIN Usuario u ON t.id_dueño = u.id_usuario WHERE id_tienda = ?`;

  try {
    const [results] = await db.query(sql, [idTienda]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la tienda' });
  }
});

// Actualizar información de una tienda
router.put('/:idTienda', async (req, res) => {
  const { idTienda } = req.params;
  const { nombre, direccion, id_dueño } = req.body;
  const sql = `UPDATE Tienda SET nombre = ?, direccion = ?, id_dueño = ? WHERE id_tienda = ?`;

  try {
    const [result] = await db.query(sql, [nombre, direccion, id_dueño, idTienda]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json({ mensaje: 'Tienda actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la tienda' });
  }
});

// Eliminar una tienda
router.delete('/:idTienda', async (req, res) => {
  const { idTienda } = req.params;
  const sql = `DELETE FROM Tienda WHERE id_tienda = ?`;

  try {
    const [result] = await db.query(sql, [idTienda]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }
    res.json({ mensaje: 'Tienda eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tienda' });
  }
});

module.exports = router;