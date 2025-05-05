const db = require('../db/connection');

const obtenerCategorias = async (req, res) => {
  const [rows] = await db.execute('SELECT DISTINCT categoria FROM Producto WHERE categoria IS NOT NULL');
  res.json(rows.map(row => row.categoria));
};

module.exports = { obtenerCategorias };
