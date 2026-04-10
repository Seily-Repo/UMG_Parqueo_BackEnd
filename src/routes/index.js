const reportesRoutes = require('./reportes.routes');

const routes = (app) => {
  app.use('/api/reportes', reportesRoutes);
};

module.exports = routes;
