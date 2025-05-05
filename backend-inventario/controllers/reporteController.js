const db = require('../db/connection');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// Helper para manejar errores de la base de datos
const handleDbError = (error, res) => {
  console.error('Error en la base de datos:', error);
  return res.status(500).json({
    success: false,
    message: 'Error en la base de datos',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    sqlError: process.env.NODE_ENV === 'development' ? error.sqlMessage : undefined
  });
};

// Obtener todos los reportes
exports.obtenerReportes = async (req, res) => {
  try {
    const { id_tienda } = req.query;
    
    let query = `
      SELECT 
        r.id_reporte, 
        r.tipo, 
        r.contenido, 
        r.fecha_generacion,
        r.id_usuario,
        r.id_tienda,
        u.nombre AS usuario_nombre, 
        t.nombre AS tienda_nombre
      FROM Reporte r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Tienda t ON r.id_tienda = t.id_tienda
    `;
    
    const params = [];
    
    if (id_tienda) {
      query += ' WHERE r.id_tienda = ?';
      params.push(id_tienda);
    }
    
    query += ' ORDER BY r.fecha_generacion DESC';
    
    const [reportes] = await db.query(query, params);
    
    // Formatear fechas para una mejor visualización
    const reportesFormateados = reportes.map(reporte => ({
      ...reporte,
      fecha_formateada: format(new Date(reporte.fecha_generacion), 'PPPpp', { locale: es })
    }));
    
    res.json({
      success: true,
      data: reportesFormateados
    });
  } catch (error) {
    handleDbError(error, res);
  }
};

// Obtener un reporte por ID
exports.obtenerReportePorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [reporte] = await db.query(`
      SELECT 
        r.id_reporte, 
        r.tipo, 
        r.contenido, 
        r.fecha_generacion,
        r.id_usuario,
        r.id_tienda,
        u.nombre AS usuario_nombre, 
        t.nombre AS tienda_nombre
      FROM Reporte r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Tienda t ON r.id_tienda = t.id_tienda
      WHERE r.id_reporte = ?
    `, [id]);
    
    if (reporte.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    
    // Formatear fecha
    const reporteFormateado = {
      ...reporte[0],
      fecha_formateada: format(new Date(reporte[0].fecha_generacion), 'PPPpp', { locale: es })
    };
    
    res.json({
      success: true,
      data: reporteFormateado
    });
  } catch (error) {
    handleDbError(error, res);
  }
};

// Crear un nuevo reporte
exports.generarReporte = async (req, res) => {
  // Validar que existe el body
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No se recibieron datos en la solicitud'
    });
  }

  try {
    const { tipo, contenido, id_usuario, id_tienda } = req.body;

    // Validación de campos
    const errores = [];
    if (!tipo) errores.push('El tipo de reporte es requerido');
    if (!contenido?.trim()) errores.push('El contenido es requerido');
    if (!id_usuario) errores.push('El ID de usuario es requerido');
    
    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errores
      });
    }

    // Verificar que el usuario existe
    const [usuario] = await db.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?', 
      [id_usuario]
    );
    
    if (usuario.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario especificado no existe'
      });
    }

    // Verificar que la tienda existe (si se proporciona)
    if (id_tienda) {
      const [tienda] = await db.query(
        'SELECT id_tienda FROM Tienda WHERE id_tienda = ?', 
        [id_tienda]
      );
      if (tienda.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La tienda especificada no existe'
        });
      }
    }

    // Insertar el reporte
    const [result] = await db.query(
      `INSERT INTO Reporte 
      (tipo, contenido, id_usuario, id_tienda, fecha_generacion) 
      VALUES (?, ?, ?, ?, NOW())`,
      [tipo, contenido.trim(), id_usuario, id_tienda || null]
    );

    // Obtener el reporte recién creado con datos relacionados
    const [nuevoReporte] = await db.query(`
      SELECT 
        r.*, 
        u.nombre AS usuario_nombre, 
        t.nombre AS tienda_nombre
      FROM Reporte r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Tienda t ON r.id_tienda = t.id_tienda
      WHERE r.id_reporte = ?
    `, [result.insertId]);

    // Formatear fecha
    const reporteFormateado = {
      ...nuevoReporte[0],
      fecha_formateada: format(new Date(nuevoReporte[0].fecha_generacion), 'PPPpp', { locale: es })
    };

    res.status(201).json({
      success: true,
      data: reporteFormateado
    });

  } catch (error) {
    handleDbError(error, res);
  }
};

