const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica si el usuario está autenticado y agrega la información del usuario a req.user
 */

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        error: 'La cuenta del usuario está desactivada'
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'El token proporcionado no es válido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al verificar la autenticación'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega req.user si existe
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // En caso de error, simplemente continuar sin usuario
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {...string} roles - Roles permitidos
 * @returns {Function} - Middleware function
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 * @param {string} userIdParam - Nombre del parámetro que contiene el userId
 * @returns {Function} - Middleware function
 */
const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Si es admin, permitir acceso
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar si el usuario es propietario del recurso
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    if (req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: 'Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  };
};

/**
 * Función para generar token JWT
 * @param {Object} user - Objeto usuario
 * @returns {string} - Token JWT
 */
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'blog-api',
    audience: process.env.JWT_AUDIENCE || 'blog-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Función para verificar token JWT sin middleware
 * @param {string} token - Token JWT
 * @returns {Object} - Objeto con resultado de verificación
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return { valid: false, error: 'Usuario no encontrado o inactivo' };
    }

    return { valid: true, user, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership,
  generateToken,
  verifyToken
};

