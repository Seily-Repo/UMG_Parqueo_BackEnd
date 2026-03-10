/* Componentes */
const test = require('./test.network');

const routes = (app) => {
  app.use('/test', test);
};

module.exports = routes;
