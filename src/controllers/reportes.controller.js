const { QueryTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const excelJS = require("exceljs");
const PDFDocument = require("pdfkit");

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
        (SELECT COUNT(*) FROM CB_PAGO WHERE PAG_ESTADO = 'A') AS total_pagos,
        (SELECT NVL(SUM(PAG_MONTO_TOTAL), 0) FROM CB_PAGO WHERE PAG_ESTADO= 'A') AS total_ingresos,
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

function filtro(q) {
  let f = "WHERE 1=1";

  // ============================================
  // FILTROS POR FECHA DE REGISTRO DEL USUARIO
  // ============================================

  if (q.anio) {
    f += ` 
            AND EXTRACT(YEAR FROM U.LR_FECHA_REGISTRO) = ${q.anio}
        `;
  }

  if (q.mes) {
    f += ` 
            AND EXTRACT(MONTH FROM U.LR_FECHA_REGISTRO) = ${q.mes}
        `;
  }

  if (q.dia) {
    f += ` 
            AND EXTRACT(DAY FROM U.LR_FECHA_REGISTRO) = ${q.dia}
        `;
  }

  return f;
}

function queryBase(filtro = "") {
  return `

        SELECT 

            U.LR_CARNE AS CARNE,

            U.LR_NOMBRES || ' ' || U.LR_APELLIDOS AS USUARIO,

            V.VEH_PLACA AS PLACA,

            V.VEH_MARCA || ' ' || V.VEH_MODELO AS VEHICULO,

            J.JOR_NOMBRE_JORNADA AS JORNADA,

            TO_CHAR(U.LR_FECHA_REGISTRO, 'YYYY-MM-DD') AS FECHA_REGISTRO,

            -- ============================================
            -- VALIDAR SI TIENE PAGO APROBADO
            -- ============================================

            CASE
                WHEN P.PAG_PAGO IS NOT NULL 
                     AND P.PAG_ESTADO = 'A'
                THEN 'SI'
                ELSE 'NO'
            END AS PAGO_APROBADO,

            -- ============================================
            -- VALIDAR SI TIENE ESPACIO ASIGNADO
            -- ============================================

            CASE
                WHEN A.AS_ASIGNACION IS NOT NULL
                THEN 'SI'
                ELSE 'NO'
            END AS ESPACIO_ASIGNADO

        FROM LR_USUARIO U

        -- ============================================
        -- VEHICULO
        -- ============================================

        LEFT JOIN LR_VEHICULO V
            ON U.LR_CARNE = V.LR_CARNE

        -- ============================================
        -- ASIGNACION
        -- ============================================

        LEFT JOIN DP_ASIGNACION A
            ON U.LR_CARNE = A.LR_CARNE_USUARIO

        -- ============================================
        -- JORNADA
        -- ============================================

        LEFT JOIN LR_JORNADA J
            ON A.LR_ID_JORNADA = J.JOR_ID_JORNADA

        -- ============================================
        -- PAGOS APROBADOS
        -- ============================================

        LEFT JOIN CB_PAGO P
            ON U.LR_CARNE = P.LR_CARNE
            AND P.PAG_ESTADO = 'A'

        ${filtro}

        ORDER BY U.LR_FECHA_REGISTRO DESC
    `;
}

function obtenerCarneUsuario(req) {
  const carne = Number(req.user?.carne);

  if (!Number.isInteger(carne)) {
    throw new Error("No se pudo identificar el carne del usuario autenticado.");
  }

  return carne;
}

async function registrarDescarga(req, tipo) {
  await sequelize.query(
    `
      INSERT INTO LR_CONTROL_DESCARGA (
        LR_ID,
        LR_CARNE,
        LR_TIPO,
        LR_FECHA_REGISTRO_DESCARGA
      )
      VALUES (
        (SELECT NVL(MAX(LR_ID), 0) + 1 FROM LR_CONTROL_DESCARGA),
        :carne,
        :tipo,
        SYSTIMESTAMP
      )
    `,
    {
      replacements: {
        carne: obtenerCarneUsuario(req),
        tipo,
      },
      type: QueryTypes.INSERT,
    },
  );
}

async function limiteDiarioAlcanzado(tipo, limite) {
  const [resultado] = await sequelize.query(
    `
      SELECT COUNT(*) AS TOTAL
      FROM LR_CONTROL_DESCARGA
      WHERE LR_TIPO = :tipo
        AND TRUNC(CAST(LR_FECHA_REGISTRO_DESCARGA AS DATE)) = TRUNC(SYSDATE)
    `,
    {
      replacements: { tipo },
      type: QueryTypes.SELECT,
    },
  );

  return Number(resultado?.TOTAL || 0) >= limite;
}

async function validarLimiteDiarioDescargas(res, tipo, limite) {
  const limiteAlcanzado = await limiteDiarioAlcanzado(tipo, limite);

  if (!limiteAlcanzado) {
    return false;
  }

  res.status(429).json({
    success: false,
    message: `Se llego al limite diario de descargas ${tipo}. Intenta nuevamente manana.`,
    tipo,
    limite,
  });

  return true;
}

exports.getReporteAdministrativo = async (req, res) => {
  try {
    const query = queryBase(filtro(req.query));

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    const datos = rows.map((r) => ({
      carne: r.CARNE,

      usuario: r.USUARIO,

      placa: r.PLACA || "-",

      vehiculo: r.VEHICULO || "-",

      jornada: r.JORNADA || "-",

      fecha_registro: r.FECHA_REGISTRO,

      pago_aprobado: r.PAGO_APROBADO,

      espacio_asignado: r.ESPACIO_ASIGNADO,
    }));

    res.json({
      success: true,
      total: datos.length,
      datos,
    });
  } catch (e) {
    console.error("Error reporte:", e);

    res.status(500).json({
      success: false,
      error: e.message,
    });
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

exports.getPagosAceptados = async (req, res) => {
  try {
    const query = `
            SELECT 
                P.PAG_PAGO AS ID_PAGO,
                U.LR_CARNE,

                U.LR_NOMBRES || ' ' || U.LR_APELLIDOS AS USUARIO,

                PL.PLN_NOMBRE_PLAN AS PLAN,
                P.PAG_MONTO_TOTAL AS MONTO,
                P.PAG_FECHA_PAGO AS FECHA_PAGO,

                CASE 
                    WHEN P.PAG_ESTADO = 'A' THEN 'ACEPTADO'
                    WHEN P.PAG_ESTADO = 'P' THEN 'PENDIENTE'
                    WHEN P.PAG_ESTADO = 'C' THEN 'CANCELADO'
                    ELSE 'DESCONOCIDO'
                END AS ESTADO

            FROM CB_PAGO P

            INNER JOIN LR_USUARIO U 
                ON P.LR_CARNE = U.LR_CARNE

            LEFT JOIN CB_PLAN_PARQUEO PL 
            ON P.PLN_PLAN = PL.PLN_PLAN
        `;

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    const data = rows.map((row) => ({
      id_pago: row.ID_PAGO,
      carne: row.LR_CARNE,
      usuario: row.USUARIO,
      plan: row.PLAN,
      monto: Number(row.MONTO),
      fecha_pago: row.FECHA_PAGO,
      estado: row.ESTADO,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error obteniendo pagos:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.createExcel = async (req, res) => {
  try {
    const limiteAlcanzado = await validarLimiteDiarioDescargas(res, "EXCEL", 20000);
    if (limiteAlcanzado) return;

    await registrarDescarga(req, "EXCEL");

    const query = queryBase(filtro(req.query));

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    const wb = new excelJS.Workbook();

    const ws = wb.addWorksheet("Reporte Administrativo");

    // HEADER
    ws.addRow([
      "Carné",
      "Usuario",
      "Placa",
      "Vehículo",
      "Jornada",
      "Fecha Registro",
      "Pago Aprobado",
      "Espacio Asignado",
    ]);

    // DATA
    rows.forEach((r) => {
      ws.addRow([
        r.CARNE,
        r.USUARIO,
        r.PLACA || "-",
        r.VEHICULO || "-",
        r.JORNADA || "-",
        r.FECHA_REGISTRO,
        r.PAGO_APROBADO,
        r.ESPACIO_ASIGNADO,
      ]);
    });

    // STYLE HEADER
    ws.getRow(1).font = {
      bold: true,
    };

    // AUTO WIDTH
    ws.columns.forEach((column) => {
      let maxLength = 20;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 10;

        if (length > maxLength) {
          maxLength = length;
        }
      });

      column.width = maxLength + 2;
    });

    // RESPONSE
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_administrativo.xlsx",
    );

    await wb.xlsx.write(res);

    res.end();
  } catch (e) {
    console.error("Error Excel:", e);

    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

// PDF
exports.createPDF = async (req, res) => {
  try {
    const limiteAlcanzado = await validarLimiteDiarioDescargas(res, "PDF", 50000);
    if (limiteAlcanzado) return;

    await registrarDescarga(req, "PDF");

    const query = queryBase(filtro(req.query));

    const rows = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_administrativo.pdf",
    );

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
    });

    doc.pipe(res);

    // TITLE
    doc.fontSize(18).text("Reporte Administrativo Parqueo", {
      align: "center",
    });

    doc.moveDown(2);

    // HEADER
    doc
      .fontSize(10)
      .text(
        "Carné | Usuario | Placa | Vehículo | Jornada | Fecha | Pago | Espacio",
        {
          underline: true,
        },
      );

    doc.moveDown();

    // ROWS
    rows.forEach((r) => {
      doc.text(
        `${r.CARNE} | ${r.USUARIO} | ${r.PLACA || "-"} | ${r.VEHICULO || "-"} | ${r.JORNADA || "-"} | ${r.FECHA_REGISTRO} | ${r.PAGO_APROBADO} | ${r.ESPACIO_ASIGNADO}`,
      );
    });

    doc.end();
  } catch (e) {
    console.error("Error PDF:", e);

    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};
