const db = require("../config/db");

exports.getReporteGerencial = async (req, res) => {
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
      type: db.QueryTypes.SELECT,
    });

    res.json(results);
  } catch (error) {
    console.error("Error en getReporteGerencial:", error);
    res.status(500).send("Error en el servidor");
  }
};

exports.getReporteAdministrativo = async (req, res) => {
  let connection;

  try {
    const { fecha_inicio, fecha_fin } = req.query;

    connection = await db.getConnection(dbConfig);

    let filtroFecha = "WHERE 1=1";
    let params = {};

    if (fecha_inicio && fecha_fin) {
      filtroFecha += ` AND fecha_hora_entrada BETWEEN 
        TO_TIMESTAMP(:fecha_inicio, 'YYYY-MM-DD"T"HH24:MI') 
        AND 
        TO_TIMESTAMP(:fecha_fin, 'YYYY-MM-DD"T"HH24:MI')`;

      params = { fecha_inicio, fecha_fin };
    }

    const query = `
      SELECT
        -- Usuarios totales (no dependen de fecha)
        (SELECT COUNT(*) FROM USUARIOS) AS total_usuarios,

        -- Usuarios activos basados en accesos (RESPONDEN AL FILTRO)
        (SELECT COUNT(DISTINCT carne_usuario)
         FROM REGISTRO_ACCESOS
         ${filtroFecha}
         AND acceso_permitido = 1
        ) AS usuarios_activos,

        -- Usuarios inactivos (estado del sistema)
        (SELECT COUNT(*) FROM USUARIOS WHERE activo = 0) AS usuarios_inactivos,

        -- Accesos
        (SELECT COUNT(*) FROM REGISTRO_ACCESOS ${filtroFecha}) AS total_accesos,

        (SELECT COUNT(*) FROM REGISTRO_ACCESOS 
         ${filtroFecha}
         AND acceso_permitido = 1
        ) AS accesos_permitidos,

        (SELECT COUNT(*) FROM REGISTRO_ACCESOS 
         ${filtroFecha}
         AND acceso_permitido = 0
        ) AS accesos_denegados,

        -- Otros datos
        (SELECT COUNT(*) FROM VEHICULOS) AS total_vehiculos,
        (SELECT COUNT(*) FROM TARJETAS_ACCESO) AS total_tarjetas,
        (SELECT COUNT(*) FROM TARJETAS_ACCESO WHERE activa = 1) AS tarjetas_activas,

        -- Último acceso filtrado
        (SELECT MAX(fecha_hora_entrada) FROM REGISTRO_ACCESOS ${filtroFecha}) AS ultimo_acceso

      FROM DUAL
    `;

    const result = await connection.execute(query, params);
    const data = result.rows[0];

    res.json({
      total_usuarios: data[0],
      usuarios_activos: data[1],
      usuarios_inactivos: data[2],
      total_accesos: data[3],
      accesos_permitidos: data[4],
      accesos_denegados: data[5],
      total_vehiculos: data[6],
      total_tarjetas: data[7],
      tarjetas_activas: data[8],
      ultimo_acceso: data[9],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  } finally {
    if (connection) await connection.close();
  }
};

exports.getReporteFinanciero = async (req, res) => {
    try {
    const { tipo, fecha } = req.query;

    let filtro = "";

    if (tipo === "dia") {
  filtro = `
    A.AS_FechaAsignacion >= TO_DATE('${fecha}','YYYY-MM-DD')
    AND A.AS_FechaAsignacion < TO_DATE('${fecha}','YYYY-MM-DD') + 1
  `;
}

    if (tipo === "mes") {
      filtro = `EXTRACT(MONTH FROM A.AS_FechaAsignacion) = ${fecha.split("-")[1]} 
                AND EXTRACT(YEAR FROM A.AS_FechaAsignacion) = ${fecha.split("-")[0]}`;
    }

    if (tipo === "anio") {
      filtro = `EXTRACT(YEAR FROM A.AS_FechaAsignacion) = ${fecha}`;
    }

    if (tipo === "semana") {
      filtro = `TRUNC(A.AS_FechaAsignacion, 'IW') = TRUNC(TO_DATE('${fecha}','YYYY-MM-DD'), 'IW')`;
    }

    const query = `
      SELECT 
        U.US_Nombre,
        U.US_Apellido,
        V.VH_Placa,
        P.PQ_Nombre,
        A.AS_FechaAsignacion
      FROM DP_ASIGNACION A
      JOIN DP_USUARIO U ON A.US_Identificacion = U.US_Identificacion
      LEFT JOIN DP_VEHICULO V ON U.US_Identificacion = V.US_Identificacion
      JOIN DP_ESPACIO E ON A.ES_Espacio = E.ES_Espacio
      JOIN DP_PARQUEO P ON E.PQ_Parqueo = P.PQ_Parqueo
      ${filtro ? "WHERE " + filtro : ""}
      ORDER BY A.AS_FechaAsignacion DESC
    `;

    const conn = await conectar();
    const result = await conn.execute(query, [], {
      outFormat: require("oracledb").OUT_FORMAT_OBJECT,
    });

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error en reporte");
  }
}