const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // Buscar usuario por email y contraseña
    const [users] = await db.query(
      'SELECT id_usuario, nombre, email FROM Usuario WHERE email = ? AND contraseña = ?', 
      [email, contraseña]
    );

    if (users.length > 0) {
      // Login exitoso
      res.json({
        success: true,
        user: users[0] // Devuelve solo los datos básicos
      });
    } else {
      // Credenciales incorrectas
      res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el login'
    });
  }
});

module.exports = router;