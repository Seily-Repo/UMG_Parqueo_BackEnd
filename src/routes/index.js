// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');
const multaRoutes = require('./multa.routes');
const pagoRoutes = require('./pago.routes');
const usuarioMultaRoutes = require('./usuario_multa.routes');
const usuarioMorosoRoutes = require('./usuario_moroso.routes');
const formaPagoRoutes = require('./forma_pago.routes');
const planParqueoRoutes = require('./plan_parqueo.routes');

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
  app.use('/api/multa', multaRoutes);
  app.use('/api/pago', pagoRoutes); 
  app.use('/api/usuario_multa', usuarioMultaRoutes);
  app.use('/api/usuario_moroso', usuarioMorosoRoutes);
  app.use('/api/plan_parqueo', planParqueoRoutes);
  app.use('/api/forma_pago', formaPagoRoutes);
};

module.exports = routes;