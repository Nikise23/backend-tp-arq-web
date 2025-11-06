require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./config/db');

connectDB();

setTimeout(async () => {
  try {
    const article = await Article.findOne({ 
      slug: 'politica-tecnologia-transformacion-digital-democracia' 
    });
    
    if (!article) {
      console.log('❌ Artículo no encontrado');
      process.exit(1);
    }
    
    console.log('\n📰 Artículo encontrado:');
    console.log(`   Título: ${article.title}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Imagen URL: ${article.imagenUrl || '(sin imagen)'}`);
    console.log(`   Imagen existe: ${article.imagenUrl ? '✅' : '❌'}`);
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}, 2000);

