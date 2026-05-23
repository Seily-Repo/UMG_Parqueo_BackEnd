require('dotenv').config();
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

// 🌟 INICIALIZAR POOL DE CONEXIONES 🌟
async function initDbPool() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log("✅ [DB] Pool de conexiones Oracle inicializado con éxito.");
  } catch (err) {
    console.error("❌ [DB] Error al inicializar pool de conexiones:", err);
  }
}
initDbPool();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.get('/', async (req, res) => {
  res.json({ mensaje: "Conexion exitosa a Oracle 21c (Esquema Oficial: INFRA_DEV)" });
});

// =============================================
// CACHÉ Y HELPER DE BASE DE DATOS
// =============================================
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; 
function getCache(key) { const entry = cache.get(key); if (!entry) return null; if (Date.now() - entry.timestamp > CACHE_TTL) { cache.delete(key); return null; } return entry.data; }
function setCache(key, data) { cache.set(key, { data, timestamp: Date.now() }); }

async function serveCatalog(req, res, cacheKey, sql) {
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    setCache(cacheKey, result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { } }
  }
}

// 🔥 Helper para limpiar los guiones del carné para la BD oficial
const limpiarCarne = (carneConGuiones) => {
  if (!carneConGuiones) return null;
  return parseInt(carneConGuiones.toString().replace(/-/g, ''), 10);
};

// =============================================
// CATÁLOGOS (Adaptados a las tablas INFRA_DEV.LR_*)
// =============================================
app.get('/api/facultades', (req, res) => { serveCatalog(req, res, 'facultades', 'SELECT FAC_ID_FACULTAD as id_facultad, FAC_NOMBRE_FACULTAD as nombre_facultad FROM INFRA_DEV.LR_FACULTAD ORDER BY FAC_NOMBRE_FACULTAD ASC'); });
app.get('/api/sedes', (req, res) => { serveCatalog(req, res, 'sedes', 'SELECT SEC_ID_SEDE as id_sede, SEC_NOMBRE_SEDE as nombre_sede FROM INFRA_DEV.LR_SEDE_CAMPUS ORDER BY SEC_NOMBRE_SEDE'); });
app.get('/api/ciclos', (req, res) => { serveCatalog(req, res, 'ciclos', 'SELECT CIC_ID_CICLO as id_ciclo, CIC_NOMBRE_CICLO as nombre_ciclo FROM INFRA_DEV.LR_CICLO_SEMESTRE ORDER BY CIC_ID_CICLO'); });
app.get('/api/secciones', (req, res) => { serveCatalog(req, res, 'secciones', 'SELECT SEC_ID_SECCION as id_seccion, SEC_NOMBRE_SECCION as nombre_seccion FROM INFRA_DEV.LR_SECCION ORDER BY SEC_ID_SECCION'); });
app.get('/api/jornadas', (req, res) => { serveCatalog(req, res, 'jornadas', 'SELECT JOR_ID_JORNADA as id_jornada, JOR_NOMBRE_JORNADA as nombre_jornada FROM INFRA_DEV.LR_JORNADA WHERE JOR_ACTIVO = 1 ORDER BY JOR_ID_JORNADA'); });
app.get('/api/departamentos', (req, res) => { serveCatalog(req, res, 'departamentos', 'SELECT DEP_ID_DEPARTAMENTO as id_departamento, DEP_NOMBRE_DEPARTAMENTO as nombre_departamento FROM INFRA_DEV.LR_DEPARTAMENTO ORDER BY DEP_NOMBRE_DEPARTAMENTO'); });
app.get('/api/planes', (req, res) => { serveCatalog(req, res, 'planes', "SELECT PLN_PLAN, PLN_NOMBRE_PLAN, PLN_DESCRIPCION, PLN_PRECIO FROM INFRA_DEV.CB_PLAN_PARQUEO WHERE PLN_ESTADO_REGISTRO = 'A' ORDER BY PLN_PRECIO DESC"); });
app.get('/api/roles', (req, res) => { serveCatalog(req, res, 'roles', "SELECT ROL_ID_ROL AS ID_ROL, ROL_NOMBRE_ROL AS NOMBRE_ROL FROM INFRA_DEV.LR_ROL WHERE ROL_ESTADO = 1 ORDER BY ROL_ID_ROL ASC"); });

