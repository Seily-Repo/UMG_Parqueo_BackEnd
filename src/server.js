const app = require('./app');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Documetacion.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Escuchando http://localhost:${PORT}`));