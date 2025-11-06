const Article = require('../models/Article');
const Like = require('../models/Like');

/**
 * Controlador para manejar todas las operaciones relacionadas con artículos
 * Implementa CRUD completo y funcionalidades adicionales como búsqueda y paginación
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Obtener todos los artículos
 *     description: Obtiene una lista paginada de artículos con filtros opcionales
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de artículos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda en título, contenido o tags
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filtrar por tag específico
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [publishedAt, createdAt, updatedAt, likesCount, title]
 *           default: publishedAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de artículos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Artículos obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalArticles:
 *                           type: integer
 *                           example: 47
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      tag = '',
      author = '',
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros de búsqueda
    const filters = { isPublished: true };
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (tag) {
      filters.tags = { $in: [tag.toLowerCase()] };
    }
    
    if (author) {
      filters.author = { $regex: author, $options: 'i' };
    }

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Ejecutar consulta con paginación
    const articles = await Article.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('title slug excerpt author publishedAt tags likesCount viewsCount readingTime imagenUrl')
      .lean();

    // Obtener total de documentos para paginación
    const totalArticles = await Article.countDocuments(filters);
    const totalPages = Math.ceil(totalArticles / limit);

    // Respuesta con metadatos de paginación
    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalArticles,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: Obtener artículo por slug
 *     description: Obtiene un artículo específico por su slug único
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del artículo
 *         example: introduccion-nodejs
 *     responses:
 *       200:
 *         description: Artículo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Artículo obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Artículo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ 
      slug: slug, 
      isPublished: true 
    }).lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Incrementar contador de vistas
    await Article.findByIdAndUpdate(article._id, {
      $inc: { viewsCount: 1 }
    });

    // Agregar 1 a las vistas para la respuesta actual
    article.viewsCount += 1;

    // Verificar si el usuario actual dio like (si está autenticado)
    let userLiked = false;
    if (req.user) {
      userLiked = await Like.userLikedArticle(req.user._id, article._id);
    }

    res.json({
      success: true,
      data: { 
        article,
        userLiked // Información adicional para el frontend
      }
    });

  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Buscar artículos
 *     description: Busca artículos por texto usando índices de MongoDB
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda
 *         example: nodejs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de artículos por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [publishedAt, createdAt, updatedAt, likesCount, title]
 *           default: publishedAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Búsqueda realizada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *                     searchTerm:
 *                       type: string
 *                       example: nodejs
 *                     totalResults:
 *                       type: integer
 *                       example: 15
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 2
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       400:
 *         description: Término de búsqueda inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const searchArticles = async (req, res) => {
  try {
    const {
      q: searchTerm,
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const trimmedTerm = searchTerm.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let articles = [];
    let totalResults = 0;

    try {
      // Intentar usar búsqueda de texto con índice
      articles = await Article.searchByText(trimmedTerm, {
        page: pageNum,
        limit: limitNum,
        sortBy,
        sortOrder
      });

      totalResults = await Article.countDocuments({
        $text: { $search: trimmedTerm },
        isPublished: true
      });
    } catch (textSearchError) {
      // Si falla la búsqueda de texto (por ejemplo, índice no existe), usar búsqueda regex como fallback
      const errorMessage = textSearchError.message || '';
      const isTextIndexError = errorMessage.includes('text index') || 
                               errorMessage.includes('$text') ||
                               errorMessage.includes('no text index');
      
      if (isTextIndexError) {
        console.warn('Índice de texto no disponible, usando búsqueda regex como fallback');
        
        const regexQuery = {
          isPublished: true,
          $or: [
            { title: { $regex: trimmedTerm, $options: 'i' } },
            { content: { $regex: trimmedTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(trimmedTerm, 'i')] } }
          ]
        };

        articles = await Article.find(regexQuery)
          .sort(sortOptions)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .select('title slug excerpt author publishedAt tags likesCount viewsCount readingTime imagenUrl')
          .lean();

        totalResults = await Article.countDocuments(regexQuery);
      } else {
        // Si es otro tipo de error, relanzarlo
        throw textSearchError;
      }
    }

    const totalPages = Math.ceil(totalResults / limitNum);

    res.json({
      success: true,
      data: {
        articles,
        searchTerm: trimmedTerm,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalResults,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error en búsqueda de artículos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar imagen de un artículo
 * PATCH /api/articles/:slug/image
 */
const updateArticleImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { imagenUrl } = req.body;

    if (!imagenUrl) {
      return res.status(400).json({
        success: false,
        message: 'La URL de la imagen es requerida'
      });
    }

    // Buscar el artículo por slug
    const article = await Article.findOne({ slug: slug.trim().toLowerCase() });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Actualizar solo el campo imagenUrl
    article.imagenUrl = imagenUrl.trim();
    await article.save();

    res.json({
      success: true,
      message: 'Imagen del artículo actualizada exitosamente',
      data: {
        article: {
          slug: article.slug,
          title: article.title,
          imagenUrl: article.imagenUrl
        }
      }
    });

  } catch (error) {
    console.error('Error al actualizar imagen del artículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener artículos populares (más likes y vistas)
 * GET /api/articles/popular
 */
const getPopularArticles = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const articles = await Article.getPopularArticles(parseInt(limit));

    res.json({
      success: true,
      data: { articles }
    });

  } catch (error) {
    console.error('Error al obtener artículos populares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener artículos por tag
 * GET /api/articles/tag/:tag
 */
const getArticlesByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      isPublished: true,
      tags: { $in: [tag.toLowerCase()] }
    };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const articles = await Article.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('title slug excerpt author publishedAt tags likesCount viewsCount readingTime imagenUrl')
      .lean();

    const totalArticles = await Article.countDocuments(filters);
    const totalPages = Math.ceil(totalArticles / limit);

    res.json({
      success: true,
      data: {
        articles,
        tag: tag.toLowerCase(),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalArticles,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener artículos por tag:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todos los tags únicos
 * GET /api/articles/tags
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Article.distinct('tags', { isPublished: true });
    
    // Filtrar tags vacíos y ordenar alfabéticamente
    const filteredTags = tags
      .filter(tag => tag && tag.trim().length > 0)
      .sort();

    res.json({
      success: true,
      data: { tags: filteredTags }
    });

  } catch (error) {
    console.error('Error al obtener tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener estadísticas generales del blog
 * GET /api/articles/stats
 */
const getBlogStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments({ isPublished: true });
    const totalViews = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } }
    ]);
    const totalLikes = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
    ]);
    const totalTags = await Article.distinct('tags', { isPublished: true });

    const stats = {
      totalArticles,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      totalTags: totalTags.filter(tag => tag && tag.trim().length > 0).length
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/articles/{slug}/like:
 *   post:
 *     summary: Dar o quitar like a un artículo
 *     description: Permite dar o quitar like a un artículo (sin autenticación requerida)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del artículo
 *     responses:
 *       200:
 *         description: Like actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       description: Si el usuario dio like o no
 *                     likesCount:
 *                       type: integer
 *                       description: Número total de likes
 *       400:
 *         description: Acción inválida
 *       404:
 *         description: Artículo no encontrado
 */
const toggleLike = async (req, res) => {
  try {
    const { slug } = req.params;
    const { action = 'increment' } = req.body; // 'increment' o 'decrement'

    // Normalizar el slug (trim)
    const normalizedSlug = slug.trim();

    console.log('Buscando artículo con slug:', normalizedSlug); // Debug

    // Verificar si el parámetro es un ObjectId de MongoDB (24 caracteres hexadecimales)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(normalizedSlug);
    
    let article;
    
    if (isObjectId) {
      // Si es un ObjectId, buscar por _id (fallback para compatibilidad)
      console.warn('Se recibió un ObjectId en lugar de slug, buscando por _id:', normalizedSlug);
      article = await Article.findById(normalizedSlug);
      
      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Artículo no encontrado por ID'
        });
      }
      
      // Si el artículo tiene slug, redirigir al endpoint correcto
      if (article.slug) {
        return res.status(400).json({
          success: false,
          message: 'Use el slug del artículo en lugar del ID',
          slug: article.slug,
          correctUrl: `/api/articles/${article.slug}/like`
        });
      }
    } else {
      // Buscar por slug normalmente
      article = await Article.findOne({ 
        slug: normalizedSlug,
        isPublished: true 
      });
    }

    // Si no se encuentra con isPublished, intentar sin ese filtro (para debug)
    if (!article) {
      const articleWithoutFilter = await Article.findOne({ 
        slug: normalizedSlug
      });
      
      if (articleWithoutFilter) {
        console.log('Artículo encontrado pero no publicado:', articleWithoutFilter.slug);
        return res.status(404).json({
          success: false,
          message: 'Artículo no encontrado o no publicado'
        });
      }
      
      // Debug: mostrar algunos artículos para ver qué hay en la BD
      if (process.env.NODE_ENV === 'development') {
        const allArticles = await Article.find({}).select('slug title isPublished').limit(5);
        console.log('Artículos en BD (primeros 5):', allArticles);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado',
        debug: process.env.NODE_ENV === 'development' ? {
          searchedSlug: normalizedSlug,
          originalSlug: slug
        } : undefined
      });
    }

    let updatedArticle;

    if (action === 'increment') {
      updatedArticle = await article.incrementLikes();
      // Recargar el artículo desde la BD para obtener el valor actualizado
      updatedArticle = await Article.findById(article._id).select('slug title likesCount');
    } else if (action === 'decrement') {
      updatedArticle = await article.decrementLikes();
      // Recargar el artículo desde la BD para obtener el valor actualizado
      updatedArticle = await Article.findById(article._id).select('slug title likesCount');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida. Use "increment" o "decrement"'
      });
    }

    res.json({
      success: true,
      message: `Like ${action === 'increment' ? 'agregado' : 'removido'} exitosamente`,
      data: {
        liked: action === 'increment',
        likesCount: updatedArticle.likesCount,
        action: action
      }
    });

  } catch (error) {
    console.error('Error al toggle like:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/articles/{slug}/likes:
 *   get:
 *     summary: Obtener usuarios que dieron like a un artículo
 *     description: Obtiene la lista de usuarios que dieron like a un artículo
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del artículo
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de likes a mostrar
 *     responses:
 *       200:
 *         description: Lista de likes obtenida exitosamente
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
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     totalLikes:
 *                       type: integer
 *       404:
 *         description: Artículo no encontrado
 */
const getArticleLikes = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 10 } = req.query;

    // Buscar el artículo por slug
    const article = await Article.findOne({ slug });
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Obtener likes del artículo
    const likes = await Like.getLikesForArticle(article._id, parseInt(limit));
    const totalLikes = await Like.countLikesForArticle(article._id);

    res.json({
      success: true,
      message: 'Likes obtenidos exitosamente',
      data: {
        likes,
        totalLikes
      }
    });

  } catch (error) {
    console.error('Error al obtener likes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al obtener likes del artículo'
    });
  }
};

module.exports = {
  getAllArticles,
  getArticleBySlug,
  searchArticles,
  getPopularArticles,
  getArticlesByTag,
  getAllTags,
  getBlogStats,
  toggleLike,
  getArticleLikes,
  updateArticleImage
};

