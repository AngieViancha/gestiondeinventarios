const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Registrar los detalles de una venta y descontar inventario
router.post('/', async (req, res) => {
  const { idVenta, productos } = req.body;

  if (!idVenta || !productos || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Datos incompletos o mal formateados' });
  }

  // Verificar stock suficiente
  try {
    for (const producto of productos) {
      const [stockResult] = await db.promise().query(
        'SELECT cantidad FROM Inventario WHERE idProducto = ?',
        [producto.idProducto]
      );

      if (stockResult.length === 0) {
        return res.status(404).json({ error: `Producto con ID ${producto.idProducto} no encontrado` });
      }

      if (stockResult[0].cantidad < producto.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el producto con ID ${producto.idProducto}` });
      }
    }

    // Insertar detalles de la venta
    const detalles = productos.map(producto => [
      idVenta,
      producto.idProducto,
      producto.cantidad,
      producto.precioUnitario,
      producto.cantidad * producto.precioUnitario
    ]);

    const insertSql = `
      INSERT INTO detalle_venta 
      (idVenta, idProducto, cantidad, precioUnitario, subtotal) 
      VALUES ?
    `;

    await db.promise().query(insertSql, [detalles]);

    // Descontar stock en inventario
    for (const producto of productos) {
      await db.promise().query(
        'UPDATE Inventario SET cantidad = cantidad - ? WHERE idProducto = ?',
        [producto.cantidad, producto.idProducto]
      );
    }

    res.json({ mensaje: 'Detalles de venta registrados y stock actualizado correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

// Obtener detalles de una venta por ID
router.get('/:idVenta', (req, res) => {
  const { idVenta } = req.params;

  const sql = `
    SELECT dv.*, i.nombreProducto 
    FROM detalle_venta dv
    INNER JOIN Inventario i ON dv.idProducto = i.idProducto
    WHERE dv.idVenta = ?
  `;

  db.query(sql, [idVenta], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener detalles' });
    res.json(results);
  });
});

module.exports = router;
