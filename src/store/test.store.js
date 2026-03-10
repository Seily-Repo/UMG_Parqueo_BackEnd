const model = require('../model/test.model');

// Funciona para listar la cuenta ya en moongo
/*async function listAllTest(filter = {}) {
  return await model.find(filter).sort({ fecha_creacion: -1 });
}*/

// Funciona para listar la cuenta ya en moongo
async function listAllTest() {
  return new Promise((resolve, reject) => {
    const testModel = {
      id: 1,
      nombre: 'Test',
      tipo: 'Test'
    }
    return resolve(testModel);
  });
}

module.exports = {
  listAllTest
};
