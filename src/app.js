/* Importaciones de librerías internas */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

const app = express();

app.use(morgan('dev')); 
app.use(cors({ origin: true, credentials: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'El formato JSON de la solicitud no es válido.',
            details: 'Se detectaron caracteres inválidos, falta de comillas o una estructura JSON mal formada.'
        });
    }
    next();
});

routes(app);

module.exports = app;