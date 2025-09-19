import { initDatabase, getHomeCarouselImages, addHomeCarouselImage, closeDatabase } from '../src/lib/database.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

// Script pour migrer les données du carrousel de carousel_images vers home_carousel_images
const migrateCarouselData = async () => {
  let connection = null;
  try {
    console.log('🔄 Initialisation de la base de données...');
    await initDatabase();
    
    // Créer une connexion directe pour les requêtes personnalisées
    connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si la table carousel_images existe et contient des données
    console.log('🔍 Vérification de la table carousel_images...');
    let carouselImages = [];
    try {
      const [rows] = await connection.execute('SELECT * FROM carousel_images ORDER BY display_order ASC');
      carouselImages = rows;
      console.log(`✅ Trouvé ${carouselImages.length} images dans carousel_images`);
    } catch (error) {
      console.log('⚠️ Table carousel_images n\'existe pas ou est vide:', error.message);
    }
    
    // Vérifier si la table home_carousel_images contient déjà des données
    console.log('🔍 Vérification de la table home_carousel_images...');
    const homeCarouselImages = await getHomeCarouselImages();
    console.log(`✅ Trouvé ${homeCarouselImages.length} images dans home_carousel_images`);
    
    // Si home_carousel_images est vide et carousel_images contient des données, migrer
    if (homeCarouselImages.length === 0 && carouselImages.length > 0) {
      console.log('🔄 Migration des données de carousel_images vers home_carousel_images...');
      
      for (const image of carouselImages) {
        await addHomeCarouselImage({
          image_url: image.image_url,
          display_order: image.display_order
        });
        console.log(`✅ Migré: ${image.title || image.image_url}`);
      }
      
      console.log('✅ Migration terminée avec succès!');
    } else if (homeCarouselImages.length > 0) {
      console.log('ℹ️ La table home_carousel_images contient déjà des données, pas de migration nécessaire.');
    } else {
      console.log('ℹ️ Aucune donnée à migrer.');
    }
    
    // Afficher le contenu final de home_carousel_images
    const finalImages = await getHomeCarouselImages();
    console.log('\n📋 Images dans home_carousel_images:');
    finalImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ID: ${img.id}, URL: ${img.image_url}, Ordre: ${img.display_order}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    await closeDatabase();
  }
};

// Exécuter la migration
migrateCarouselData();