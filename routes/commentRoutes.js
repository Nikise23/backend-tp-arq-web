const express = require('express');
const router = express.Router();
const {
  getCommentsForArticle,
  addComment,
  getRecentComments,
  toggleCommentLike
} = require('../controllers/commentController');
const { optionalAuth } = require('../middleware/auth');

/**
 * Rutas para manejar operaciones relacionadas con comentarios
 * Todas las rutas están prefijadas con /api
 */

// GET /api/articles/:slug/comments - Obtener comentarios de un artículo
router.get('/articles/:slug/comments', getCommentsForArticle);

// POST /api/articles/:slug/comments - Agregar comentario a un artículo (autenticación opcional)
router.post('/articles/:slug/comments', optionalAuth, addComment);

// GET /api/comments/recent - Obtener comentarios recientes
router.get('/comments/recent', getRecentComments);

// POST /api/comments/:commentId/like - Alternar like en un comentario (sin autenticación requerida)
router.post('/comments/:commentId/like', toggleCommentLike);

module.exports = router;

