const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Esquema de Usuario para registro rápido
 * Permite a los usuarios registrarse, hacer login y interactuar con el blog
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password por defecto en consultas
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password; // Nunca devolver password en JSON
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para optimizar consultas
// Nota: email ya tiene index único por unique: true en el schema
userSchema.index({ createdAt: -1 });

/**
 * Middleware pre-save: Hashear password antes de guardar
 */
userSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();
  
  try {
    // Hashear password con salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método de instancia: Comparar password
 * @param {string} candidatePassword - Password a comparar
 * @returns {boolean} - True si coincide
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

/**
 * Método de instancia: Actualizar último login
 */
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

/**
 * Método estático: Buscar usuario por email
 * @param {string} email - Email del usuario
 * @returns {Object} - Usuario encontrado
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Método estático: Verificar si email existe
 * @param {string} email - Email a verificar
 * @returns {boolean} - True si existe
 */
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

/**
 * Virtual: Información pública del usuario (sin datos sensibles)
 */
userSchema.virtual('publicInfo').get(function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Asegurar que los virtuals se incluyan en JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);