// Actualizar un reporte existente
exports.actualizarReporte = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No se recibieron datos para actualizar'
    });
  }

  try {
    const { id } = req.params;
    const { tipo, contenido, id_tienda } = req.body;

    // Verificar que el reporte existe
    const [reporteExistente] = await db.query(
      'SELECT id_reporte FROM Reporte WHERE id_reporte = ?',
      [id]
    );
    
    if (reporteExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Verificar que la tienda existe (si se proporciona)
    if (id_tienda) {
      const [tienda] = await db.query(
        'SELECT id_tienda FROM Tienda WHERE id_tienda = ?', 
        [id_tienda]
      );
      if (tienda.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La tienda especificada no existe'
        });
      }
    }

    // Construir la consulta dinámica
    const campos = [];
    const valores = [];
    
    if (tipo) {
      campos.push('tipo = ?');
      valores.push(tipo);
    }
    
    if (contenido) {
      campos.push('contenido = ?');
      valores.push(contenido.trim());
    }
    
    if (id_tienda !== undefined) {
      campos.push('id_tienda = ?');
      valores.push(id_tienda || null);
    }
    
    if (campos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    valores.push(id);
    
    await db.query(
      `UPDATE Reporte SET ${campos.join(', ')} WHERE id_reporte = ?`,
      valores
    );

    // Obtener el reporte actualizado
    const [reporteActualizado] = await db.query(`
      SELECT 
        r.*, 
        u.nombre AS usuario_nombre, 
        t.nombre AS tienda_nombre
      FROM Reporte r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Tienda t ON r.id_tienda = t.id_tienda
      WHERE r.id_reporte = ?
    `, [id]);

    // Formatear fecha
    const reporteFormateado = {
      ...reporteActualizado[0],
      fecha_formateada: format(new Date(reporteActualizado[0].fecha_generacion), 'PPPpp', { locale: es })
    };

    res.json({
      success: true,
      data: reporteFormateado
    });

  } catch (error) {
    handleDbError(error, res);
  }
};

// Eliminar un reporte
exports.eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el reporte existe
    const [reporte] = await db.query(
      'SELECT id_reporte FROM Reporte WHERE id_reporte = ?',
      [id]
    );
    
    if (reporte.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    
    // Eliminar el reporte
    await db.query(
      'DELETE FROM Reporte WHERE id_reporte = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Reporte eliminado correctamente'
    });
  } catch (error) {
    handleDbError(error, res);
  }
};

// Descargar reporte en formato de texto
exports.descargarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el reporte con información relacionada
    const [reporte] = await db.query(`
      SELECT 
        r.tipo, 
        r.contenido, 
        r.fecha_generacion,
        u.nombre AS usuario_nombre, 
        t.nombre AS tienda_nombre
      FROM Reporte r
      JOIN Usuario u ON r.id_usuario = u.id_usuario
      LEFT JOIN Tienda t ON r.id_tienda = t.id_tienda
      WHERE r.id_reporte = ?
    `, [id]);
    
    if (reporte.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }
    
    const datosReporte = reporte[0];
    const fechaFormateada = format(new Date(datosReporte.fecha_generacion), 'PPPpp', { locale: es });
    
    // Configurar headers para descarga
    res.setHeader('Content-disposition', `attachment; filename=reporte-${id}.txt`);
    res.setHeader('Content-type', 'text/plain');
    
    // Crear contenido del reporte
    const contenido = `
      ===== REPORTE #${id} =====
      
      Tipo: ${datosReporte.tipo}
      Tienda: ${datosReporte.tienda_nombre || 'No especificada'}
      Generado por: ${datosReporte.usuario_nombre}
      Fecha: ${fechaFormateada}
      
      Contenido:
      ${datosReporte.contenido}
      
      ===== FIN DEL REPORTE =====
    `;
    
    res.send(contenido);
  } catch (error) {
    handleDbError(error, res);
  }
};