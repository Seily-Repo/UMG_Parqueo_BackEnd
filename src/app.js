/* Importaciones de librerías internas */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

const app = express();

app.use(morgan('dev')); 
app.use(cors({ origin: true, credentials: true }));

// Endpoint para los Webhooks de Stripe (debe parsear como RAW)
const pagoController = require('./controllers/pago.controller');
app.post('/api/webhook', express.raw({ type: 'application/json' }), pagoController.stripeWebhook);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
routes(app);

module.exports = app;