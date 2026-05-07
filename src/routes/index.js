// Importar rutas de módulos
const usuarioRoutes = require('./usuario.routes');
const multaRoutes = require('./multa.routes');
const pagoRoutes = require('./pago.routes');
const usuarioMultaRoutes = require('./usuario_multa.routes');
const usuarioMorosoRoutes = require('./usuario_moroso.routes');
const formaPagoRoutes = require('./forma_pago.routes');
const planParqueoRoutes = require('./plan_parqueo.routes');

// Importar middleware de seguridad
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const routes = (app) => {
  // Rutas accesibles solo por ADMINISTRADOR
  app.use('/api/multa', verifyToken, checkRole(['ADMINISTRADOR']), multaRoutes);
  app.use('/api/usuario_moroso', verifyToken, checkRole(['ADMINISTRADOR']), usuarioMorosoRoutes);
  app.use('/api/plan_parqueo', verifyToken, checkRole(['ADMINISTRADOR']), planParqueoRoutes);
  app.use('/api/forma_pago', verifyToken, checkRole(['ADMINISTRADOR']), formaPagoRoutes);

  // Rutas accesibles por ADMINISTRADOR y USUARIO (Maneja roles internamente)
  app.use('/api/pago', verifyToken, pagoRoutes); 
  app.use('/api/usuario', verifyToken, usuarioRoutes);
  app.use('/api/usuario_multa', verifyToken, usuarioMultaRoutes);
};

module.exports = routes;