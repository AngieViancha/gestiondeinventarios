const db = require('../db/connection');

const registrarVenta = async (req, res) => {
  const { id_usuario, id_tienda, productos } = req.body;

  // Validación básica
  if (!id_usuario || !id_tienda || !productos || !Array.isArray(productos)) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos o inválidos'
    });
  }

  try {
    await db.beginTransaction();

    // 1. Calcular total
    const total = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    // 2. Insertar venta principal
    const [ventaResult] = await db.query(
      'INSERT INTO Venta (id_usuario, id_tienda, total) VALUES (?, ?, ?)',
      [id_usuario, id_tienda, total]
    );
    const id_venta = ventaResult.insertId;

    // 3. Procesar cada producto
    for (const producto of productos) {
      // Validar existencia del producto
      const [productoExistente] = await db.query(
        'SELECT id_producto, precio, cantidad_stock FROM Producto WHERE id_producto = ?',
        [producto.id_producto]
      );

      if (!productoExistente || productoExistente.length === 0) {
        throw new Error(`Producto ${producto.id_producto} no encontrado`);
      }

      // Validar stock
      if (productoExistente[0].cantidad_stock < producto.cantidad) {
        throw new Error(`Stock insuficiente para el producto ${producto.id_producto}`);
      }

      // Insertar detalle
      await db.query(
        'INSERT INTO DetalleVenta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [
          id_venta,
          producto.id_producto,
          producto.cantidad,
          producto.precio,
          producto.precio * producto.cantidad
        ]
      );

      // Actualizar stock
      await db.query(
        'UPDATE Producto SET cantidad_stock = cantidad_stock - ? WHERE id_producto = ?',
        [producto.cantidad, producto.id_producto]
      );
    }

    await db.commit();
    
    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      id_venta
    });

  } catch (error) {
    await db.rollback();
    console.error('Error en registrarVenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la venta',
      error: error.message, // Detalle del error
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const obtenerVentas = async (req, res) => {
  try {
    const [ventas] = await db.query(`
      SELECT 
        v.id_venta,
        v.fecha,
        v.total,
        u.nombre AS nombre_usuario,
        t.nombre AS nombre_tienda
      FROM Venta v
      JOIN Usuario u ON v.id_usuario = u.id_usuario
      JOIN Tienda t ON v.id_tienda = t.id_tienda
      ORDER BY v.fecha DESC
    `);

    res.json({
      success: true,
      data: ventas
    });

  } catch (error) {
    console.error('Error en obtenerVentas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas'
    });
  }
};

const obtenerVentaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener venta principal
    const [venta] = await db.query(`
      SELECT 
        v.*,
        u.nombre AS nombre_usuario,
        t.nombre AS nombre_tienda
      FROM Venta v
      JOIN Usuario u ON v.id_usuario = u.id_usuario
      JOIN Tienda t ON v.id_tienda = t.id_tienda
      WHERE v.id_venta = ?
    `, [id]);

    if (venta.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Venta no encontrada' 
      });
    }

    // Obtener detalles
    const [detalles] = await db.query(`
      SELECT 
        dv.*,
        p.nombre AS nombre_producto,
        p.precio AS precio_unitario
      FROM DetalleVenta dv
      JOIN Producto p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...venta[0],
        detalles: detalles || []
      }
    });

  } catch (error) {
    console.error('Error en obtenerVentaPorId:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la venta',
      error: error.message
    });
  }
};

const eliminarVenta = async (req, res) => {
  const { id } = req.params;

  try {
    await db.beginTransaction();

    // 1. Restaurar stock
    const [detalles] = await db.query(
      'SELECT id_producto, cantidad FROM DetalleVenta WHERE id_venta = ?',
      [id]
    );

    for (const detalle of detalles) {
      await db.query(
        'UPDATE Producto SET cantidad_stock = cantidad_stock + ? WHERE id_producto = ?',
        [detalle.cantidad, detalle.id_producto]
      );
    }

    // 2. Eliminar detalles
    await db.query(
      'DELETE FROM DetalleVenta WHERE id_venta = ?',
      [id]
    );

    // 3. Eliminar venta
    const [result] = await db.query(
      'DELETE FROM Venta WHERE id_venta = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await db.rollback();
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    await db.commit();
    
    res.json({
      success: true,
      message: 'Venta eliminada correctamente'
    });

  } catch (error) {
    await db.rollback();
    console.error('Error en eliminarVenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la venta'
    });
  }
};

module.exports = {
  registrarVenta,
  obtenerVentas,
  obtenerVentaPorId,
  eliminarVenta
};