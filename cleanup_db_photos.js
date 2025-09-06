import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'database/petanque.db');
const UPLOADS_DIR = './uploads/events';

async function cleanupDatabasePhotos() {
  console.log('🧹 Nettoyage de la base de données...');
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err);
        reject(err);
        return;
      }
      
      console.log('Connexion à la base de données établie.');
      
      // Récupérer toutes les photos de la base de données
      db.all('SELECT * FROM event_photos', [], (err, allPhotos) => {
        if (err) {
          console.error('Erreur lors de la récupération des photos:', err);
          db.close();
          reject(err);
          return;
        }
        
        console.log(`📊 ${allPhotos.length} photos trouvées dans la base de données`);
        
        let deletedCount = 0;
        let processed = 0;
        
        if (allPhotos.length === 0) {
          console.log('✅ Aucune photo à traiter.');
          db.close();
          resolve();
          return;
        }
        
        for (const photo of allPhotos) {
          const filePath = path.join(UPLOADS_DIR, photo.filename);
          
          // Vérifier si le fichier existe
          if (!fs.existsSync(filePath)) {
            console.log(`❌ Fichier manquant: ${photo.filename} - Suppression de la DB`);
            
            // Supprimer l'enregistrement de la base de données
            db.run('DELETE FROM event_photos WHERE id = ?', [photo.id], function(err) {
              if (err) {
                console.error(`Erreur lors de la suppression de ${photo.filename}:`, err);
              } else {
                deletedCount++;
              }
              
              processed++;
              if (processed === allPhotos.length) {
                console.log(`🗑️ ${deletedCount} enregistrements supprimés de la base de données`);
                console.log('✅ Nettoyage de la base de données terminé!');
                db.close();
                resolve();
              }
            });
          } else {
            console.log(`✅ Fichier OK: ${photo.filename}`);
            processed++;
            if (processed === allPhotos.length) {
              console.log(`🗑️ ${deletedCount} enregistrements supprimés de la base de données`);
              console.log('✅ Nettoyage de la base de données terminé!');
              db.close();
              resolve();
            }
          }
        }
      });
    });
  });
}

// Exécuter le nettoyage
cleanupDatabasePhotos().catch(console.error);