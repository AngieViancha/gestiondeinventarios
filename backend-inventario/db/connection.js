const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host:'localhost' ,
  user: 'root',
  password: '020350',
  database: 'sistema_inventario_tiendas',
  waitForConnections: true, // Para que espere conexiones si el pool está lleno
  connectionLimit: 10,      // Puedes ajustar el límite de conexiones simultáneas
  queueLimit: 0 
});


module.exports = connection;
