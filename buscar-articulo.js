require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./config/db');

connectDB();

setTimeout(async () => {
  try {
    const articles = await Article.find({}).select('slug title').limit(20);
    console.log('\n📰 Artículos disponibles:\n');
    articles.forEach(a => console.log(`   Slug: "${a.slug}" | Título: "${a.title}"`));
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}, 2000);

