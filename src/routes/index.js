const reportesRoutes = require('./reportes.routes');

const routes = (app) => {
  app.use('', reportesRoutes);
};

module.exports = routes;
