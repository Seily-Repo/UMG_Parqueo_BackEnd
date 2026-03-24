// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
};

module.exports = routes;