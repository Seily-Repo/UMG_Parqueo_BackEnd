const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");

exports.getReporteGerencial = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let filtroAccesos = "";
    let replacements = {};

    if (fecha_inicio && fecha_fin) {
      filtroAccesos = `AND REA_FECHA_ENTRADA BETWEEN 
        TO_DATE(:fecha_inicio, 'YYYY-MM-DD') 
        AND 
        TO_DATE(:fecha_fin, 'YYYY-MM-DD') + 1`;

      replacements = { fecha_inicio, fecha_fin };
    }

    const query = `
      SELECT
        (SELECT COUNT(*) FROM LR_USUARIO) AS total_usuarios,
        (SELECT COUNT(*) FROM LR_USUARIO WHERE LR_ACTIVO = 1) AS usuarios_activos,
        (SELECT COUNT(*) FROM LR_USUARIO WHERE LR_ACTIVO = 0) AS usuarios_inactivos,
        (SELECT COUNT(*) FROM LR_VEHICULO) AS total_vehiculos,
        (SELECT COUNT(*) FROM LR_VEHICULO WHERE VEH_ACTIVO = 1) AS vehiculos_activos,
        (SELECT COUNT(*) FROM DP_ESPACIO WHERE ES_ESTADO = 1) AS total_espacios,
        (SELECT COUNT(*) FROM DP_ASIGNACION WHERE AS_ESTADO = 1) AS espacios_ocupados,
        (SELECT COUNT(*) FROM LR_REGISTRO_ACCESOS WHERE 1=1 ${filtroAccesos}) AS total_accesos,
        (SELECT COUNT(*) FROM LR_REGISTRO_ACCESOS WHERE REA_PERMITIDO = 1 ${filtroAccesos}) AS accesos_permitidos,
        (SELECT COUNT(*) FROM CB_PAGO WHERE PAG_ESTADO_REGISTRO = 'A') AS total_pagos,
        (SELECT NVL(SUM(PAG_MONTO_TOTAL), 0) FROM CB_PAGO WHERE PAG_ESTADO_REGISTRO = 'A') AS total_ingresos,
        (SELECT COUNT(*) FROM CB_USUARIO_MOROSO WHERE MOR_ESTADO_REGISTRO = 'A') AS usuarios_morosos,
        (SELECT NVL(SUM(MUL_MONTO_TOTAL), 0)
         FROM CB_MULTA M 
         JOIN CB_USUARIO_MULTA UM ON M.MUL_MULTA = UM.MUL_MULTA 
         WHERE UM.EMU_ESTADO_REGISTRO = 'A') AS total_multas
      FROM DUAL
    `;

    const [result] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const totalEspacios = Number(result.TOTAL_ESPACIOS) || 0;
    const espaciosOcupados = Number(result.ESPACIOS_OCUPADOS) || 0;
    const totalAccesos = Number(result.TOTAL_ACCESOS) || 0;
    const accesosPermitidos = Number(result.ACCESOS_PERMITIDOS) || 0;
    const totalUsuarios = Number(result.TOTAL_USUARIOS) || 0;
    const usuariosActivos = Number(result.USUARIOS_ACTIVOS) || 0;

    const dashboardData = {
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: Number(result.USUARIOS_INACTIVOS) || 0,
        porcentaje_activos:
          totalUsuarios > 0
            ? ((usuariosActivos / totalUsuarios) * 100).toFixed(1)
            : 0,
      },
      vehiculos: {
        total: Number(result.TOTAL_VEHICULOS) || 0,
        activos: Number(result.VEHICULOS_ACTIVOS) || 0,
      },
      espacios: {
        total: totalEspacios,
        ocupados: espaciosOcupados,
        libres: totalEspacios - espaciosOcupados,
        porcentaje_ocupacion:
          totalEspacios > 0
            ? ((espaciosOcupados / totalEspacios) * 100).toFixed(1)
            : 0,
      },
      accesos: {
        total: totalAccesos,
        permitidos: accesosPermitidos,
        denegados: totalAccesos - accesosPermitidos,
        tasa_exito:
          totalAccesos > 0
            ? ((accesosPermitidos / totalAccesos) * 100).toFixed(1)
            : 0,
      },
      finanzas: {
        total_pagos: Number(result.TOTAL_PAGOS) || 0,
        total_ingresos: Number(result.TOTAL_INGRESOS) || 0,
        total_multas: Number(result.TOTAL_MULTAS) || 0,
      },
      morosidad: {
        usuarios_morosos: Number(result.USUARIOS_MOROSOS) || 0,
      },
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getIngresosMensuales = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(PAG_FECHA_PAGO, 'YYYY-MM') AS mes,
        COUNT(*) AS cantidad,
        NVL(SUM(PAG_MONTO_TOTAL), 0) AS total
      FROM CB_PAGO
      WHERE PAG_ESTADO_REGISTRO = 'A'
      GROUP BY TO_CHAR(PAG_FECHA_PAGO, 'YYYY-MM')
      ORDER BY mes DESC
      FETCH FIRST 6 ROWS ONLY
    `;

    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    const ingresos = results.map((row) => ({
      mes: row.MES,
      cantidad: Number(row.CANTIDAD),
      total: Number(row.TOTAL),
    }));

    res.json({ success: true, data: ingresos });
  } catch (error) {
    console.error("Error en ingresos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDistribucionFacultades = async (req, res) => {
  try {
    const query = `
      SELECT 
        F.FAC_NOMBRE_FACULTAD AS facultad,
        COUNT(*) AS cantidad
      FROM LR_USUARIO U
      JOIN LR_FACULTAD F ON U.FAC_ID_FACULTAD = F.FAC_ID_FACULTAD
      GROUP BY F.FAC_NOMBRE_FACULTAD
      ORDER BY cantidad DESC
    `;

    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    const distribucion = results.map((row) => ({
      facultad: row.FACULTAD,
      cantidad: Number(row.CANTIDAD),
    }));

    res.json({ success: true, data: distribucion });
  } catch (error) {
    console.error("Error en distribución:", error);
    res.status(500).json({ success: false, error: error.message });
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
    const query = `
           SELECT 
                U.LR_NOMBRES AS NOMBRE,
                U.LR_APELLIDOS AS APELLIDO,
                V.VEH_PLACA AS PLACA,
                P.PQ_NOMBRE AS PARQUEO,
                E.ES_NUMERICO AS NUMERO_ESPACIO,
                C.CIC_NOMBRE_CICLO AS CICLO,
                PL.PLN_PRECIO AS MONTO,
                PG.PAG_ESTADO AS ESTADO_PAGO

            FROM DP_ASIGNACION A

            INNER JOIN LR_USUARIO U 
                ON A.LR_CARNE_USUARIO = U.LR_CARNE

            LEFT JOIN LR_VEHICULO V 
                ON V.LR_CARNE = U.LR_CARNE

            INNER JOIN DP_ESPACIO E 
                ON A.ES_ESPACIO = E.ES_ESPACIO

            INNER JOIN DP_TIPO_ESPACIO T 
                ON E.TES_ESPACIO = T.TES_ESPACIO

            INNER JOIN DP_PARQUEO P 
                ON T.PQ_PARQUEO = P.PQ_PARQUEO

            INNER JOIN LR_CICLO_SEMESTRE C 
                ON A.LR_ID_CICLO = C.CIC_ID_CICLO

            LEFT JOIN CB_PAGO PG 
                ON A.PAG_PAGO = PG.PAG_PAGO

            LEFT JOIN CB_PLAN_PARQUEO PL 
                ON PG.PLN_PLAN = PL.PLN_PLAN;
        `;

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    // 👇 opcional: normalizar nombres a camelCase (más usable en frontend)
    const data = rows.map((row) => ({
      nombre: row.NOMBRE,
      apellido: row.APELLIDO,
      placa: row.PLACA,
      parqueo: row.PARQUEO,
      numero_espacio: row.NUMERO_ESPACIO,
      ciclo: row.CICLO,
      monto: Number(row.MONTO),
      estado_pago: row.ESTADO_PAGO,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error en DB:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
