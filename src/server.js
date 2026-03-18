/* Cargar variables de entorno PRIMERO */
require('dotenv').config();
require('dotenv').config();

/* Importaciones */
const app = require('./app');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const db = require('./config/db'); 

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await db.initialize();
        
        app.listen(PORT, () => {

            console.log(`http://localhost:${PORT}`);
            console.log(`http://localhost:${PORT}/api-docs`);

        });
    } catch (error) {
        console.error(' Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();

process.on('SIGINT', async () => {
    console.log('\nCerrando el servidor y conexiones...');
    await db.close();
    process.exit(0);
});