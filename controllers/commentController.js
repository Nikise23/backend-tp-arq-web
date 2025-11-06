const Comment = require('../models/Comment');
const Article = require('../models/Article');

/**
 * Controlador para manejar todas las operaciones relacionadas con comentarios
 * Implementa CRUD completo, sistema de respuestas y gestión de likes
 */

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   get:
 *     summary: Obtener comentarios de un artículo
 *     description: Obtiene todos los comentarios de un artículo específico con paginación
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del artículo
 *         example: introduccion-nodejs
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
 *           default: 20
 *         description: Número de comentarios por página
 *       - in: query
 *         name: includeReplies
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir respuestas a comentarios
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *   post:
 *     summary: Agregar comentario a un artículo
 *     description: Permite a usuarios autenticados o anónimos agregar comentarios
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del artículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Contenido del comentario
 *               parentCommentId:
 *                 type: string
 *                 description: ID del comentario padre (para respuestas)
 *               author:
 *                 type: string
 *                 description: Nombre del autor (solo para comentarios anónimos)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del autor (solo para comentarios anónimos)
 *     responses:
 *       201:
 *         description: Comentario agregado exitosamente
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
 *                   example: Comentarios obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         totalComments:
 *                           type: integer
 *                           example: 45
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
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
const getCommentsForArticle = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 20,
      includeReplies = true
    } = req.query;

    // Primero obtener el artículo por slug
    const article = await Article.findOne({ 
      slug: slug, 
      isPublished: true 
    }).select('_id');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Obtener comentarios del artículo
    const comments = await Comment.getCommentsForArticle(article._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      includeReplies: includeReplies === 'true'
    });

    // Contar total de comentarios
    const totalComments = await Comment.countDocuments({
      articleId: article._id,
      isApproved: true,
      parentCommentId: includeReplies === 'true' ? { $exists: true } : null
    });

    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      success: true,
      data: {
        comments,
        articleSlug: slug,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalComments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/articles/{slug}/comments:
 *   post:
 *     summary: Agregar comentario a un artículo
 *     description: Crea un nuevo comentario en un artículo específico
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único del artículo
 *         example: introduccion-nodejs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author
 *               - content
 *             properties:
 *               author:
 *                 type: string
 *                 description: Nombre del autor del comentario
 *                 example: María García
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del autor (opcional)
 *                 example: maria@example.com
 *               content:
 *                 type: string
 *                 description: Contenido del comentario
 *                 example: Excelente artículo, muy útil!
 *               parentCommentId:
 *                 type: string
 *                 description: ID del comentario padre (para respuestas)
 *                 example: 507f1f77bcf86cd799439012
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
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
 *                   example: Comentario agregado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
const addComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content, parentCommentId } = req.body;

    // Validar campos requeridos
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del comentario es obligatorio'
      });
    }

    // Obtener el artículo por slug
    const article = await Article.findOne({ 
      slug: slug, 
      isPublished: true 
    }).select('_id');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        articleId: article._id,
        isApproved: true
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Comentario padre no encontrado'
        });
      }
    }

    // Crear nuevo comentario
    const commentData = {
      articleId: article._id,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    };

    // Si el usuario está autenticado, usar su información
    if (req.user) {
      commentData.userId = req.user._id;
      commentData.author = req.user.name;
      commentData.email = req.user.email;
    } else {
      // Para comentarios anónimos, requerir author y email
      const { author, email } = req.body;
      
      if (!author || !email) {
        return res.status(400).json({
          success: false,
          message: 'Para comentarios anónimos, author y email son obligatorios'
        });
      }

      // Validar formato de email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      commentData.author = author.trim();
      commentData.email = email.toLowerCase().trim();
    }

    const newComment = new Comment(commentData);
    const savedComment = await newComment.save();

    // Populate para obtener información completa
    await savedComment.populate('articleId', 'title slug');
    if (savedComment.userId) {
      await savedComment.populate('userId', 'name email avatar');
    }

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: { comment: savedComment }
    });

  } catch (error) {
    console.error('Error al agregar comentario:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Alternar like en un artículo (simular reacción)
 * POST /api/articles/:slug/like
 */
const toggleLike = async (req, res) => {
  try {
    const { slug } = req.params;
    const { action = 'increment' } = req.body; // 'increment' o 'decrement'

    // Obtener el artículo por slug
    const article = await Article.findOne({ 
      slug: slug, 
      isPublished: true 
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado'
      });
    }

    let updatedArticle;

    if (action === 'increment') {
      updatedArticle = await article.incrementLikes();
    } else if (action === 'decrement') {
      updatedArticle = await article.decrementLikes();
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
        article: {
          slug: updatedArticle.slug,
          title: updatedArticle.title,
          likesCount: updatedArticle.likesCount
        }
      }
    });

  } catch (error) {
    console.error('Error al alternar like:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Alternar like en un comentario específico
 * POST /api/comments/:commentId/like
 */
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action = 'increment' } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (!comment.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'No se puede dar like a un comentario no aprobado'
      });
    }

    let updatedComment;

    if (action === 'increment') {
      updatedComment = await comment.incrementLikes();
    } else if (action === 'decrement') {
      updatedComment = await comment.decrementLikes();
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
        comment: {
          _id: updatedComment._id,
          likesCount: updatedComment.likesCount
        }
      }
    });

  } catch (error) {
    console.error('Error al alternar like del comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener comentarios recientes de todo el blog
 * GET /api/comments/recent
 */
const getRecentComments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const comments = await Comment.getRecentComments(parseInt(limit));

    res.json({
      success: true,
      data: { comments }
    });

  } catch (error) {
    console.error('Error al obtener comentarios recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener respuestas de un comentario específico
 * GET /api/comments/:commentId/replies
 */
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const {
      page = 1,
      limit = 10
    } = req.query;

    // Verificar que el comentario padre existe
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    const replies = await Comment.getRepliesForComment(commentId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const totalReplies = await Comment.countDocuments({
      parentCommentId: commentId,
      isApproved: true
    });

    const totalPages = Math.ceil(totalReplies / limit);

    res.json({
      success: true,
      data: {
        replies,
        parentCommentId: commentId,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReplies,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Aprobar o desaprobar un comentario (para moderación)
 * PATCH /api/comments/:commentId/moderate
 */
const moderateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body; // 'approve' o 'disapprove'

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    let updatedComment;

    if (action === 'approve') {
      updatedComment = await comment.approve();
    } else if (action === 'disapprove') {
      updatedComment = await comment.disapprove();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida. Use "approve" o "disapprove"'
      });
    }

    res.json({
      success: true,
      message: `Comentario ${action === 'approve' ? 'aprobado' : 'desaprobado'} exitosamente`,
      data: {
        comment: {
          _id: updatedComment._id,
          isApproved: updatedComment.isApproved
        }
      }
    });

  } catch (error) {
    console.error('Error al moderar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCommentsForArticle,
  addComment,
  toggleLike,
  toggleCommentLike,
  getRecentComments,
  getCommentReplies,
  moderateComment
};
