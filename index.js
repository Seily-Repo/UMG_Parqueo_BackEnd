require('dotenv').config();
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');
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

// 🔥 CONFIGURACIÓN DEL CARTERO (GMAIL)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta de prueba
app.get('/', async (req, res) => {
  res.json({ mensaje: "Conexion exitosa a Oracle 21c (Usuario: parqueo_umg)" });
});

// =============================================
// SISTEMA DE CACHÉ EN MEMORIA (Nativo Node.js)
// =============================================
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; 

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function serveCatalog(req, res, cacheKey, sql) {
  const cached = getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    setCache(cacheKey, result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(`[ERROR] Error al obtener ${cacheKey}:`, err.message);
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { /* ignore */ }
    }
  }
}

// =============================================
// ENDPOINTS DE CATÁLOGOS DINÁMICOS
// =============================================
app.get('/api/facultades', async (req, res) => { serveCatalog(req, res, 'facultades', 'SELECT id_facultad, nombre_facultad FROM FACULTAD ORDER BY nombre_facultad ASC'); });
app.get('/api/sedes', (req, res) => { serveCatalog(req, res, 'sedes', 'SELECT id_sede, nombre_sede FROM SEDE_CAMPUS ORDER BY nombre_sede'); });
app.get('/api/ciclos', (req, res) => { serveCatalog(req, res, 'ciclos', 'SELECT id_ciclo, nombre_ciclo FROM CICLO_SEMESTRE ORDER BY id_ciclo'); });
app.get('/api/secciones', (req, res) => { serveCatalog(req, res, 'secciones', 'SELECT id_seccion, nombre_seccion FROM SECCION ORDER BY id_seccion'); });
app.get('/api/jornadas', (req, res) => { serveCatalog(req, res, 'jornadas', 'SELECT id_jornada, nombre_jornada FROM JORNADAS WHERE activo = 1 ORDER BY id_jornada'); });
app.get('/api/departamentos', (req, res) => { serveCatalog(req, res, 'departamentos', 'SELECT id_departamento, nombre_departamento FROM DEPARTAMENTOS ORDER BY nombre_departamento'); });

app.get('/api/municipios/:id_depto', async (req, res) => {
  const idDepto = parseInt(req.params.id_depto);
  const cacheKey = `municipios_${idDepto}`;
  const cached = getCache(cacheKey);
  if (cached) return res.status(200).json(cached);
  
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT id_municipio, nombre_municipio FROM MUNICIPIOS WHERE id_departamento = :id ORDER BY nombre_municipio',
      { id: idDepto }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    setCache(cacheKey, result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error interno", detalle: err.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { } }
  }
});

