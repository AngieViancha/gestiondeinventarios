const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/producto');
const ventasRoutes = require('./routes/ventas');
const usuarioRoutes = require('./routes/usuarios');
const dashboardRoutes = require('./routes/dashboard');
const detalleVentaRoutes = require('./routes/detalleVenta');
const tiendaRoutes = require('./routes/tienda');
const reporteRoutes = require('./routes/reporte');
const inventoryRoutes = require('./routes/inventoryRoutes');
const categoriaRoutes = require('./routes/categoria');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded
// Antes de tus rutas
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configuración de CORS (si tu frontend está en otro dominio)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));



// Rutas
app.use('/api/productos', productosRoutes); 
app.use('/api/ventas', ventasRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/detalle-venta', detalleVentaRoutes);
app.use('/api/tienda', tiendaRoutes);
app.use('/api/reporte', reporteRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
