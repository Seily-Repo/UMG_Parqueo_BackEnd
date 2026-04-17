require('dotenv').config();
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

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

app.get('/api/facultades', async (req, res) => {
  serveCatalog(req, res, 'facultades', 'SELECT id_facultad, nombre_facultad FROM FACULTAD ORDER BY nombre_facultad ASC');
});

app.get('/api/sedes', (req, res) => {
  serveCatalog(req, res, 'sedes', 'SELECT id_sede, nombre_sede FROM SEDE_CAMPUS ORDER BY nombre_sede');
});

app.get('/api/ciclos', (req, res) => {
  serveCatalog(req, res, 'ciclos', 'SELECT id_ciclo, nombre_ciclo FROM CICLO_SEMESTRE ORDER BY id_ciclo');
});

app.get('/api/secciones', (req, res) => {
  serveCatalog(req, res, 'secciones', 'SELECT id_seccion, nombre_seccion FROM SECCION ORDER BY id_seccion');
});

app.get('/api/jornadas', (req, res) => {
  serveCatalog(req, res, 'jornadas', 'SELECT id_jornada, nombre_jornada FROM JORNADAS WHERE activo = 1 ORDER BY id_jornada');
});

app.get('/api/departamentos', (req, res) => {
  serveCatalog(req, res, 'departamentos', 'SELECT id_departamento, nombre_departamento FROM DEPARTAMENTOS ORDER BY nombre_departamento');
});

app.get('/api/municipios/:id_depto', async (req, res) => {
  const idDepto = parseInt(req.params.id_depto);
  const cacheKey = `municipios_${idDepto}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      'SELECT id_municipio, nombre_municipio FROM MUNICIPIOS WHERE id_departamento = :id ORDER BY nombre_municipio',
      { id: idDepto },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    setCache(cacheKey, result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("[ERROR] Error al obtener municipios:", err.message);
    res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { /* ignore */ }
    }
  }
});

// --- RUTA PRINCIPAL: Recibir datos de React y guardar en Oracle
app.post('/api/auth/registro', async (req, res) => {
  let connection;
  try {
    const datos = req.body;
    console.log("[INFO] Datos recibidos desde React:", datos);

    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(datos.password, salt);

    connection = await oracledb.getConnection(dbConfig);

    const sqlUsuario = `
      INSERT INTO USUARIOS (
        carne, nombres, apellidos, correo_institucional, contrasena,
        telefono, id_municipio, zona, nomenclatura, id_categoria, 
        id_sede, id_facultad, id_ciclo, id_seccion, id_jornada, id_rol, activo
      ) VALUES (
        :carne, :nombres, :apellidos, :correo, :contrasena,
        :telefono, :id_municipio, :zona, :nomenclatura, :id_categoria, 
        :id_sede, :id_facultad, :id_ciclo, :id_seccion, :id_jornada, :id_rol, 1
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
      id_rol: 3 
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

    console.log("[OK] Usuario registrado exitosamente en BD.");
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

    const result = await connection.execute(
      `SELECT carne, nombres, apellidos, correo_institucional, contrasena, id_rol 
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
    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        carne: usuario.CARNE,
        nombres: usuario.NOMBRES,
        apellidos: usuario.APELLIDOS,
        rol: usuario.ID_ROL
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

app.listen(port, () => {
  console.log(`[SERVER] Servidor de Parqueo corriendo en http://localhost:${port}`);
});