const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Configuración y conexión a MongoDB usando Mongoose
 * Maneja la conexión a la base de datos con configuración de entorno
 */

const connectDB = async () => {
  try {
    // Configuración de opciones de conexión
    const options = {
      // Configuraciones adicionales para optimizar la conexión
      maxPoolSize: 10, // Mantener hasta 10 conexiones en el pool
      serverSelectionTimeoutMS: 30000, // Aumentar a 30 segundos para Render
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
      connectTimeoutMS: 30000, // Tiempo máximo para establecer conexión inicial
      retryWrites: true,
      w: 'majority'
    };

    // Conectar a MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB conectado exitosamente: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión a MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    // Manejar cierre graceful de la aplicación
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 Conexión a MongoDB cerrada por terminación de la aplicación');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error al cerrar la conexión a MongoDB:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    // En caso de error, salir del proceso
    process.exit(1);
  }
};

module.exports = connectDB;

