/**
 * ═══════════════════════════════════════════════════════
 *  VALIDACIÓN JWT ENTRE MÓDULOS
 *  Ejecutar desde: login-back/
 *  Comando: node validar_jwt.js
 * ═══════════════════════════════════════════════════════
 */
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

console.log('\n🔍 ═══════════════════════════════════════════════════');
console.log('   VALIDACIÓN JWT: login-back ↔ cobros-back');
console.log('═══════════════════════════════════════════════════\n');

// --- PASO 1: Comparar JWT_SECRET ---
const loginEnv = dotenv.config({ path: path.join(__dirname, '.env') });
const cobrosEnvPath = path.join(__dirname, '..', 'cobros-back', '.env');
const cobrosEnv = dotenv.config({ path: cobrosEnvPath, override: true });

const secretLogin = loginEnv.parsed?.JWT_SECRET;
const secretCobros = cobrosEnv.parsed?.JWT_SECRET;

console.log('📋 PASO 1: Verificación de JWT_SECRET\n');

if (!secretLogin) {
    console.log('   ❌ login-back/.env  → JWT_SECRET NO ENCONTRADO');
} else {
    console.log(`   ✅ login-back/.env  → JWT_SECRET = ${secretLogin.substring(0, 10)}...`);
}

if (!secretCobros) {
    console.log('   ⚠️  cobros-back/.env → JWT_SECRET NO ENCONTRADO');
    console.log(`\n   👉 ACCIÓN: Agrega a cobros-back/.env:`);
    console.log(`      JWT_SECRET=${secretLogin || '<VALOR>'}\n`);
} else {
    console.log(`   ✅ cobros-back/.env → JWT_SECRET = ${secretCobros.substring(0, 10)}...`);
    if (secretLogin === secretCobros) {
        console.log('\n   ✅ ¡COINCIDEN! Ambos módulos comparten el mismo secreto.\n');
    } else {
        console.log('\n   ❌ ¡NO COINCIDEN! Los tokens serán rechazados por cobros-back.\n');
    }
}

// --- PASO 2: Simular firma y verificación ---
const secret = secretLogin || 'test-fallback';
console.log('📋 PASO 2: Simulación de Token JWT\n');

const tokenAdmin = jwt.sign({ carne: '5190-23-202034', rol: 'ADMINISTRADOR' }, secret, { expiresIn: '8h' });
const tokenUser = jwt.sign({ carne: '0905-23-12345', rol: 'USUARIO' }, secret, { expiresIn: '8h' });

// Verificar admin
const dAdmin = jwt.verify(tokenAdmin, secret);
console.log(`   Token ADMIN → carne: ${dAdmin.carne} | rol: "${dAdmin.rol}" (${typeof dAdmin.rol})`);
console.log(`   checkRole(['ADMINISTRADOR'])            → ${['ADMINISTRADOR'].includes(dAdmin.rol) ? '✅ PASA' : '❌ FALLA'}`);
console.log(`   checkRole(['ADMINISTRADOR','USUARIO'])  → ${['ADMINISTRADOR','USUARIO'].includes(dAdmin.rol) ? '✅ PASA' : '❌ FALLA'}`);

// Verificar usuario
const dUser = jwt.verify(tokenUser, secret);
console.log(`\n   Token USUARIO → carne: ${dUser.carne} | rol: "${dUser.rol}" (${typeof dUser.rol})`);
console.log(`   checkRole(['ADMINISTRADOR'])            → ${['ADMINISTRADOR'].includes(dUser.rol) ? '⚠️ PASA (inesperado)' : '🔒 RECHAZADO (correcto)'}`);
console.log(`   checkRole(['ADMINISTRADOR','USUARIO'])  → ${['ADMINISTRADOR','USUARIO'].includes(dUser.rol) ? '✅ PASA' : '❌ FALLA'}`);

// --- PASO 3: Seguridad ---
console.log('\n📋 PASO 3: Prueba de seguridad\n');
try {
    jwt.verify(tokenAdmin, 'secreto-falso-de-atacante');
    console.log('   ❌ FALLO: Token aceptado con secreto incorrecto!');
} catch (e) {
    console.log('   ✅ Token rechazado con secreto incorrecto (seguridad OK)');
}

// --- PASO 4: Test HTTP en vivo ---
console.log('\n📋 PASO 4: Prueba HTTP en vivo\n');

function httpGet(port, urlPath, token) {
    return new Promise((resolve) => {
        const opts = {
            hostname: 'localhost', port, path: urlPath, method: 'GET', timeout: 3000,
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        };
        const req = http.request(opts, (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', () => resolve({ status: 'OFFLINE' }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
        req.end();
    });
}

(async () => {
    // login-back (3001)
    const lb = await httpGet(3001, '/', null);
    if (lb.status === 'OFFLINE') {
        console.log('   ⚪ login-back  (3001) → Apagado');
    } else {
        console.log(`   ✅ login-back  (3001) → Online`);
        const noTk = await httpGet(3001, '/api/admin/usuarios', null);
        console.log(`      SIN token → /api/admin/usuarios = ${noTk.status} ${noTk.status === 401 ? '✅ Bloqueado' : '❌ Debería ser 401'}`);
        const conTk = await httpGet(3001, '/api/admin/usuarios', tokenAdmin);
        console.log(`      CON token → /api/admin/usuarios = ${conTk.status} ${conTk.status === 200 ? '✅ Aceptado' : `⚠️ (${conTk.status})`}`);
    }

    // cobros-back (4000)
    const cb = await httpGet(4000, '/', null);
    if (cb.status === 'OFFLINE') {
        console.log('\n   ⚪ cobros-back (4000) → Apagado');
    } else {
        console.log(`\n   ✅ cobros-back (4000) → Online`);
        const cross = await httpGet(4000, '/api/usuario/carne/5190-23-202034', tokenAdmin);
        console.log(`      Token de login → cobros = ${cross.status} ${cross.status === 200 ? '✅ ¡COMPATIBILIDAD CONFIRMADA!' : cross.status === 401 ? '❌ JWT_SECRET no coincide' : `(${cross.status})`}`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   FIN DE LA VALIDACIÓN');
    console.log('═══════════════════════════════════════════════════\n');
})();
