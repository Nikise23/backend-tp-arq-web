const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');

// Importar rutas
const articleRoutes = require('./routes/articleRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');


// Cargar variables de entorno
dotenv.config();

/**
 * Servidor principal de la API del Blog Interactivo
 * Configuración de Express, middleware, rutas y conexión a MongoDB
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Interactivo API',
      version: '1.0.0',
      description: 'API REST para un blog interactivo con sistema de comentarios y reacciones',
      contact: {
        name: 'Nicolas Fernandez',
        email: 'nicolas.fernandez@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://portal-de-noticias-r4yi.onrender.com',
        description: 'Servidor de producción (Render)'
      }
    ],
    components: {
      schemas: {
        Article: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del artículo',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Título del artículo',
              example: 'Introducción a Node.js'
            },
            slug: {
              type: 'string',
              description: 'Slug único para URLs',
              example: 'introduccion-nodejs'
            },
            content: {
              type: 'string',
              description: 'Contenido del artículo',
              example: 'Node.js es un entorno de ejecución para JavaScript...'
            },
            author: {
              type: 'string',
              description: 'Autor del artículo',
              example: 'Juan Pérez'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags del artículo',
              example: ['nodejs', 'javascript', 'backend']
            },
            likesCount: {
              type: 'number',
              description: 'Número de likes',
              example: 42
            },
            readingTime: {
              type: 'number',
              description: 'Tiempo de lectura en minutos',
              example: 5
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2023-10-10T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2023-10-10T10:30:00.000Z'
            }
          }
        },
        Comment: {
          type: 'object',
          required: ['articleId', 'author', 'content'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del comentario',
              example: '507f1f77bcf86cd799439012'
            },
            articleId: {
              type: 'string',
              description: 'ID del artículo',
              example: '507f1f77bcf86cd799439011'
            },
            author: {
              type: 'string',
              description: 'Autor del comentario',
              example: 'María García'
            },
            content: {
              type: 'string',
              description: 'Contenido del comentario',
              example: 'Excelente artículo, muy útil!'
            },
            likesCount: {
              type: 'number',
              description: 'Número de likes',
              example: 8
            },
            parentId: {
              type: 'string',
              description: 'ID del comentario padre (para respuestas)',
              example: '507f1f77bcf86cd799439012'
            },
            isModerated: {
              type: 'boolean',
              description: 'Si el comentario está moderado',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2023-10-10T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
              example: '2023-10-10T10:30:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Validation error 1', 'Validation error 2']
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Articles',
        description: 'Operaciones relacionadas con artículos'
      },
      {
        name: 'Comments',
        description: 'Operaciones relacionadas con comentarios'
      },
      {
        name: 'System',
        description: 'Operaciones del sistema'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Conectar a MongoDB
connectDB();

// Middleware global
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Middleware de manejo de errores de JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición'
    });
  }
  next();
});

// Rutas de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog Interactivo API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api', commentRoutes);
// NOTA: Ruta de uploads eliminada - ya no se usa el sistema de uploads
// app.use('/api/upload', uploadRoutes);

// Servir archivos estáticos de uploads
// NOTA: Deshabilitado - ya no se usa la carpeta uploads/images, las imágenes se manejan mediante URLs externas
// const uploadsPath = path.join(__dirname, 'uploads');
// app.use('/uploads', express.static(uploadsPath));

// Servir archivos estáticos del frontend (después de todas las rutas de API)
const frontendDistPath = path.join(__dirname, '..', 'frontend-tp-arq-web-main', 'dist');
app.use(express.static(frontendDistPath));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Estado del servidor
 *     description: Verifica que el servidor esté funcionando correctamente
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
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
 *                   example: Servidor funcionando correctamente
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-10T10:30:00.000Z
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: v1
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || 'v1'
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     description: Obtiene información general sobre la API y sus endpoints disponibles
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Información de la API
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
 *                   example: API del Blog Interactivo
 *                 version:
 *                   type: string
 *                   example: v1
 *                 endpoints:
 *                   type: object
 *                   description: Lista de endpoints disponibles
 *                 documentation:
 *                   type: string
 *                   example: Consulte la documentación para más detalles sobre los parámetros y respuestas
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API del Blog Interactivo',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      articles: {
        'GET /api/articles': 'Obtener todos los artículos con paginación',
        'GET /api/articles/search': 'Buscar artículos por texto',
        'GET /api/articles/popular': 'Obtener artículos populares',
        'GET /api/articles/tags': 'Obtener todos los tags',
        'GET /api/articles/stats': 'Obtener estadísticas del blog',
        'GET /api/articles/tag/:tag': 'Obtener artículos por tag',
        'GET /api/articles/:slug': 'Obtener artículo por slug'
      },
      comments: {
        'GET /api/articles/:slug/comments': 'Obtener comentarios de un artículo',
        'POST /api/articles/:slug/comments': 'Agregar comentario a un artículo',
        'POST /api/articles/:slug/like': 'Alternar like en un artículo',
        'GET /api/comments/recent': 'Obtener comentarios recientes',
        'GET /api/comments/:commentId/replies': 'Obtener respuestas de un comentario',
        'POST /api/comments/:commentId/like': 'Alternar like en un comentario',
        'PATCH /api/comments/:commentId/moderate': 'Moderar comentario'
      },
      system: {
        'GET /health': 'Estado del servidor',
        'GET /api-docs': 'Documentación Swagger'
      }
    },
    documentation: 'Consulte la documentación en /api-docs para más detalles sobre los parámetros y respuestas'
  });
});

// Catch-all para SPA del frontend (sirve index.html para rutas no-API)
// Esto debe estar ANTES del middleware de errores 404 para rutas de API
app.get('*', (req, res, next) => {
  // Si es una ruta de API, pasar al siguiente middleware (que dará 404 JSON)
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs') || req.path === '/health') {
    return next();
  }
  
  // Si no es API, servir index.html del frontend (SPA routing)
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Si no existe el frontend build, dar 404
      next();
    }
  });
});

// Middleware para manejar rutas de API no encontradas (404)
app.use('*', (req, res) => {
  // Solo llegamos aquí si es una ruta de API que no existe
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return res.status(404).json({
      success: false,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      availableRoutes: [
        'GET /api/articles',
        'GET /api/articles/:slug',
        'GET /api/articles/:slug/comments',
        'POST /api/articles/:slug/comments',
        'POST /api/articles/:slug/like',
        'GET /health'
      ]
    });
  }
  
  // Para otras rutas, 404 simple
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  // Error de duplicado de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} ya existe`,
      field
    });
  }

  // Error de ObjectId inválido
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recibido. Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recibido. Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado exitosamente');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log('📖 Documentación de API disponible en /api-docs');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
