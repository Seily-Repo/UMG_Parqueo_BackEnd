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

module.exports = { limpiarCarne, formatearCarne };
