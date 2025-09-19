import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

const UPLOADS_DIR = './uploads/events';

async function cleanupDatabasePhotos() {
  console.log('🧹 Nettoyage de la base de données MariaDB/MySQL...');
  
  let connection;
  
  try {
    // Créer la connexion MySQL
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie.');
    
    // Récupérer toutes les photos de la base de données
    const [allPhotos] = await connection.execute('SELECT * FROM event_photos');
    
    console.log(`📊 ${allPhotos.length} photos trouvées dans la base de données`);
    
    let deletedCount = 0;
    
    if (allPhotos.length === 0) {
      console.log('✅ Aucune photo à traiter.');
      return;
    }
    
    for (const photo of allPhotos) {
      const filePath = path.join(UPLOADS_DIR, photo.filename);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Fichier manquant: ${photo.filename} - Suppression de la DB`);
        
        try {
          // Supprimer l'enregistrement de la base de données
          await connection.execute('DELETE FROM event_photos WHERE id = ?', [photo.id]);
          deletedCount++;
        } catch (err) {
          console.error(`Erreur lors de la suppression de ${photo.filename}:`, err);
        }
      } else {
        console.log(`✅ Fichier OK: ${photo.filename}`);
      }
    }
    
    console.log(`🗑️ ${deletedCount} enregistrements supprimés de la base de données`);
    console.log('✅ Nettoyage de la base de données terminé!');
    
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le nettoyage
cleanupDatabasePhotos().catch(console.error);