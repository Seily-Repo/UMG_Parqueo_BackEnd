// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');
const multaRoutes = require('./multa.routes');

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
  app.use('/api/multa', multaRoutes);
};

module.exports = routes;