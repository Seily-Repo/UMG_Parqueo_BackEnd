// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');
const multaRoutes = require('./multa.routes');
const pagoRoutes = require('./pago.routes');
const estudianteMultaRoutes = require('./estudiante_multa.routes');
const estudianteMorosoRoutes = require('./estudiante_moroso.routes');
const formaPagoRoutes = require('./forma_pago.routes');
const planParqueoRoutes = require('./plan_parqueo.routes');

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
  app.use('/api/multa', multaRoutes);
  app.use('/api/pago', pagoRoutes); 
  app.use('/api/estudiante_multa', estudianteMultaRoutes);
  app.use('/api/estudiante_moroso', estudianteMorosoRoutes);
  app.use('/api/plan_parqueo', planParqueoRoutes);
  app.use('/api/forma_pago', formaPagoRoutes);
};

module.exports = routes;