// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');
const multaRoutes = require('./multa.routes');
const estudianteMultaRoutes = require('./estudiante_multa.routes');
const formaPagoRoutes = require('./forma_pago.routes');

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
  app.use('/api/multa', multaRoutes);
  app.use('/api/estudiante_multa', estudianteMultaRoutes);

  app.use('/api/forma_pago', formaPagoRoutes);
};

module.exports = routes;