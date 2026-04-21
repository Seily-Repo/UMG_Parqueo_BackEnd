const parqueoRoutes = require('./parqueo.routes');
const espacioRoutes = require('./espacio.routes');
const tipoEspacioRoutes = require('./tipo_espacio.routes'); 
const asignacionRoutes = require('./asignacion.routes');
//const verificarToken = require('../middleware/middleware.JWT.JS');

const routes = (app) => {

  app.use('/api/parqueos', parqueoRoutes);
  app.use('/api/tipo-espacios', tipoEspacioRoutes); 
  app.use('/api/espacios', espacioRoutes);
  app.use('/api/asignacion', asignacionRoutes);
};

module.exports = routes;