# Blog Interactivo - Backend API

Backend API para un blog interactivo desarrollado con Node.js, Express y MongoDB.

## 📋 Información del Proyecto

- **Materia**: Arquitectura Web
- **Proyecto**: Blog Interactivo
- **Desarrolladores**:
- **Rol**: Backend Developer
- **Stack**: Node.js + Express + MongoDB Atlas
- **Patrón**: MVC (Model-View-Controller)

## 🚀 Características

- **API REST** completa para gestión de artículos y comentarios
- **Base de datos MongoDB** con Mongoose ODM
- **Sistema de comentarios** con respuestas anidadas
- **Sistema de likes/reacciones** para artículos y comentarios
- **Búsqueda de artículos** con índices de texto
- **Paginación** en todas las consultas
- **Validación de datos** robusta
- **Manejo de errores** centralizado
- **CORS** configurado para desarrollo frontend
- **Logging** para desarrollo y producción
- **Documentación Swagger/OpenAPI** interactiva
- **Containerización Docker** para despliegue

## 📋 Requisitos Previos

### Para instalación tradicional
- Node.js (versión 16 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

### Para instalación con Docker
- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Git (para clonar el repositorio)

## 🛠️ Instalación

### Opción 1: Instalación Tradicional

1. **Clonar o descargar el proyecto**
   ```bash
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/blog_interactivo
   CORS_ORIGIN=http://localhost:3001
   API_VERSION=v1
   ```

4. **Asegurar que MongoDB esté ejecutándose**
   - MongoDB local: `mongod`
   - MongoDB Atlas: usar la URI de conexión

5. **Iniciar el servidor**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

### Opción 2: Instalación con Docker (Recomendado)

1. **Clonar el proyecto**
   ```bash
   cd backend
   ```

2. **Ejecutar en modo desarrollo**
   ```bash
   # Ejecutar con hot reload
   docker-compose -f docker/docker-compose.dev.yml up
   
   # O ejecutar en background
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```

3. **Ejecutar en modo producción**
   ```bash
   # Construir y ejecutar en background
   docker-compose -f docker/docker-compose.yml up -d
   
   # Ver logs
   docker-compose -f docker/docker-compose.yml logs -f backend
   
   # Verificar que está funcionando
   docker-compose -f docker/docker-compose.yml ps
   ```

4. **Verificar instalación**
   ```bash
   # Probar endpoint de salud
   curl http://localhost:3000/health
   
   # Probar endpoint de artículos
   curl http://localhost:3000/api/articles
   
   # Acceder a Swagger UI
   # Abrir http://localhost:3000/api-docs en el navegador
   ```

5. **Comandos útiles de Docker**
   ```bash
   # Detener servicios
   docker-compose -f docker/docker-compose.yml down
   
   # Reconstruir imagen
   docker-compose -f docker/docker-compose.yml build --no-cache
   
   # Ver logs en tiempo real
   docker-compose -f docker/docker-compose.yml logs -f
   
   # Limpiar volúmenes (cuidado: borra datos)
   docker-compose -f docker/docker-compose.yml down -v
   ```

## 📚 Documentación de la API

### Swagger UI
La documentación interactiva de la API está disponible en Swagger UI:

- **Desarrollo**: http://localhost:3000/api-docs
- **Docker Local**: http://localhost:3000/api-docs (con Docker Compose)
- **Producción**: http://tu-servidor.com/api-docs (con Docker)

### Endpoints de la API

### Artículos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/articles` | Obtener todos los artículos (paginado) |
| GET | `/api/articles/search` | Buscar artículos por texto |
| GET | `/api/articles/popular` | Obtener artículos populares |
| GET | `/api/articles/tags` | Obtener todos los tags |
| GET | `/api/articles/stats` | Estadísticas del blog |
| GET | `/api/articles/tag/:tag` | Artículos por tag específico |
| GET | `/api/articles/:slug` | Obtener artículo por slug |

### Comentarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/articles/:slug/comments` | Comentarios de un artículo |
| POST | `/api/articles/:slug/comments` | Agregar comentario |
| POST | `/api/articles/:slug/like` | Alternar like en artículo |
| GET | `/api/comments/recent` | Comentarios recientes |
| GET | `/api/comments/:commentId/replies` | Respuestas de comentario |
| POST | `/api/comments/:commentId/like` | Alternar like en comentario |
| PATCH | `/api/comments/:commentId/moderate` | Moderar comentario |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |
| GET | `/` | Información de la API |

## 📖 Documentación Adicional

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Arquitectura del sistema y decisiones técnicas
- **[docs/API.md](./docs/API.md)**: Documentación detallada de endpoints
- **[docs/SWAGGER.md](./docs/SWAGGER.md)**: Guía completa de Swagger/OpenAPI
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**: Guía de despliegue y configuración
- **[docs/DOCKER.md](./docs/DOCKER.md)**: Guía completa de Docker y containerización
- **[docs/DIAGRAMS.md](./docs/DIAGRAMS.md)**: Diagramas de arquitectura y base de datos
- **Swagger UI**: Documentación interactiva en `/api-docs`

## 🔧 Parámetros de Consulta

### Paginación
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)

### Filtros para Artículos
- `search`: Término de búsqueda
- `tag`: Filtrar por tag específico
- `author`: Filtrar por autor
- `sortBy`: Campo para ordenar (publishedAt, likesCount, viewsCount)
- `sortOrder`: Orden (asc, desc)

