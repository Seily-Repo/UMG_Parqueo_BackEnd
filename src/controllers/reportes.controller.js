const db = require('../config/db');

exports.getReporteFinanciero = async (req, res) => {
  try {
    const query = `
      SELECT U.US_Nombre, U.US_Apellido, V.VH_Placa, P.PQ_Nombre AS Parqueo,
             E.ES_Numero AS Numero_Espacio, S.SM_Anio AS Anio, S.SM_Periodo AS Semestre
      FROM DP_ASIGNACION A
      JOIN DP_USUARIO U ON A.US_Identificacion = U.US_Identificacion
      JOIN DP_VEHICULO V ON U.US_Identificacion = V.US_Identificacion
      JOIN DP_ESPACIO E ON A.ES_Espacio = E.ES_Espacio
      JOIN DP_PARQUEO P ON E.PQ_Parqueo = P.PQ_Parqueo
      JOIN DP_SEMESTRE S ON A.SM_Semestre = S.SM_Semestre
    `;

    const [results, metadata] = await db.query(query, {
      type: db.QueryTypes.SELECT 
    });

    res.json(results);
  } catch (error) {
    console.error('Error en getReporteFinanciero:', error);
    res.status(500).send("Error en el servidor");
  }
};