// --- RUTA PRINCIPAL: Recibir datos de React y guardar en Oracle
app.post('/api/auth/registro', async (req, res) => {
  let connection;
  try {
    // 🔥 Extraemos la bandera creadoPorAdmin que mandó React
    const { creadoPorAdmin, ...datos } = req.body; 
    console.log("[INFO] Datos recibidos desde React:", datos, "Admin:", creadoPorAdmin);

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(datos.password, salt);

    // 🔥 Lógica dinámica: Si lo hizo el admin exige cambio (1), si no (0)
    const requiereCambio = creadoPorAdmin ? 1 : 0; 

    connection = await oracledb.getConnection(dbConfig);

    const sqlUsuario = `
      INSERT INTO USUARIOS (
        carne, nombres, apellidos, correo_institucional, contrasena,
        telefono, id_municipio, zona, nomenclatura, id_categoria, 
        id_sede, id_facultad, id_ciclo, id_seccion, id_jornada, id_rol, activo, requiere_cambio_pass
      ) VALUES (
        :carne, :nombres, :apellidos, :correo, :contrasena,
        :telefono, :id_municipio, :zona, :nomenclatura, :id_categoria, 
        :id_sede, :id_facultad, :id_ciclo, :id_seccion, :id_jornada, :id_rol, 1, :requiere_cambio
      )
    `;

    const bindsUsuario = {
      carne: datos.carne,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      correo: datos.correo_electronico, 
      contrasena: contrasenaEncriptada,
      telefono: datos.telefonos,
      id_municipio: datos.id_municipio ? parseInt(datos.id_municipio) : null,
      zona: datos.zona ? parseInt(datos.zona) : null,
      nomenclatura: datos.nomenclatura || 'N/A',
      id_categoria: datos.id_rol ? parseInt(datos.id_rol) : 1, 
      id_sede: datos.id_sede ? parseInt(datos.id_sede) : 1, 
      id_facultad: datos.id_facultad ? parseInt(datos.id_facultad) : null,
      id_ciclo: datos.id_ciclo ? parseInt(datos.id_ciclo) : null,
      id_seccion: datos.id_seccion ? parseInt(datos.id_seccion) : null,
      id_jornada: datos.id_jornada ? parseInt(datos.id_jornada) : 1, 
      id_rol: 3,
      requiere_cambio: requiereCambio // Pasamos la variable a Oracle
    };

    await connection.execute(sqlUsuario, bindsUsuario);

    const sqlEmergencia = `
      INSERT INTO DATOS_EMERGENCIA (carne_usuario, nombre_contacto, telefono_emergencia)
      VALUES (:carne, :nombre, :telefono)
    `;
    
    const bindsEmergencia = {
      carne: datos.carne,
      nombre: datos.emergencia_nombre || 'Pendiente',
      telefono: datos.emergencia_telefono || '00000000'
    };

    await connection.execute(sqlEmergencia, bindsEmergencia);
    await connection.commit();

    console.log("[OK] Usuario registrado exitosamente en BD Oracle.");

    // 🔥 HTML DINÁMICO PARA EL CORREO
    const mensajePasswordHtml = creadoPorAdmin 
      ? `<p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Contraseña Temporal:</strong> <span style="color: #d32f2f; font-weight: bold;">${datos.password}</span></p>
         <p style="margin: 10px 0 0 0; font-size: 13px; color: #555;">(Por tu seguridad, el sistema te pedirá cambiar esta contraseña al iniciar sesión por primera vez).</p>`
      : `<p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Contraseña:</strong> <span style="color: #28a745; font-weight: bold;">(La que ingresaste de forma segura en el formulario)</span></p>`;

    try {
      const mailOptions = {
        from: `"Parqueo UMG" <${process.env.EMAIL_USER}>`,
        to: datos.correo_electronico,
        subject: '🚗 ¡Bienvenido al Sistema de Parqueo UMG!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #002b5c; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-style: italic;">Parqueo UMG</h2>
            </div>
            <div style="padding: 30px; color: #333333;">
              <h3 style="color: #004b87;">¡Hola, ${datos.nombres.split(' ')[0]}!</h3>
              <p>Te damos la bienvenida. Tu cuenta para el <strong>Sistema de Control de Parqueo</strong> ha sido creada exitosamente.</p>
              
              <div style="background-color: #f4f7f6; padding: 15px; border-left: 5px solid #00d2ff; margin: 25px 0; border-radius: 5px;">
                <p style="margin: 0; font-size: 16px;"><strong>Tu Carné de Acceso:</strong> <span style="color: #004b87; font-weight: bold;">${datos.carne}</span></p>
                ${mensajePasswordHtml} 
              </div>

              <p>Ya puedes iniciar sesión en nuestro portal web para registrar tus vehículos, solicitar tu marbete y gestionar tus accesos al campus.</p>
              <br/>
              <p style="margin: 0;">Saludos cordiales,</p>
              <p style="font-weight: bold; margin-top: 5px; color: #002b5c;">Administración de Parqueo UMG</p>
            </div>
            <div style="background-color: #f8f9fa; text-align: center; padding: 15px; font-size: 12px; color: #888888;">
              Este es un correo generado automáticamente. Por favor, no respondas a esta dirección.
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL OK] Correo de bienvenida enviado a: ${datos.correo_electronico}`);
    } catch (emailError) {
      console.error("[EMAIL ERROR] Falló el envío de correo:", emailError.message);
    }

    res.status(200).json({ mensaje: "Tu registro se completó con éxito. Ya puedes iniciar sesión." });

  } catch (err) {
    console.error("[ERROR] Error al guardar en Oracle:", err);
    if (connection) { await connection.rollback(); }
    if (err.errorNum === 1) { return res.status(400).json({ error: "El carné o correo ingresado ya se encuentra registrado en el sistema." }); }
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
  }
});

// --- RUTA DE LOGIN: Validar credenciales
app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { carne, correo_institucional, correo_electronico, password } = req.body;
    const identificador = carne || correo_institucional || correo_electronico; 
    console.log(`🔑 Intento de login para: ${identificador}`);

    connection = await oracledb.getConnection(dbConfig);

    // 🔥 MODIFICADO: Ahora traemos también requiere_cambio_pass de Oracle
    const result = await connection.execute(
      `SELECT carne, nombres, apellidos, correo_institucional, contrasena, id_rol, requiere_cambio_pass 
       FROM USUARIOS 
       WHERE (carne = :identificador OR correo_institucional = :identificador) AND activo = 1`,
      { identificador: identificador },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    }

    const usuario = result.rows[0];
    const contrasenaValida = await bcrypt.compare(password, usuario.CONTRASENA);

    if (!contrasenaValida) {
      return res.status(401).json({ error: "Carné o contraseña incorrectos." });
    }

    console.log(`[OK] Acceso concedido a: ${usuario.NOMBRES}`);
    
    // 🔥 Mandamos el flag requiereCambioPass hacia React
    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        carne: usuario.CARNE,
        nombres: usuario.NOMBRES,
        apellidos: usuario.APELLIDOS,
        rol: usuario.ID_ROL,
        requiereCambioPass: usuario.REQUIERE_CAMBIO_PASS === 1 
      }
    });

  } catch (err) {
    console.error("[ERROR] Error en el Login:", err);
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { console.error(e); } }
  }
});

// =============================================
// RUTA ADMIN: Traer lista de usuarios para el Dashboard
// =============================================
app.get('/api/admin/usuarios', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const sql = `
      SELECT 
        u.carne, 
        u.nombres || ' ' || u.apellidos AS nombre, 
        u.correo_institucional AS correo, 
        r.nombre_rol AS rol,
        CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
      FROM USUARIOS u
      JOIN ROLES r ON u.id_rol = r.id_rol
      ORDER BY u.fecha_registro DESC
    `;
    
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json(result.rows);
    
  } catch (err) {
    console.error("[ERROR] Error al obtener usuarios para Admin:", err);
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
});

// =============================================
// RUTA ADMIN: Cambiar estado de usuario (Activar/Desactivar)
// =============================================
app.put('/api/admin/usuarios/:carne/estado', async (req, res) => {
  let connection;
  try {
    const { carne } = req.params;
    const { nuevoEstado } = req.body; 

    connection = await oracledb.getConnection(dbConfig);
    
    const sql = `
      UPDATE USUARIOS 
      SET activo = :nuevoEstado 
      WHERE carne = :carne
    `;
    
    await connection.execute(sql, { nuevoEstado, carne });
    await connection.commit();

    res.status(200).json({ mensaje: "Estado actualizado exitosamente en Oracle" });
    
  } catch (err) {
    console.error("[ERROR] Error al cambiar estado:", err);
    if (connection) { await connection.rollback(); }
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
});

app.listen(port, () => {
  console.log(`[SERVER] Servidor de Parqueo corriendo en http://localhost:${port}`);
});