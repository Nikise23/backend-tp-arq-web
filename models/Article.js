const mongoose = require('mongoose');

/**
 * Esquema y Modelo para Artículos del Blog
 * Incluye campos para título, contenido, autor, fecha, tags y contador de likes
 */

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del artículo es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres'],
    minlength: [5, 'El título debe tener al menos 5 caracteres']
  },
  slug: {
    type: String,
    required: [true, 'El slug del artículo es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones']
  },
  content: {
    type: String,
    required: [true, 'El contenido del artículo es obligatorio'],
    minlength: [50, 'El contenido debe tener al menos 50 caracteres']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'El extracto no puede exceder 300 caracteres'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'El autor del artículo es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre del autor no puede exceder 100 caracteres']
  },
  imagenUrl: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres']
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: [0, 'El contador de likes no puede ser negativo']
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: [0, 'El contador de vistas no puede ser negativo']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Agrega automáticamente createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
// Nota: slug ya tiene index único por unique: true en el schema
articleSchema.index({ title: 'text', content: 'text' }); // Índice de texto para búsqueda
articleSchema.index({ publishedAt: -1 }); // Índice para ordenar por fecha de publicación
articleSchema.index({ tags: 1 }); // Índice para búsqueda por tags
articleSchema.index({ author: 1 }); // Índice para búsqueda por autor

// Virtual para obtener la URL del artículo
articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug}`;
});

// Virtual para obtener el tiempo de lectura estimado
articleSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content ? this.content.split(' ').length : 0;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Middleware pre-save para generar excerpt automáticamente si no existe
articleSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    // Generar excerpt desde el contenido (primeros 150 caracteres)
    this.excerpt = this.content.substring(0, 150).trim() + '...';
  }
  
  // Actualizar updatedAt en cada modificación
  this.updatedAt = new Date();
  
  next();
});

// Método estático para buscar artículos por texto
articleSchema.statics.searchByText = function(searchTerm, options = {}) {
  const { page = 1, limit = 10, sortBy = 'publishedAt', sortOrder = 'desc' } = options;
  
  const query = {
    $text: { $search: searchTerm },
    isPublished: true
  };
  
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
      .select('title slug excerpt author publishedAt tags likesCount viewsCount readingTime imagenUrl');
};

// Método estático para obtener artículos populares
articleSchema.statics.getPopularArticles = function(limit = 5) {
  return this.find({ isPublished: true })
    .sort({ likesCount: -1, viewsCount: -1 })
    .limit(limit)
      .select('title slug excerpt author publishedAt likesCount viewsCount imagenUrl');
};

// Método de instancia para incrementar vistas
articleSchema.methods.incrementViews = function() {
  this.viewsCount += 1;
  return this.save();
};

// Método de instancia para incrementar likes (usando operación atómica)
articleSchema.methods.incrementLikes = async function() {
  // Usar findByIdAndUpdate con $inc para operación atómica
  const updated = await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { likesCount: 1 } },
    { new: true }
  );
  // Actualizar el objeto actual con los valores actualizados
  this.likesCount = updated.likesCount;
  return this;
};

// Método de instancia para decrementar likes (usando operación atómica)
articleSchema.methods.decrementLikes = async function() {
  // Usar findByIdAndUpdate con $inc para operación atómica
  // Solo decrementar si likesCount > 0
  const decrementValue = this.likesCount > 0 ? -1 : 0;
  const updated = await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { likesCount: decrementValue } },
    { new: true }
  );
  // Actualizar el objeto actual con los valores actualizados
  this.likesCount = updated.likesCount;
  return this;
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

