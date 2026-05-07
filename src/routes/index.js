const catalogoRoutes = require('./catalogo.routes');
const authRoutes = require('./auth.routes');
const vehiculoRoutes = require('./vehiculo.routes');
const pagoRoutes = require('./pago.routes');
const adminRoutes = require('./admin.routes');

const routes = (app) => {
  // Ruta raíz de health check
  app.get('/', (req, res) => {
    res.json({ mensaje: "Conexion exitosa a Oracle 21c (Esquema Oficial: INFRA_DEV)" });
  });

  // Catálogos (públicos)
  app.use('/api', catalogoRoutes);

  // Autenticación
  app.use('/api/auth', authRoutes);

  // Vehículos
  app.use('/api/vehiculos', vehiculoRoutes);

  // Pagos (consulta estudiante)
  app.use('/api/pagos', pagoRoutes);

  // Panel de administración
  app.use('/api/admin', adminRoutes);
};

module.exports = routes;