app.get('/api/municipios/:id_depto', async (req, res) => {
  const idDepto = parseInt(req.params.id_depto);
  const cacheKey = `municipios_${idDepto}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute('SELECT MUN_ID_MUNICIPIO as id_municipio, MUN_NOMBRE_MUNICIPIO as nombre_municipio FROM INFRA_DEV.LR_MUNICIPIO WHERE DEP_ID_DEPARTAMENTO = :id ORDER BY MUN_NOMBRE_MUNICIPIO', { id: idDepto }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    setCache(cacheKey, result.rows);
    res.status(200).json(result.rows);
  } catch (err) { res.status(500).json({ error: "Error interno", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) { } } }
});

// =============================================
// --- AUTENTICACIÓN (CON RADARES ANTI-FANTASMAS) ---
// =============================================

app.post('/api/auth/registro', async (req, res) => {
  let connection;
  try {
    const { creadoPorAdmin, ...datos } = req.body; 
    
    // 🚨 RADAR 1: Veamos qué está mandando exactamente React
    console.log("🚀 [REGISTRO] React envió estos datos:", datos);

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(datos.password, salt);
    const carneLimpio = limpiarCarne(datos.carne);
    const esAdmin = (creadoPorAdmin === true || creadoPorAdmin === 'true');
    const requiereCambio = esAdmin ? 1 : 0; // Si lo crea el admin, obligamos al cambio
    
    console.log("🚀 [REGISTRO] Carné formateado para Oracle:", carneLimpio);

    connection = await oracledb.getConnection();

    const sqlUsuario = `
  INSERT INTO INFRA_DEV.LR_USUARIO (
    LR_CARNE, LR_NOMBRES, LR_APELLIDOS, LR_CORREO_INSTITUCIONAL, LR_CONTRASENA, 
    LR_TELEFONO, MUN_ID_MUNICIPIO, LR_ZONA, LR_NOMENCLATURA, CAT_ID_CATEGORIA, 
    SEC_ID_SEDE, FAC_ID_FACULTAD, CIC_ID_CICLO, SEC_ID_SECCION, JOR_ID_JORNADA, 
    ROL_ID_ROL, LR_ACTIVO, LR_REQUIERE_CAMBIO_PASS -- 🔥 Nueva columna
  ) VALUES (
    :carne, :nombres, :apellidos, :correo, :contrasena, 
    :telefono, :id_municipio, :zona, :nomenclatura, :id_categoria, 
    :id_sede, :id_facultad, :id_ciclo, :id_seccion, :id_jornada, 
    :id_rol, 1, :requiere_cambio
  )
`;
    const bindsUsuario = {
      carne: carneLimpio, nombres: datos.nombres, apellidos: datos.apellidos, 
      correo: datos.correo_electronico, contrasena: contrasenaEncriptada,
      telefono: datos.telefonos || null, id_municipio: datos.id_municipio ? parseInt(datos.id_municipio) : null, 
      zona: datos.zona ? parseInt(datos.zona) : null, nomenclatura: datos.nomenclatura || 'N/A', 
      id_categoria: datos.id_rol ? parseInt(datos.id_rol) : 1, id_sede: datos.id_sede ? parseInt(datos.id_sede) : 1, 
      id_facultad: datos.id_facultad ? parseInt(datos.id_facultad) : null, id_ciclo: datos.id_ciclo ? parseInt(datos.id_ciclo) : null, 
      id_seccion: datos.id_seccion ? parseInt(datos.id_seccion) : null, id_jornada: datos.id_jornada ? parseInt(datos.id_jornada) : 1, 
      id_rol: (esAdmin && datos.id_rol) ? parseInt(datos.id_rol) : 2,
     requiere_cambio: requiereCambio // 🔥 Valor dinámico
      };
    
    await connection.execute(sqlUsuario, bindsUsuario);
    console.log("✅ [REGISTRO] Usuario insertado en LR_USUARIO");
    
    await connection.execute(
      `INSERT INTO INFRA_DEV.LR_DATOS_EMERGENCIA (DAE_ID_EMERGENCIA, LR_CARNE, DAE_NOMBRE_CONTACTO, DAE_TELEFONO_CONTACTO) 
       VALUES (NVL((SELECT MAX(DAE_ID_EMERGENCIA) FROM INFRA_DEV.LR_DATOS_EMERGENCIA), 0) + 1, :carne, :nombre, :telefono)`, 
      { carne: carneLimpio, nombre: datos.emergencia_nombre || 'Pendiente', telefono: datos.emergencia_telefono || '00000000' }
    );
    console.log("✅ [REGISTRO] Datos de emergencia insertados");
    
    await connection.commit();
    console.log("💾 [REGISTRO] COMMIT EJECUTADO CORRECTAMENTE EN LA DB OFICIAL");

    try {
      // Verificamos si la petición vino del panel de administrador
      const esAdmin = (creadoPorAdmin === true || creadoPorAdmin === 'true');
      const primerNombre = datos.nombres.split(' ')[0];

      const mailOptions = { 
        from: `"Parqueo UMG" <${process.env.EMAIL_USER}>`, 
        to: datos.correo_electronico, 
        subject: '🚗 ¡Bienvenido al Sistema de Parqueo UMG!', 
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #002b5c; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px;">Parqueo UMG</h2>
            </div>
            <div style="padding: 20px; color: #333;">
              <h3 style="color: #00529b; font-size: 20px;">¡Hola, ${primerNombre}!</h3>
              <p style="font-size: 16px;">Tu cuenta para el <strong>Sistema de Control de Parqueo</strong> ha sido creada.</p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #00b4d8; padding: 15px; margin-top: 20px; border-radius: 4px;">
                <p style="margin: 5px 0; font-size: 16px;"><strong>Tu Carné de Acceso:</strong> <span style="color: #00529b;">${datos.carne}</span></p>
                
                ${esAdmin ? `
                <p style="margin: 5px 0; font-size: 16px;"><strong>Contraseña Temporal:</strong> <span style="color: #d32f2f;">${datos.password}</span></p>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">(Por tu seguridad, te recomendamos cambiar esta contraseña al iniciar sesión por primera vez).</p>
                ` : ''}
                
              </div>
            </div>
          </div>
        `
      };
      // 🚀 ENVIAMOS EL CORREO EN SEGUNDO PLANO SIN BLOQUEAR LA RESPUESTA HTTP
      transporter.sendMail(mailOptions).then(() => {
        console.log("✉️ [REGISTRO] Correo HTML enviado con éxito en segundo plano");
      }).catch((errEmail) => {
        console.error("❌ [EMAIL ERROR] Falló el correo en segundo plano:", errEmail);
      });
    } catch (errSync) {
      console.error("❌ [EMAIL ERROR] Error síncrono al preparar correo:", errSync);
    }

    res.status(200).json({ mensaje: "Registro exitoso." });
  } catch (err) {
    console.error("❌ [ERROR FATAL EN REGISTRO]:", err); // RADAR DE ERRORES OCULTOS
    if (connection) await connection.rollback();
    if (err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) return res.status(400).json({ error: "Carné o correo ya registrado." });
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { carne, correo_institucional, correo_electronico, password } = req.body;
    const identificadorCorreo = correo_institucional || correo_electronico || null;
    const identificadorCarne = limpiarCarne(carne);
    
    // 🚨 RADAR 2: Veamos con qué está intentando entrar el usuario
    console.log(`🔐 [LOGIN] Intentando entrar con -> Carné Numérico: ${identificadorCarne} | Correo: ${identificadorCorreo}`);
    
    connection = await oracledb.getConnection();
    const result = await connection.execute(
  `SELECT LR_CARNE AS CARNE, LR_NOMBRES AS NOMBRES, LR_APELLIDOS AS APELLIDOS, 
          LR_CORREO_INSTITUCIONAL AS CORREO_INSTITUCIONAL, LR_TELEFONO AS TELEFONO, 
          LR_CONTRASENA AS CONTRASENA, ROL_ID_ROL AS ID_ROL,
          LR_REQUIERE_CAMBIO_PASS AS REQUIERE_CAMBIO -- 🔥 Jalamos el nuevo dato
   FROM INFRA_DEV.LR_USUARIO 
   WHERE (LR_CARNE = :carne_num OR LR_CORREO_INSTITUCIONAL = :correo) AND LR_ACTIVO = 1`,
      { carne_num: identificadorCarne || 0, correo: identificadorCorreo || 'N/A' }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 🚨 RADAR 3: Veamos si Oracle encontró algo
    console.log("🔍 [LOGIN] Resultados encontrados en la DB:", result.rows);

    if (result.rows.length === 0) return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    const usuario = result.rows[0];
    
    if (!usuario.CONTRASENA) return res.status(401).json({ error: "Este usuario no tiene contraseña registrada." });

    const contrasenaValida = await bcrypt.compare(password, usuario.CONTRASENA);
    if (!contrasenaValida) {
        console.log("❌ [LOGIN] Las contraseñas no coinciden (Hash vs Texto)");
        return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    }

    const carneFormateado = usuario.CARNE.toString().replace(/(\d{4})(\d{2})(\d+)/, '$1-$2-$3');

    const token = jwt.sign(
      { carne: carneFormateado, rol: usuario.ID_ROL },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log("✅ [LOGIN] Login Exitoso. Entrando al Dashboard...");
    
    res.status(200).json({ 
      mensaje: "Login exitoso",
      token: token, 
      usuario: { 
        carne: carneFormateado, 
        nombres: usuario.NOMBRES, 
        apellidos: usuario.APELLIDOS, 
        correo_institucional: usuario.CORREO_INSTITUCIONAL, 
        telefono: usuario.TELEFONO, 
        rol: usuario.ID_ROL,
        requiereCambioPass: usuario.REQUIERE_CAMBIO === 1 // 🔥 AQUÍ ESTÁ EL REY
      } 
    });

  } catch (err) { 
    res.status(500).json({ error: "Error de servidor", detalle: err.message }); 
  } finally { 
    if (connection) { try { await connection.close(); } catch (e) {} } 
  }
});

