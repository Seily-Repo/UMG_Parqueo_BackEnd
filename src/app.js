const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());

// Registrar todas las rutas
routes(app);

module.exports = app;
