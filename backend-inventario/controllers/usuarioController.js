const bcrypt = require('bcrypt');
const db = require('../db/connection');

// Registrar nuevo usuario
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    // Validación
    if (!nombre || !email || !contraseña || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el email ya existe
    const [usuarioExistente] = await db.query(
      'SELECT id_usuario FROM Usuario WHERE email = ?',
      [email]
    );
    
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado.' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar nuevo usuario
    const [result] = await db.query(
      'INSERT INTO Usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json({ 
      mensaje: 'Usuario creado exitosamente', 
      id_usuario: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contraseña, rol } = req.body;

    // Validación
    if (!nombre || !email || !rol) {
      return res.status(400).json({ mensaje: 'Nombre, email y rol son obligatorios.' });
    }

    // Verificar si el usuario existe
    const [usuario] = await db.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Verificar si el email ya existe (para otro usuario)
    const [emailExistente] = await db.query(
      'SELECT id_usuario FROM Usuario WHERE email = ? AND id_usuario != ?',
      [email, id]
    );
    
    if (emailExistente.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado por otro usuario.' });
    }

    // Actualizar usuario (con o sin contraseña)
    if (contraseña) {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      await db.query(
        'UPDATE Usuario SET nombre = ?, email = ?, contraseña = ?, rol = ? WHERE id_usuario = ?',
        [nombre, email, hashedPassword, rol, id]
      );
    } else {
      await db.query(
        'UPDATE Usuario SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?',
        [nombre, email, rol, id]
      );
    }

    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id_usuario, nombre, email, rol FROM Usuario'
    );
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [usuario] = await db.query(
      'SELECT id_usuario, nombre, email, rol FROM Usuario WHERE id_usuario = ?',
      [id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    res.json(usuario[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const [usuario] = await db.query(
      'SELECT id_usuario FROM Usuario WHERE id_usuario = ?',
      [id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Eliminar usuario
    await db.query(
      'DELETE FROM Usuario WHERE id_usuario = ?',
      [id]
    );
    
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
};