// =============================================
// 🛡️ MIDDLEWARES DE SEGURIDAD (LOS CADENEROS)
// =============================================

// 1. Cadenero General: Revisa que el usuario esté logueado
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: "Acceso denegado. No hay token." });
  
  try {
    // Le quitamos la palabra "Bearer " que siempre manda React
    const tokenLimpio = token.replace("Bearer ", "");
    const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    req.usuario = verificado; // Guardamos los datos del token en la petición
    next(); // Dale pase libre
  } catch (err) {
    res.status(400).json({ error: "Token inválido o expirado." });
  }
};

// 2. Cadenero VIP: Revisa que, además de estar logueado, sea ADMIN (Rol 1)
const esAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 1) {
    return res.status(403).json({ error: "Acceso denegado. Requiere permisos de Administrador." });
  }
  next(); // Es Admin, dale pase libre
};

app.put('/api/auth/cambiar-password', async (req, res) => {
  let connection;
  try {
    const { carne, nuevaPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(nuevaPassword, salt);
    const carneLimpio = limpiarCarne(carne);
    
    connection = await oracledb.getConnection();
    await connection.execute(`UPDATE INFRA_DEV.LR_USUARIO SET LR_CONTRASENA = :contrasena WHERE LR_CARNE = :carne`, { contrasena: contrasenaEncriptada, carne: carneLimpio });
    await connection.commit();
    res.status(200).json({ mensaje: "Contraseña actualizada exitosamente." });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ error: "Error interno del servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

// =============================================
// ESTUDIANTES: MÓDULO DE VEHÍCULOS Y PAGOS
// =============================================
app.get('/api/vehiculos/:carne', async (req, res) => {
  let connection;
  try {
    const carneLimpio = limpiarCarne(req.params.carne);
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT VEH_ID_VEHICULO AS ID_VEHICULO, VEH_TIPO_VEHICULO AS TIPO_VEHICULO, VEH_PLACA AS PLACA, VEH_MARCA AS MARCA, VEH_MODELO AS MODELO, VEH_COLOR AS COLOR, VEH_ACTIVO AS ACTIVO 
       FROM INFRA_DEV.LR_VEHICULO WHERE LR_CARNE = :carne AND VEH_ACTIVO = 1 ORDER BY VEH_FECHA_REGISTRO ASC`, 
      { carne: carneLimpio }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json(result.rows);
  } catch (err) { res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.get('/api/pagos/lista-pendiente/:carne', async (req, res) => {
  let connection;
  try {
    const carneLimpio = limpiarCarne(req.params.carne);
    connection = await oracledb.getConnection();
    const sql = `
      SELECT p.PAG_PAGO, 
             NVL(pl.PLN_NOMBRE_PLAN, NVL(m.MUL_DESCRIPCION, 'Marbete Vehículo Adicional')) AS DESCRIPCION,
             p.PAG_MONTO_TOTAL AS MONTO,
             p.PAG_ESTADO,
             CASE WHEN p.EMU_USUARIO_MULTA IS NOT NULL THEN 'MULTA' ELSE 'PLAN' END AS TIPO
      FROM INFRA_DEV.CB_PAGO p
      LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
      LEFT JOIN INFRA_DEV.CB_USUARIO_MULTA um ON p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA
      LEFT JOIN INFRA_DEV.CB_MULTA m ON um.MUL_MULTA = m.MUL_MULTA
      WHERE p.LR_CARNE = :carne 
      AND p.PAG_ESTADO = 'P'
      ORDER BY p.PAG_FECHA_PAGO DESC
    `;
    const result = await connection.execute(sql, { carne: carneLimpio }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json(result.rows);
  } catch (err) { res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.post('/api/vehiculos', async (req, res) => {
  let connection;
  try {
    const { carne_usuario, tipo_vehiculo, placa, marca, modelo, color, plan_id } = req.body;
    
    // 1. Limpieza de datos críticos para evitar berrinches de Oracle
    const carneLimpio = limpiarCarne(carne_usuario);
    const placaLimpia = placa ? placa.trim().toUpperCase() : '';
    // Quitamos tildes y forzamos mayúsculas (Ej. "Automóvil" -> "AUTOMOVIL")
    const tipoLimpio = tipo_vehiculo 
      ? tipo_vehiculo.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      : 'AUTOMOVIL';

    connection = await oracledb.getConnection();
    
    // 2. Guardamos el vehículo con los datos ya limpios
    await connection.execute(
      `INSERT INTO INFRA_DEV.LR_VEHICULO (
         VEH_ID_VEHICULO, LR_CARNE, VEH_TIPO_VEHICULO, VEH_PLACA, VEH_MARCA, VEH_MODELO, VEH_COLOR, VEH_ACTIVO
       ) 
       VALUES (
         NVL((SELECT MAX(VEH_ID_VEHICULO) FROM INFRA_DEV.LR_VEHICULO), 0) + 1, 
         :carne_usuario, :tipo_vehiculo, :placa, :marca, :modelo, :color, 1
       )`, 
      { 
        carne_usuario: carneLimpio, 
        tipo_vehiculo: tipoLimpio, 
        placa: placaLimpia, 
        marca: marca || null, 
        modelo: modelo || null, 
        color: color || null 
      }
    );

    // 3. Lógica de creación de Pagos
    if (plan_id) {
      const planResult = await connection.execute(
        `SELECT PLN_PRECIO FROM INFRA_DEV.CB_PLAN_PARQUEO WHERE PLN_PLAN = :plan_id`, 
        { plan_id }, 
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (planResult.rows.length > 0) {
        await connection.execute(
          `INSERT INTO INFRA_DEV.CB_PAGO (LR_CARNE, PLN_PLAN, FPG_FORMA_PAGO, PAG_MONTO_TOTAL, PAG_ESTADO) 
           VALUES (:carne, :plan, 1, :precio, 'P')`, 
          { carne: carneLimpio, plan: plan_id, precio: planResult.rows[0].PLN_PRECIO }
        );
      }
    } else {
      // Si no hay plan seleccionado, se le cobra una tarifa base/mínima (ej. 50 GTQ)
      await connection.execute(
        `INSERT INTO INFRA_DEV.CB_PAGO (LR_CARNE, FPG_FORMA_PAGO, PAG_MONTO_TOTAL, PAG_ESTADO) 
         VALUES (:carne, 1, 50, 'P')`, 
        { carne: carneLimpio }
      );
    }

    await connection.commit();
    res.status(200).json({ mensaje: "Vehículo registrado exitosamente" });

  } catch (err) {
    if (connection) await connection.rollback();
    
    console.error("❌ Error al guardar vehículo:", err);

    // Traducción de errores de Oracle para el usuario:
    if (err.errorNum === 1 || (err.message && err.message.includes('ORA-00001'))) {
      return res.status(400).json({ error: "¡Ups! Esta placa ya se encuentra registrada en el sistema." });
    }
    if (err.message && err.message.includes('CHK_TIPO_VEHICULO')) {
      return res.status(400).json({ error: "Tipo de vehículo no válido (Debe ser AUTOMOVIL, MOTOCICLETA, CAMIONETA u OTRO)." });
    }

    res.status(500).json({ error: "Error interno", detalle: err.message });
  } finally { 
    if (connection) { try { await connection.close(); } catch (e) {} } 
  }
});

// =============================================
// 🔥 RUTAS ADMIN
// =============================================

app.get('/api/admin/usuarios', verificarToken, esAdmin, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT u.LR_CARNE as carne, u.LR_NOMBRES as nombres, u.LR_APELLIDOS as apellidos, 
             u.LR_NOMBRES || ' ' || u.LR_APELLIDOS AS nombre, 
             u.LR_CORREO_INSTITUCIONAL AS correo, u.LR_TELEFONO as telefono, u.ROL_ID_ROL as id_rol,
             r.ROL_NOMBRE_ROL AS rol, CASE WHEN u.LR_ACTIVO = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
      FROM INFRA_DEV.LR_USUARIO u JOIN INFRA_DEV.LR_ROL r ON u.ROL_ID_ROL = r.ROL_ID_ROL ORDER BY u.LR_FECHA_REGISTRO DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    // Le ponemos guiones a todos los carnés que regresan al frontend del admin
    const dataConGuiones = result.rows.map(row => ({
      ...row,
      CARNE: row.CARNE ? row.CARNE.toString().replace(/(\d{4})(\d{2})(\d+)/, '$1-$2-$3') : null
    }));

    res.status(200).json(dataConGuiones);
  } catch (err) { res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.put('/api/admin/usuarios/:carne', verificarToken, esAdmin, async (req, res) => {
  let connection;
  try {
    const carneLimpio = limpiarCarne(req.params.carne);
    const { nombres, apellidos, correo_institucional, telefono, id_rol } = req.body;
    connection = await oracledb.getConnection();
    const sql = `UPDATE INFRA_DEV.LR_USUARIO SET LR_NOMBRES = :nombres, LR_APELLIDOS = :apellidos, LR_CORREO_INSTITUCIONAL = :correo, LR_TELEFONO = :telefono, ROL_ID_ROL = :id_rol WHERE LR_CARNE = :carne`;
    await connection.execute(sql, { nombres, apellidos, correo: correo_institucional, telefono: telefono || null, id_rol: parseInt(id_rol), carne: carneLimpio });
    await connection.commit();
    res.status(200).json({ mensaje: "Usuario actualizado" });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.put('/api/admin/usuarios/:carne/estado', verificarToken, esAdmin, async (req, res) => {
  let connection;
  try {
    const carneLimpio = limpiarCarne(req.params.carne);
    const { nuevoEstado } = req.body; 
    connection = await oracledb.getConnection();
    await connection.execute(`UPDATE INFRA_DEV.LR_USUARIO SET LR_ACTIVO = :nuevoEstado WHERE LR_CARNE = :carne`, { nuevoEstado, carne: carneLimpio });
    await connection.commit();
    res.status(200).json({ mensaje: "Actualizado" });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.get('/api/admin/estadisticas', verificarToken, esAdmin, async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const resCarros = await connection.execute(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.LR_VEHICULO WHERE VEH_TIPO_VEHICULO = 'AUTOMOVIL'`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const resMotos = await connection.execute(`SELECT COUNT(*) AS TOTAL FROM INFRA_DEV.LR_VEHICULO WHERE VEH_TIPO_VEHICULO = 'MOTOCICLETA'`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const resIngresos = await connection.execute(`SELECT NVL(SUM(PAG_MONTO_TOTAL), 0) AS TOTAL FROM INFRA_DEV.CB_PAGO WHERE PAG_ESTADO = 'C'`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ carros: resCarros.rows[0].TOTAL, motos: resMotos.rows[0].TOTAL, ingresos: resIngresos.rows[0].TOTAL });
  } catch (err) { res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.get('/api/admin/pagos', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT p.PAG_PAGO, p.LR_CARNE AS CARNE_USUARIO, u.LR_NOMBRES || ' ' || u.LR_APELLIDOS as NOMBRE, 
             NVL(pl.PLN_NOMBRE_PLAN, m.MUL_DESCRIPCION) AS CONCEPTO, 
             p.PAG_MONTO_TOTAL, p.PAG_ESTADO, 
             TO_CHAR(p.PAG_FECHA_PAGO, 'DD/MM/YYYY HH24:MI') as FECHA
      FROM INFRA_DEV.CB_PAGO p
      LEFT JOIN INFRA_DEV.LR_USUARIO u ON p.LR_CARNE = u.LR_CARNE
      LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
      LEFT JOIN INFRA_DEV.CB_USUARIO_MULTA um ON p.EMU_USUARIO_MULTA = um.EMU_USUARIO_MULTA
      LEFT JOIN INFRA_DEV.CB_MULTA m ON um.MUL_MULTA = m.MUL_MULTA
      ORDER BY p.PAG_FECHA_PAGO DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    const dataConGuiones = result.rows.map(row => ({
      ...row,
      CARNE_USUARIO: row.CARNE_USUARIO ? row.CARNE_USUARIO.toString().replace(/(\d{4})(\d{2})(\d+)/, '$1-$2-$3') : null
    }));

    res.status(200).json(dataConGuiones);
  } catch (err) { res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.put('/api/admin/pagos/:id/aprobar', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await oracledb.getConnection();
    await connection.execute(`UPDATE INFRA_DEV.CB_PAGO SET PAG_ESTADO = 'C' WHERE PAG_PAGO = :id`, { id });
    await connection.commit();
    res.status(200).json({ mensaje: "Pago Aprobado" });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ error: "Error de servidor", detalle: err.message }); } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.get('/api/admin/multas-catalogo', (req, res) => { 
  serveCatalog(req, res, 'multasCatalogo', "SELECT MUL_MULTA, MUL_DESCRIPCION, MUL_MONTO_TOTAL FROM INFRA_DEV.CB_MULTA WHERE MUL_ESTADO_REGISTRO = 'A'"); 
});

app.post('/api/admin/multas', async (req, res) => {
  let connection;
  try {
    const { carne, placa, id_multa } = req.body;
    const carneLimpio = limpiarCarne(carne);
    connection = await oracledb.getConnection();
    
    // Primero, buscamos el ID del vehículo por placa y carné para amarrarlo a la multa
    const resVeh = await connection.execute(
      `SELECT VEH_ID_VEHICULO FROM INFRA_DEV.LR_VEHICULO WHERE LR_CARNE = :carne AND VEH_PLACA = :placa`, 
      { carne: carneLimpio, placa: placa.toUpperCase() }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if(resVeh.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el vehículo con esa placa asignado a este carné." });
    }
    const idVehiculo = resVeh.rows[0].VEH_ID_VEHICULO;

    // Insertamos la multa
    const resultMulta = await connection.execute(
      `INSERT INTO INFRA_DEV.CB_USUARIO_MULTA (MUL_MULTA, VEH_ID_VEHICULO, EMU_ESTADO_MULTA) 
       VALUES (:id_multa, :id_veh, 'A') RETURNING EMU_USUARIO_MULTA INTO :id_generado`,
      { id_multa: parseInt(id_multa), id_veh: idVehiculo, id_generado: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }
    );
    const idUsuarioMulta = resultMulta.outBinds.id_generado[0];
    
    // Sacamos el monto de la multa
    const resMonto = await connection.execute(`SELECT MUL_MONTO_TOTAL FROM INFRA_DEV.CB_MULTA WHERE MUL_MULTA = :id`, { id: parseInt(id_multa) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const monto = resMonto.rows[0].MUL_MONTO_TOTAL;

    // Insertamos la deuda en pagos
    await connection.execute(
      `INSERT INTO INFRA_DEV.CB_PAGO (LR_CARNE, EMU_USUARIO_MULTA, FPG_FORMA_PAGO, PAG_MONTO_TOTAL, PAG_ESTADO)
       VALUES (:carne, :id_usu_multa, 1, :monto, 'P')`,
      { carne: carneLimpio, id_usu_multa: idUsuarioMulta, monto }
    );

    await connection.commit();
    res.status(200).json({ mensaje: "Multa asignada y cargada a cuenta." });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Error interno al procesar multa", detalle: err.message });
  } finally { if (connection) { try { await connection.close(); } catch (e) {} } }
});

app.get('/api/admin/reportes', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const resDemografia = await connection.execute(
      `SELECT VEH_TIPO_VEHICULO AS "nombre", COUNT(*) AS "cantidad" FROM INFRA_DEV.LR_VEHICULO WHERE VEH_ACTIVO = 1 GROUP BY VEH_TIPO_VEHICULO`, 
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resIngresos = await connection.execute(
      `SELECT NVL(pl.PLN_NOMBRE_PLAN, 'Multas') AS "plan", NVL(SUM(p.PAG_MONTO_TOTAL), 0) AS "total"
       FROM INFRA_DEV.CB_PAGO p 
       LEFT JOIN INFRA_DEV.CB_PLAN_PARQUEO pl ON p.PLN_PLAN = pl.PLN_PLAN
       WHERE p.PAG_ESTADO = 'C' 
       GROUP BY pl.PLN_NOMBRE_PLAN`, 
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resMorosos = await connection.execute(
      `SELECT u.LR_NOMBRES || ' ' || u.LR_APELLIDOS AS "usuario", SUM(p.PAG_MONTO_TOTAL) AS "deuda"
       FROM INFRA_DEV.CB_PAGO p JOIN INFRA_DEV.LR_USUARIO u ON p.LR_CARNE = u.LR_CARNE
       WHERE p.PAG_ESTADO = 'P'
       GROUP BY u.LR_NOMBRES, u.LR_APELLIDOS
       ORDER BY "deuda" DESC FETCH FIRST 5 ROWS ONLY`, 
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      demografia: resDemografia.rows,
      ingresosPorPlan: resIngresos.rows,
      morosos: resMorosos.rows
    });

  } catch (err) {
    res.status(500).json({ error: "Error de servidor", detalle: err.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) {} }
  }
});

app.listen(port, () => {
  console.log(`[SERVER] Parqueo en http://localhost:${port}`);
});