// /models/userModel.js
const bcrypt = require('bcrypt');
const db = require('../db/connection'); // Configuración de base de datos

const User = {
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM Usuario WHERE email = ?', [email], (err, results) => {
      callback(err, results[0]);
    });
  },

  comparePassword: (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },
};

module.exports = User;
