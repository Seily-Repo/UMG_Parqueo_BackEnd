const { listAllTest } = require('../store/test.store');
const RESPONSE = require('../utils/response.utils');

/*async function testget(req, res) {
  await listAllCuentas()
    .then((cuentasEncontradas) => {
      return RESPONSE.success(req, res, cuentasEncontradas, 200);
    })
    .catch((err) => {
      console.log('Error', err);
      return RESPONSE.error(req, res, 'Error interno', 500);
    });
}*/
async function testget(req, res) {
  await listAllTest()
    .then((testEncontrado) => {
      return RESPONSE.success(req, res, testEncontrado, 200);
    })
    .catch((err) => {
      console.log('Error: ', err);
      return RESPONSE.error(req, res, err.message, 500);
    });
}

module.exports = {
  testget,
};