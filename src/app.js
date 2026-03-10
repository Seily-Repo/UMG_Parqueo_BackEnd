/* Importaciones de librarias internas */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

/* Funciones de app */
const app = express();

app.use(morgan('dev')); // <= logging de peticiones
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
routes(app);

module.exports = app;