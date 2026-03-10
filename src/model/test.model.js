/*const mongoose = require('mongoose');
const Schame = mongoose.Schema;

const CUENTAS = Schame({
  id_cuenta: { type: Number, unique: true, require: true },
  nombre: { type: String, require: true },
  tipo: { type: String, require: true },
  fecha_creacion: {
    type: Date,
    default: Date.now, // Fecha actual por defecto
  },
});

module.exports = mongoose.model('cuentas', CUENTAS);*/

const testModel = {
  id: { type: Number, unique: true, require: true },
  nombre: { type: String, require: true },
  tipo: { type: String, require: true }
}

module.exports = testModel;