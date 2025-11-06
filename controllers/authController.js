const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * Controlador de Autenticación
 * Maneja registro, login, logout y gestión de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         avatar:
 *           type: string
 *           description: URL del avatar del usuario
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: Rol del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Último login
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: Token JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro rápido de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
        error: 'Ya existe un usuario con este email'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Guardar usuario en la base de datos
    await user.save();

    // Generar token JWT
    const token = generateToken(user);

    // Actualizar último login
    await user.updateLastLogin();

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.publicInfo,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      });
    }

    // Error de duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
        error: 'Ya existe un usuario con este email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al registrar usuario'
    });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales inválidas
 */
const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email (incluyendo password para comparación)
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada',
        error: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Actualizar último login
    await user.updateLastLogin();

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.publicInfo,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al iniciar sesión'
    });
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 */
const getCurrentUser = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware
    res.json({
      success: true,
      message: 'Información del usuario obtenida exitosamente',
      data: req.user.publicInfo
    });

  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al obtener información del usuario'
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autenticado
 */
const logout = async (req, res) => {
  try {
    // En un sistema JWT stateless, el logout se maneja en el frontend
    // eliminando el token del almacenamiento local
    // Aquí solo confirmamos que el logout fue exitoso
    
    res.json({
      success: true,
      message: 'Logout exitoso',
      data: {
        message: 'Sesión cerrada correctamente. Elimina el token del almacenamiento local.'
      }
    });

  } catch (error) {
    console.error('Error en logout:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al cerrar sesión'
    });
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: No autenticado
 */
const refreshToken = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware
    const newToken = generateToken(req.user);

    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Error al renovar token:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al renovar token'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken
};

