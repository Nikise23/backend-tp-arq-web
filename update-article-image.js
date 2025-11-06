/**
 * Script para actualizar la imagen de un artículo mediante URL externa
 * 
 * Uso:
 * node update-article-image.js <slug> <imagenUrl>
 * 
 * Ejemplos:
 * node update-article-image.js politica-tecnologia https://ejemplo.com/imagen.jpg
 * node update-article-image.js tecnologia-2025 https://cdn.ejemplo.com/images/tech.webp
 
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

async function updateArticleImage(slug, imagenUrl) {
  try {
    // Buscar el artículo por slug
    const article = await Article.findOne({ slug: slug.toLowerCase().trim() });

    if (!article) {
      console.error(`❌ Artículo con slug "${slug}" no encontrado`);
      process.exit(1);
    }

    // Actualizar la imagen
    article.imagenUrl = imagenUrl.trim();
    await article.save();

    console.log('✅ Imagen actualizada exitosamente');
    console.log(`📰 Artículo: ${article.title}`);
    console.log(`🖼️  Imagen: ${article.imagenUrl}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar imagen:', error);
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Uso: node update-article-image.js <slug> <imagenUrl>');
  console.log('Ejemplo: node update-article-image.js politica-tecnologia https://ejemplo.com/imagen.jpg');
  console.log('');
  console.log('Nota: Debe proporcionar una URL completa (ej: https://ejemplo.com/imagen.jpg)');
  process.exit(1);
}

const [slug, imagenUrl] = args;

// Esperar a que se conecte MongoDB antes de actualizar
setTimeout(() => {
  updateArticleImage(slug, imagenUrl);
}, 2000);

