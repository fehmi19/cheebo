// config/database.js - Configuration base de données
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Options de connexion pour Mongoose 6+
    const options = {
      // useNewUrlParser et useUnifiedTopology ne sont plus nécessaires dans Mongoose 6+
      // mais on les garde pour la compatibilité
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`🟢 MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);

    // Gestion des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose déconnecté de MongoDB');
    });

    // Gestion de la fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;