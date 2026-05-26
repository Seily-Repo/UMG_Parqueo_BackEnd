const { sequelize } = require('./config/db');

async function syncPagos() {
  try {
    console.log("Iniciando sincronización de pagos...");
    
    // 1. Encontrar todos los pagos Aceptados o Completados
    const [pagosCompletados] = await sequelize.query(`
      SELECT PAG_PAGO, LR_CARNE, PLN_PLAN, EMU_USUARIO_MULTA
      FROM INFRA_DEV.CB_PAGO
      WHERE PAG_ESTADO IN ('A', 'C')
    `);

    console.log(`Se encontraron ${pagosCompletados.length} pagos completados/aceptados.`);

    let eliminados = 0;

    // 2. Por cada uno, buscar si existe un pago Pendiente ('P') huérfano para el mismo plan o multa y eliminarlo
    for (const p of pagosCompletados) {
      if (p.PLN_PLAN) {
        const [pendientesPlan] = await sequelize.query(`
          SELECT PAG_PAGO FROM INFRA_DEV.CB_PAGO 
          WHERE LR_CARNE = :carne AND PLN_PLAN = :plan AND PAG_ESTADO = 'P'
        `, { replacements: { carne: p.LR_CARNE, plan: p.PLN_PLAN } });

        for (const pend of pendientesPlan) {
          await sequelize.query(`DELETE FROM INFRA_DEV.CB_PAGO WHERE PAG_PAGO = :id`, { replacements: { id: pend.PAG_PAGO } });
          console.log(`Eliminado pago pendiente duplicado ID: ${pend.PAG_PAGO} para el plan ${p.PLN_PLAN}`);
          eliminados++;
        }
      }

      if (p.EMU_USUARIO_MULTA) {
        const [pendientesMulta] = await sequelize.query(`
          SELECT PAG_PAGO FROM INFRA_DEV.CB_PAGO 
          WHERE LR_CARNE = :carne AND EMU_USUARIO_MULTA = :multa AND PAG_ESTADO = 'P'
        `, { replacements: { carne: p.LR_CARNE, multa: p.EMU_USUARIO_MULTA } });

        for (const pend of pendientesMulta) {
          await sequelize.query(`DELETE FROM INFRA_DEV.CB_PAGO WHERE PAG_PAGO = :id`, { replacements: { id: pend.PAG_PAGO } });
          console.log(`Eliminado pago pendiente duplicado ID: ${pend.PAG_PAGO} para la multa ${p.EMU_USUARIO_MULTA}`);
          eliminados++;
        }
      }
    }

    console.log(`Sincronización terminada. Se eliminaron ${eliminados} pagos pendientes duplicados.`);
    process.exit(0);
  } catch (e) {
    console.error("Error sincronizando:", e);
    process.exit(1);
  }
}

syncPagos();
