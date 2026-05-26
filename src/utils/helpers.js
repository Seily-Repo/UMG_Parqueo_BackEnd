/**
 * Limpia los guiones del carné para usarlo como número en Oracle.
 * Ej: "0905-23-12345" → 90523123455
 */
const limpiarCarne = (carneConGuiones) => {
  if (!carneConGuiones) return null;
  return parseInt(carneConGuiones.toString().replace(/-/g, ''), 10);
};

/**
 * Formatea un carné numérico a formato con guiones para el frontend.
 * Ej: 905231234 → "0905-23-1234"
 */
const formatearCarne = (carneNumerico) => {
  if (!carneNumerico) return null;
  return carneNumerico.toString().replace(/(\d{4})(\d{2})(\d+)/, '$1-$2-$3');
};

/**
 * Normaliza variantes de tipo de vehículo al bucket usado en CB_PLAN_PARQUEO.
 */
const mapTipoVehiculoToPlanBucket = (tipoVehiculo) => {
  const tipo = (tipoVehiculo || '')
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (['MOTOCICLETA', 'MOTO'].includes(tipo)) return 'MOTO';
  if (['AUTOMOVIL', 'CARRO', 'CAMIONETA', 'OTRO'].includes(tipo)) return 'CARRO';

  return 'CARRO';
};

module.exports = { limpiarCarne, formatearCarne, mapTipoVehiculoToPlanBucket };
