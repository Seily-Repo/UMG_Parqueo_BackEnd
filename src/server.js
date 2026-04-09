/* Cargar variables de entorno PRIMERO */
require('dotenv').config();

/* Importaciones */
const app = require('./app');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const db = require('./config/db'); 
const http = require('http');
const { Server } = require('socket.io');
const { PORT } = require('./config/config');
// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log(`📡 Frontend conectado al tiempo real (ID: ${socket.id})`);
    
    socket.on('disconnect', () => {
        console.log(`❌ Frontend desconectado (ID: ${socket.id})`);
    });
});

async function startServer() {
    try {
        await db.initialize();
        
        server.listen(PORT, () => {
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