/* Importaciones de librerías internas */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

const app = express();

app.use(morgan('dev')); 
app.use(cors({ origin: true, credentials: true }));

// Webhook Stripe: body RAW obligatorio (antes de bodyParser.json)
const pagoController = require('./controllers/pago.controller');
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json', limit: '2mb' }),
  (req, res, next) => {
    if (!Buffer.isBuffer(req.body)) {
      console.error(
        'Webhook Stripe: el body no llegó como buffer. Revisar proxy/gateway.',
      );
    }
    next();
  },
  pagoController.stripeWebhook,
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
routes(app);

module.exports = app;