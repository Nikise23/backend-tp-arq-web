require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./config/db');

connectDB();

setTimeout(async () => {
  try {
    const articles = await Article.find({}).select('slug title likesCount').limit(5);
    console.log('\n📊 Estado actual de likes en los artículos:\n');
    articles.forEach(a => {
      console.log(`   "${a.title}"`);
      console.log(`   Slug: ${a.slug}`);
      console.log(`   Likes: ${a.likesCount}`);
      console.log('');
    });
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}, 2000);

