// Importar rutas de módulos
const estudianteRoutes = require('./estudiante.routes');
const multaRoutes = require('./multa.routes');
const pagoRoutes = require('./pago.routes'); 

const routes = (app) => {

  app.use('/api/estudiantes', estudianteRoutes);
  app.use('/api/multa', multaRoutes);
  app.use('/api/pago', pagoRoutes); 
};

module.exports = routes;