import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function checkEventPhotos() {
  let connection;
  
  try {
    console.log('🔍 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // Vérifier la structure de la table event_photos
    console.log('\n📋 Structure de la table event_photos:');
    const [structure] = await connection.execute('DESCRIBE event_photos');
    console.table(structure);
    
    // Compter le nombre total de photos
    console.log('\n📊 Nombre total de photos en base:');
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM event_photos');
    console.log(`Total: ${countResult[0].total} photos`);
    
    // Afficher les dernières photos ajoutées
    console.log('\n📸 Dernières photos ajoutées (10 plus récentes):');
    const [recentPhotos] = await connection.execute(`
      SELECT id, event_id, filename, original_name, file_size, mime_type, upload_date 
      FROM event_photos 
      ORDER BY upload_date DESC 
      LIMIT 10
    `);
    console.table(recentPhotos);
    
    // Vérifier les photos pour l'événement 24 spécifiquement
    console.log('\n🎯 Photos pour l\'événement ID 24:');
    const [event24Photos] = await connection.execute(`
      SELECT id, filename, original_name, file_size, mime_type, upload_date 
      FROM event_photos 
      WHERE event_id = 24 
      ORDER BY upload_date DESC
    `);
    console.table(event24Photos);
    
    // Vérifier les photos pour l'événement 25
    console.log('\n🎯 Photos pour l\'événement ID 25:');
    const [event25Photos] = await connection.execute(`
      SELECT id, filename, original_name, file_size, mime_type, upload_date 
      FROM event_photos 
      WHERE event_id = 25 
      ORDER BY upload_date DESC
    `);
    console.table(event25Photos);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Connexion fermée');
    }
  }
}

checkEventPhotos();