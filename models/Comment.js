const mongoose = require('mongoose');

/**
 * Esquema y Modelo para Comentarios del Blog
 * Incluye campos para artículo, autor, contenido, fecha y sistema de respuestas
 */

const commentSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'El ID del artículo es obligatorio'],
    index: true
  },
  // Referencia al usuario autenticado (opcional para mantener compatibilidad)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  // Campos para comentarios anónimos (mantener compatibilidad)
  author: {
    type: String,
    required: function() {
      return !this.userId; // Requerido solo si no hay userId
    },
    trim: true,
    maxlength: [100, 'El nombre del autor no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: function() {
      return !this.userId; // Requerido solo si no hay userId
    },
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  content: {
    type: String,
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true,
    minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // null para comentarios principales, ObjectId para respuestas
  },
  isApproved: {
    type: Boolean,
    default: true // En un blog real, podrías querer moderación manual
  },
  likesCount: {
    type: Number,
    default: 0,
    min: [0, 'El contador de likes no puede ser negativo']
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true, // Agrega automáticamente createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
commentSchema.index({ articleId: 1, createdAt: -1 }); // Índice para obtener comentarios de un artículo
commentSchema.index({ parentCommentId: 1 }); // Índice para respuestas
commentSchema.index({ isApproved: 1 }); // Índice para comentarios aprobados
commentSchema.index({ author: 1 }); // Índice para búsqueda por autor
commentSchema.index({ userId: 1, createdAt: -1 }); // Índice para comentarios por usuario

// Virtual para obtener respuestas (comentarios hijos)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

// Virtual para verificar si es una respuesta
commentSchema.virtual('isReply').get(function() {
  return this.parentCommentId !== null;
});

// Middleware pre-save para manejar ediciones
commentSchema.pre('save', function(next) {
  // Si el contenido cambió y no es la primera vez que se guarda
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Método estático para obtener comentarios de un artículo con paginación
commentSchema.statics.getCommentsForArticle = function(articleId, options = {}) {
  const { page = 1, limit = 20, includeReplies = true } = options;
  
  const query = {
    articleId: articleId,
    isApproved: true,
    parentCommentId: includeReplies ? { $exists: true } : null
  };
  
  return this.find(query)
    .populate('userId', 'name email avatar')
    .populate('replies', 'author content createdAt likesCount isEdited userId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('author content createdAt likesCount isEdited parentCommentId userId');
};

// Método estático para obtener respuestas de un comentario
commentSchema.statics.getRepliesForComment = function(commentId, options = {}) {
  const { page = 1, limit = 10 } = options;
  
  return this.find({
    parentCommentId: commentId,
    isApproved: true
  })
  .sort({ createdAt: 1 }) // Respuestas en orden cronológico
  .skip((page - 1) * limit)
  .limit(limit)
  .select('author content createdAt likesCount isEdited');
};

// Método estático para obtener comentarios recientes
commentSchema.statics.getRecentComments = function(limit = 10) {
  return this.find({ isApproved: true })
    .populate('articleId', 'title slug')
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('author content createdAt articleId userId');
};

// Método estático para obtener comentarios de un usuario
commentSchema.statics.getCommentsByUser = function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  
  return this.find({ userId, isApproved: true })
    .populate('articleId', 'title slug')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('content createdAt articleId likesCount');
};

// Método de instancia para incrementar likes
commentSchema.methods.incrementLikes = function() {
  this.likesCount += 1;
  return this.save();
};

// Método de instancia para decrementar likes
commentSchema.methods.decrementLikes = function() {
  if (this.likesCount > 0) {
    this.likesCount -= 1;
  }
  return this.save();
};

// Método de instancia para aprobar comentario
commentSchema.methods.approve = function() {
  this.isApproved = true;
  return this.save();
};

// Método de instancia para desaprobar comentario
commentSchema.methods.disapprove = function() {
  this.isApproved = false;
  return this.save();
};

// Middleware post-save para actualizar contador de comentarios en el artículo
commentSchema.post('save', async function(doc) {
  try {
    const Article = mongoose.model('Article');
    const commentCount = await Comment.countDocuments({ 
      articleId: doc.articleId, 
      isApproved: true 
    });
    
    await Article.findByIdAndUpdate(doc.articleId, {
      $set: { commentsCount: commentCount }
    });
  } catch (error) {
    console.error('Error actualizando contador de comentarios:', error);
  }
});

// Middleware post-remove para actualizar contador de comentarios
commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Article = mongoose.model('Article');
      const commentCount = await Comment.countDocuments({ 
        articleId: doc.articleId, 
        isApproved: true 
      });
      
      await Article.findByIdAndUpdate(doc.articleId, {
        $set: { commentsCount: commentCount }
      });
    } catch (error) {
      console.error('Error actualizando contador de comentarios:', error);
    }
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;




