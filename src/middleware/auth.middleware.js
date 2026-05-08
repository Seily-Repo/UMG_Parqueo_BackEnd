const jwt = require('jsonwebtoken');

// Middleware para verificar la validez del token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    // El payload real viene envuelto en un objeto "usuario"
    let userPayload = decoded.usuario || decoded;
    
    // Normalizamos el carné quitando los guiones (ej. "5190-23-17607" -> "51902317607")
    if (userPayload.carne) {
      userPayload = { ...userPayload, carne: userPayload.carne.replace(/-/g, '') };
    }
    
    req.user = userPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.', error: error.message });
  }
};

// Middleware para verificar si el usuario tiene el rol adecuado
const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const userRole = req.user.rol;

    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.',
        rolRequerido: rolesPermitidos,
        rolUsuario: userRole || 'Desconocido'
      });
    }

    next();
  };
};

// Middleware para validar que el USUARIO solo pueda consultar su propia información
const checkOwnership = (paramName = 'carne') => {
  return (req, res, next) => {
    // Si es ADMINISTRADOR, tiene acceso total a cualquier carné
    if (req.user.rol === 'ADMINISTRADOR') {
      return next();
    }
    
    // Si es USUARIO, validamos que el parámetro solicitado coincida con su token
    let requestedCarne = req.params[paramName];
    
    if (requestedCarne) {
      requestedCarne = requestedCarne.replace(/-/g, '');
    }

    if (requestedCarne && requestedCarne === req.user.carne) {
      return next();
    }
    
    return res.status(403).json({
      message: 'Acceso denegado. Solo puedes consultar tu propia información.'
    });
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkOwnership
};
