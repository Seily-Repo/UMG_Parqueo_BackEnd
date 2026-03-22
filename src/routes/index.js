const parqueoRoutes = require('./parqueo.routes');
const espacioRoutes = require('./espacio.routes');
const semestreRoutes = require('./semestre.routes');
const usuarioRoutes = require('./usuario.routes');
const vehiculoRoutes = require('./vehiculo.routes');
const jornadaRoutes = require('./jornada.routes');
const asignacionRoutes = require('./asignacion.routes');

/* Función principal de rutas */
const routes = (app) => {
  // Rutas del sistema
  app.use('/api/parqueos', parqueoRoutes);
  app.use('/api/espacios', espacioRoutes);
  app.use('/api/semestres', semestreRoutes);
  app.use('/api/usuarios', usuarioRoutes);
  app.use('/api/vehiculos', vehiculoRoutes);
  app.use('/api/jornadas', jornadaRoutes);
  app.use('/api/asignacion',asignacionRoutes)
};

module.exports = routes;