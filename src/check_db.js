const { sequelize } = require('./config/db');
async function test() {
  const [rows] = await sequelize.query("SELECT PAG_PAGO, EMU_USUARIO_MULTA, PAG_ESTADO FROM INFRA_DEV.CB_PAGO ORDER BY PAG_PAGO DESC FETCH FIRST 10 ROWS ONLY");
  console.log(rows);
  process.exit(0);
}
test();
