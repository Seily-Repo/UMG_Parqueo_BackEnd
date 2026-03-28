const express = require('express');
const oracledb = require('oracledb');

const app = express();
app.use(express.json());

// 🔌 conexión a Oracle
async function getConnection() {
  return await oracledb.getConnection({
    user: 'admin',
    password: '1234',
    connectString: 'localhost/XEPDB1'
  });
}

//////////////////////////////////////////////////////////////////
// 🟢 C → CREATE (INSERTAR PAGO)
//////////////////////////////////////////////////////////////////
app.post('/pagos', async (req, res) => {
  try {
    const conn = await getConnection();
    const data = req.body;

    // Validación básica
    if (!data.id || !data.estudiante || !data.plan || !data.formaPago) {
      return res.status(400).send("Faltan datos obligatorios");
    }

    await conn.execute(
      `INSERT INTO PAR_PAGO (
        PAG_id_pago,
        EST_id_estudiante,
        PLN_id_plan,
        FPG_id_forma_pago,
        MUL_id_multa,
        PAG_fecha_pago,
        PAG_monto_total,
        PAG_monto_base,
        PAG_impuesto,
        PAG_referencia_banco,
        PAG_tarjeta_mask,
        PAG_creado_por,
        PAG_fecha_creacion
      ) VALUES (
        :id, :est, :plan, :forma, :multa,
        SYSTIMESTAMP,
        :total, :base, :impuesto,
        :ref, :mask,
        :creado,
        SYSTIMESTAMP
      )`,
      {
        id: data.id,
        est: data.estudiante,
        plan: data.plan,
        forma: data.formaPago,
        multa: data.multa || null,
        total: data.total,
        base: data.base,
        impuesto: data.impuesto,
        ref: data.referencia,
        mask: data.tarjeta,
        creado: data.creado_por
      },
      { autoCommit: true }
    );

    res.send("✅ [CREATE] Pago creado correctamente");

  } catch (error) {
    res.status(500).send("❌ Error en CREATE: " + error.message);
  }
});

//////////////////////////////////////////////////////////////////
// 🔵 R → READ (OBTENER TODOS LOS PAGOS)
//////////////////////////////////////////////////////////////////
app.get('/pagos', async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT * FROM PAR_PAGO`
    );

    res.json({
      mensaje: "📄 [READ] Lista de pagos",
      data: result.rows
    });

  } catch (error) {
    res.status(500).send("❌ Error en READ: " + error.message);
  }
});

//////////////////////////////////////////////////////////////////
// 🔵 R → READ (OBTENER UN SOLO PAGO POR ID)
//////////////////////////////////////////////////////////////////
app.get('/pagos/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const id = req.params.id;

    const result = await conn.execute(
      `SELECT * FROM PAR_PAGO WHERE PAG_id_pago = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).send("❌ Pago no encontrado");
    }

    res.json({
      mensaje: "📄 [READ] Pago encontrado",
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).send("❌ Error en READ: " + error.message);
  }
});

//////////////////////////////////////////////////////////////////
// 🟡 U → UPDATE (ACTUALIZAR PAGO)
//////////////////////////////////////////////////////////////////
app.put('/pagos/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const id = req.params.id;
    const data = req.body;

    const result = await conn.execute(
      `UPDATE PAR_PAGO SET
        PAG_monto_total = :total,
        PAG_monto_base = :base,
        PAG_impuesto = :impuesto,
        PAG_modificado_por = :mod,
        PAG_fecha_modificacion = SYSTIMESTAMP
      WHERE PAG_id_pago = :id`,
      {
        total: data.total,
        base: data.base,
        impuesto: data.impuesto,
        mod: data.modificado_por,
        id: id
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("❌ Pago no encontrado para actualizar");
    }

    res.send("🟡 [UPDATE] Pago actualizado correctamente");

  } catch (error) {
    res.status(500).send("❌ Error en UPDATE: " + error.message);
  }
});

//////////////////////////////////////////////////////////////////
// 🔴 D → DELETE (ELIMINAR PAGO)
//////////////////////////////////////////////////////////////////
app.delete('/pagos/:id', async (req, res) => {
  try {
    const conn = await getConnection();
    const id = req.params.id;

    const result = await conn.execute(
      `DELETE FROM PAR_PAGO WHERE PAG_id_pago = :id`,
      { id },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("❌ Pago no encontrado para eliminar");
    }

    res.send("🔴 [DELETE] Pago eliminado correctamente");

  } catch (error) {
    res.status(500).send("❌ Error en DELETE: " + error.message);
  }
});

//////////////////////////////////////////////////////////////////
// 🚀 SERVIDOR
//////////////////////////////////////////////////////////////////
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en puerto 3000");
});
