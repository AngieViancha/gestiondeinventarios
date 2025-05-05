const db = require('../db/connection');

const resumenDashboard = async (req, res) => {
  try {
    // Consultas ajustadas a la estructura actual de la BD
    const [
      ventasMes,
      productosVendidosMes,
      productoMasVendido,
      stockBajo,
      usuarios,
      ventasPorTienda
    ] = await Promise.all([
      // 1. Ventas del mes actual
      db.query(`
        SELECT 
          IFNULL(SUM(total), 0) AS total_ventas_mes,
          COUNT(*) AS cantidad_ventas
        FROM Venta
        WHERE MONTH(fecha) = MONTH(CURDATE()) 
        AND YEAR(fecha) = YEAR(CURDATE())
      `),
      
      // 2. Total productos vendidos este mes
      db.query(`
        SELECT IFNULL(SUM(dv.cantidad), 0) AS productos_vendidos
        FROM DetalleVenta dv
        JOIN Venta v ON v.id_venta = dv.id_venta
        WHERE MONTH(v.fecha) = MONTH(CURDATE())
        AND YEAR(v.fecha) = YEAR(CURDATE())
      `),
      
      // 3. Producto más vendido (sin imagen)
      db.query(`
        SELECT 
          p.nombre, 
          p.id_producto,
          IFNULL(SUM(dv.cantidad), 0) AS cantidad
        FROM DetalleVenta dv
        JOIN Producto p ON p.id_producto = dv.id_producto
        JOIN Venta v ON v.id_venta = dv.id_venta
        WHERE MONTH(v.fecha) = MONTH(CURDATE())
        GROUP BY p.id_producto
        ORDER BY cantidad DESC
        LIMIT 1
      `),
      
      // 4. Productos con stock bajo (usando valor fijo 5 como mínimo)
      db.query(`
        SELECT 
          p.nombre, 
          p.id_producto,
          i.cantidad_stock,
          5 AS stock_minimo
        FROM Inventario i
        JOIN Producto p ON i.id_producto = p.id_producto
        WHERE i.cantidad_stock < 5
        LIMIT 5
      `),
      
      // 5. Total de usuarios registrados
      db.query(`SELECT COUNT(*) AS total_usuarios FROM Usuario`),
      
      // 6. Ventas por tienda este mes
      db.query(`
        SELECT 
          t.nombre AS tienda,
          IFNULL(SUM(v.total), 0) AS total_ventas
        FROM Venta v
        JOIN Tienda t ON t.id_tienda = v.id_tienda
        WHERE MONTH(v.fecha) = MONTH(CURDATE())
        GROUP BY t.id_tienda
        ORDER BY total_ventas DESC
        LIMIT 5
      `)
    ]);

    console.log("Datos a enviar:", { // ← Agrega este console.log
      ventas_mes: ventasMes[0],
      productos_vendidos: productosVendidosMes[0],
      producto_mas_vendido: productoMasVendido[0],
      stockBajo: stockBajo,
      usuarios: usuarios[0],
      ventasPorTienda: ventasPorTienda
    });

    res.json({
      success: true,
      data: {
        ventas_mes: {
          total: ventasMes[0]?.total_ventas_mes || 0,
          cantidad: ventasMes[0]?.cantidad_ventas || 0
        },
        productos_vendidos: productosVendidosMes[0]?.productos_vendidos || 0,
        producto_mas_vendido: productoMasVendido[0] || null,
        productos_stock_bajo: stockBajo || [],
        usuarios: {
          total: usuarios[0]?.total_usuarios || 0
        },
        ventas_por_tienda: ventasPorTienda || []
      }
    });
  } catch (error) {
    console.error('Error en resumenDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};


// Gráfico de ventas de los últimos 7 días
const ventasUltimos7Dias = async (req, res) => {
  try {
    const [ventas] = await db.query(`
      SELECT 
        DATE(v.fecha) AS fecha, 
        IFNULL(SUM(v.total), 0) AS total_dia,
        COUNT(v.id_venta) AS cantidad_ventas
      FROM Venta v
      WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(v.fecha)
      ORDER BY fecha ASC
    `);

    res.json({
      success: true,
      data: ventas[0] || [] // Asegurar que siempre devuelve un array
    });
  } catch (error) {
    console.error('Error en ventasUltimos7Dias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas recientes',
      error: error.message
    });
  }
};

module.exports = { resumenDashboard, ventasUltimos7Dias };