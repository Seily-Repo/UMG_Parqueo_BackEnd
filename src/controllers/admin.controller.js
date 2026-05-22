const UsuarioStore = require('../store/usuario.store');
const PagoStore = require('../store/pago.store');
const MultaStore = require('../store/multa.store');
const CatalogoStore = require('../store/catalogo.store');
const { sequelize } = require('../config/db');
const { formatearCarne } = require('../utils/helpers');

/** GET /api/admin/usuarios */
exports.getUsuarios = async (req, res) => {
  try {
    const rows = await UsuarioStore.getAll();
    const dataConGuiones = rows.map(row => ({
      ...row,
      CARNE: row.CARNE ? formatearCarne(row.CARNE) : null
    }));
    res.status(200).json(dataConGuiones);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** PUT /api/admin/usuarios/:carne */
exports.updateUsuario = async (req, res) => {
  try {
    await UsuarioStore.update(req.params.carne, req.body);
    res.status(200).json({ mensaje: "Usuario actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** PUT /api/admin/usuarios/:carne/estado */
exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const { nuevoEstado } = req.body;
    await UsuarioStore.cambiarEstado(req.params.carne, nuevoEstado);
    res.status(200).json({ mensaje: "Actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** GET /api/admin/estadisticas */
exports.getEstadisticas = async (req, res) => {
  try {
    const [[resCarros]] = await sequelize.query(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.LR_VEHICULO WHERE VEH_TIPO_VEHICULO = 'AUTOMOVIL'`);
    const [[resMotos]] = await sequelize.query(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.LR_VEHICULO WHERE VEH_TIPO_VEHICULO = 'MOTOCICLETA'`);
    const [[resIngresos]] = await sequelize.query(`SELECT NVL(SUM(PAG_MONTO_TOTAL), 0) AS TOTAL FROM INFRA_DEV.CB_PAGO WHERE PAG_ESTADO = 'C'`);
    
    const [[resOcupados]] = await sequelize.query(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.DP_ESPACIO WHERE ES_ESTADO = 0`);
    const [[resTotales]] = await sequelize.query(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.DP_ESPACIO`);
    
    let ocupacion = 0;
    if (resTotales.TOTAL > 0) {
      ocupacion = Math.round((resOcupados.TOTAL / resTotales.TOTAL) * 100);
    }

    res.status(200).json({
      carros: resCarros.TOTAL,
      motos: resMotos.TOTAL,
      ingresos: resIngresos.TOTAL,
      ocupacion: ocupacion
    });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** GET /api/admin/pagos */
exports.getPagos = async (req, res) => {
  try {
    const rows = await PagoStore.getAll();
    const dataConGuiones = rows.map(row => ({
      ...row,
      CARNE_USUARIO: row.CARNE_USUARIO ? formatearCarne(row.CARNE_USUARIO) : null
    }));
    res.status(200).json(dataConGuiones);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** PUT /api/admin/pagos/:id/aprobar */
exports.aprobarPago = async (req, res) => {
  try {
    await PagoStore.aprobar(req.params.id);
    res.status(200).json({ mensaje: "Pago Aprobado" });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** GET /api/admin/multas-catalogo */
exports.getMultasCatalogo = async (req, res) => {
  try {
    const data = await CatalogoStore.getMultasCatalogo();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};

/** POST /api/admin/multas */
exports.asignarMulta = async (req, res) => {
  try {
    const { carne, placa, id_multa } = req.body;
    const resultado = await MultaStore.asignar(carne, placa, id_multa);
    if (resultado.error) {
      return res.status(404).json({ error: resultado.error });
    }
    res.status(200).json({
      mensaje: "Multa asignada exitosamente.",
      EMU_USUARIO_MULTA: resultado.idUsuarioMulta,
      monto: resultado.monto
    });
  } catch (err) {
    res.status(500).json({ error: "Error interno al procesar multa", detalle: err.message });
  }
};

/** GET /api/admin/reportes */
exports.getReportes = async (req, res) => {
  try {
    const [demografia] = await sequelize.query(
      `SELECT VEH_TIPO_VEHICULO AS "nombre", COUNT(*) AS "cantidad" FROM INFRA_DEV.LR_VEHICULO WHERE VEH_ACTIVO = 1 GROUP BY VEH_TIPO_VEHICULO`
    );
    const [ingresosPorPlan] = await sequelize.query(
      `SELECT NVL(pl.PLN_NOMBRE_PLAN, 'Multas') AS "plan", NVL(SUM(p.PAG_MONTO_TOTAL), 0) AS "total"
       FROM INFRA_DEV.CB_PAGO p LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
       WHERE p.PAG_ESTADO = 'C' GROUP BY pl.PLN_NOMBRE_PLAN`
    );
    const [morosos] = await sequelize.query(
      `SELECT u.LR_NOMBRES || ' ' || u.LR_APELLIDOS AS "usuario", SUM(p.PAG_MONTO_TOTAL) AS "deuda"
       FROM INFRA_DEV.CB_PAGO p JOIN INFRA_DEV.LR_USUARIO u ON p.LR_CARNE = u.LR_CARNE
       WHERE p.PAG_ESTADO = 'P' GROUP BY u.LR_NOMBRES, u.LR_APELLIDOS
       ORDER BY "deuda" DESC FETCH FIRST 5 ROWS ONLY`
    );
    res.status(200).json({ demografia, ingresosPorPlan, morosos });
  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  }
};
