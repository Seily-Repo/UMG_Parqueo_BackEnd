const parqueoRoutes = require('./parqueo.routes');
const espacioRoutes = require('./espacio.routes');
const tipoEspacioRoutes = require('./tipo_espacio.routes'); // <-- AÑADIDO
const asignacionRoutes = require('./asignacion.routes');

/* Función principal de rutas */
const routes = (app) => {
  // Rutas del sistema
  app.use('/api/parqueos', parqueoRoutes);
  app.use('/api/tipo-espacios', tipoEspacioRoutes); // <-- AÑADIDO
  app.use('/api/espacios', espacioRoutes);
  app.use('/api/asignacion', asignacionRoutes);
};

module.exports = routes;