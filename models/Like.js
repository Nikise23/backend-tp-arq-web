const mongoose = require('mongoose');

/**
 * Esquema de Like para sistema de reacciones por usuario
 * Permite a los usuarios autenticados dar/quitar likes a artículos
 */
const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido'],
    index: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'El ID del artículo es requerido'],
    index: true
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Índice compuesto único para prevenir likes duplicados
likeSchema.index({ userId: 1, articleId: 1 }, { unique: true });

// Índices para optimizar consultas
likeSchema.index({ articleId: 1, createdAt: -1 });
likeSchema.index({ userId: 1, createdAt: -1 });

/**
 * Método estático: Verificar si un usuario dio like a un artículo
 * @param {string} userId - ID del usuario
 * @param {string} articleId - ID del artículo
 * @returns {boolean} - True si el usuario dio like
 */
likeSchema.statics.userLikedArticle = async function(userId, articleId) {
  const like = await this.findOne({ userId, articleId });
  return !!like;
};

/**
 * Método estático: Contar likes de un artículo
 * @param {string} articleId - ID del artículo
 * @returns {number} - Número de likes
 */
likeSchema.statics.countLikesForArticle = async function(articleId) {
  return await this.countDocuments({ articleId });
};

/**
 * Método estático: Obtener likes de un artículo con información de usuarios
 * @param {string} articleId - ID del artículo
 * @param {number} limit - Límite de resultados
 * @returns {Array} - Array de likes con información de usuarios
 */
likeSchema.statics.getLikesForArticle = async function(articleId, limit = 10) {
  return await this.find({ articleId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Método estático: Obtener artículos que le gustaron a un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Límite de resultados
 * @returns {Array} - Array de likes con información de artículos
 */
likeSchema.statics.getUserLikedArticles = async function(userId, limit = 10) {
  return await this.find({ userId })
    .populate('articleId', 'title slug author date likesCount')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Método estático: Dar like (crear o no hacer nada si ya existe)
 * @param {string} userId - ID del usuario
 * @param {string} articleId - ID del artículo
 * @returns {Object} - Resultado de la operación
 */
likeSchema.statics.addLike = async function(userId, articleId) {
  try {
    // Verificar si ya existe el like
    const existingLike = await this.findOne({ userId, articleId });
    if (existingLike) {
      return { success: false, message: 'Ya diste like a este artículo' };
    }

    // Crear nuevo like
    const like = await this.create({ userId, articleId });
    return { success: true, like, message: 'Like agregado exitosamente' };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Ya diste like a este artículo' };
    }
    throw error;
  }
};

/**
 * Método estático: Quitar like
 * @param {string} userId - ID del usuario
 * @param {string} articleId - ID del artículo
 * @returns {Object} - Resultado de la operación
 */
likeSchema.statics.removeLike = async function(userId, articleId) {
  const result = await this.deleteOne({ userId, articleId });
  
  if (result.deletedCount === 0) {
    return { success: false, message: 'No habías dado like a este artículo' };
  }
  
  return { success: true, message: 'Like eliminado exitosamente' };
};

/**
 * Método estático: Toggle like (dar si no existe, quitar si existe)
 * @param {string} userId - ID del usuario
 * @param {string} articleId - ID del artículo
 * @returns {Object} - Resultado de la operación
 */
likeSchema.statics.toggleLike = async function(userId, articleId) {
  const existingLike = await this.findOne({ userId, articleId });
  
  if (existingLike) {
    // Quitar like
    await this.deleteOne({ _id: existingLike._id });
    return { 
      success: true, 
      action: 'removed', 
      message: 'Like eliminado exitosamente',
      liked: false
    };
  } else {
    // Dar like
    const like = await this.create({ userId, articleId });
    return { 
      success: true, 
      action: 'added', 
      like, 
      message: 'Like agregado exitosamente',
      liked: true
    };
  }
};

/**
 * Método estático: Obtener estadísticas de likes
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Object} - Estadísticas de likes
 */
likeSchema.statics.getLikeStats = async function(userId = null) {
  const pipeline = [];
  
  if (userId) {
    pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
  }
  
  pipeline.push(
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
        uniqueArticles: { $addToSet: '$articleId' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        totalLikes: 1,
        totalArticles: { $size: '$uniqueArticles' },
        totalUsers: { $size: '$uniqueUsers' }
      }
    }
  );
  
  const result = await this.aggregate(pipeline);
  return result[0] || { totalLikes: 0, totalArticles: 0, totalUsers: 0 };
};

module.exports = mongoose.model('Like', likeSchema);