### Filtros para Comentarios
- `includeReplies`: Incluir respuestas (true/false)

## 📝 Ejemplos de Uso

### Obtener artículos con paginación
```bash
GET /api/articles?page=1&limit=5&sortBy=publishedAt&sortOrder=desc
```

### Buscar artículos
```bash
GET /api/articles/search?q=javascript&page=1&limit=10
```

### Agregar comentario
```bash
POST /api/articles/mi-articulo/comments
Content-Type: application/json

{
  "author": "Juan Pérez",
  "email": "juan@email.com",
  "content": "Excelente artículo, muy informativo!"
}
```

### Dar like a un artículo
```bash
POST /api/articles/mi-articulo/like
Content-Type: application/json

{
  "action": "increment"
}
```

## 🗄️ Estructura de la Base de Datos

### Colección: articles
```javascript
{
  title: String,
  slug: String (único),
  content: String,
  excerpt: String,
  author: String,
  tags: [String],
  likesCount: Number,
  viewsCount: Number,
  isPublished: Boolean,
  publishedAt: Date,
  updatedAt: Date
}
```

### Colección: comments
```javascript
{
  articleId: ObjectId (ref: Article),
  author: String,
  email: String,
  content: String,
  parentCommentId: ObjectId (ref: Comment),
  isApproved: Boolean,
  likesCount: Number,
  isEdited: Boolean,
  editedAt: Date
}
```

## 🚨 Manejo de Errores

La API devuelve respuestas consistentes con el formato:

```javascript
{
  "success": false,
  "message": "Descripción del error",
  "errors": ["Detalles específicos"] // Solo en errores de validación
}
```

Códigos de estado HTTP:
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación
- `404`: No encontrado
- `500`: Error interno del servidor

## 🔒 Validaciones

### Artículos
- Título: 5-200 caracteres
- Slug: único, solo letras minúsculas, números y guiones
- Contenido: mínimo 50 caracteres
- Autor: máximo 100 caracteres

### Comentarios
- Autor: máximo 100 caracteres
- Email: formato válido
- Contenido: 10-1000 caracteres

## 🧪 Testing

Para probar la API puedes usar:

1. **Postman**: Importar la colección de endpoints
2. **curl**: Ejemplos en la documentación
3. **Frontend**: Integrar con React, Vue, Angular, etc.

## 📈 Rendimiento

- **Índices MongoDB** optimizados para consultas frecuentes
- **Paginación** en todas las consultas
- **Validación** a nivel de base de datos
- **Conexión pooling** configurado
- **Compresión** de respuestas JSON

## 🚀 Despliegue con Docker

### Desarrollo Local
```bash
# Ejecutar con Docker Compose
docker-compose -f docker/docker-compose.dev.yml up

# Acceder a Swagger UI
http://localhost:3000/api-docs
```

### Producción Local
```bash
# Ejecutar en modo producción
docker-compose -f docker/docker-compose.yml up -d

# Verificar que está funcionando
docker-compose -f docker/docker-compose.yml ps

# Ver logs
docker-compose -f docker/docker-compose.yml logs -f
```

### Despliegue en Servidor

#### Opción 1: VPS/Servidor Dedicado
```bash
# 1. Subir archivos al servidor
scp -r backend/ usuario@servidor:/ruta/proyecto/

# 2. Instalar Docker en el servidor
sudo apt update
sudo apt install docker.io docker-compose

# 3. Ejecutar en producción
cd /ruta/proyecto/backend
docker-compose -f docker/docker-compose.yml up -d

# 4. Configurar dominio (opcional)
# Configurar nginx/apache para proxy reverso
```

#### Opción 2: Cloud Providers
- **DigitalOcean**: Droplet con Docker
- **AWS EC2**: Instancia con Docker
- **Google Cloud**: Compute Engine con Docker
- **Azure**: Virtual Machine con Docker

### Variables de entorno para producción
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blog_prod
CORS_ORIGIN=https://tu-dominio.com
API_VERSION=v1
```

### Ventajas del despliegue con Docker
- **Consistencia**: Mismo entorno en desarrollo y producción
- **Portabilidad**: Funciona en cualquier sistema operativo
- **Escalabilidad**: Fácil escalado horizontal
- **Control**: Control total del entorno
- **Costo**: Sin dependencias de servicios externos

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 📂 Estructura del Proyecto

```
backend/
├── server.js              # Punto de entrada de Express y conexión a DB
├── package.json           # Dependencias (express, mongoose, dotenv, cors)
├── Dockerfile             # Imagen Docker de la aplicación
├── .dockerignore          # Archivos a ignorar en build Docker
├── .env.example           # Variables de entorno para MongoDB URI y Puerto
├── seedData.js            # Script para poblar base de datos con datos de prueba
├── config/
│   └── db.js              # Módulo de conexión a MongoDB usando Mongoose
├── models/
│   ├── Article.js         # Esquema y Modelo Mongoose para Artículos
│   └── Comment.js         # Esquema y Modelo Mongoose para Comentarios/Reacciones
├── controllers/
│   ├── articleController.js # Lógica de negocio para Artículos (CRUD)
│   └── commentController.js # Lógica de negocio para Comentarios/Likes
├── routes/
│   ├── articleRoutes.js   # Definición de rutas Express para Artículos
│   └── commentRoutes.js   # Definición de rutas Express para Comentarios/Likes
```

---

**Desarrollado con ❤️ usando Node.js, Express y MongoDB**
