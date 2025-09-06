const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'petanque.db');
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

// Fonction pour initialiser la base de données
const setupDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🚀 Initialisation de la base de données SQLite...');
      
      // Supprimer l'ancienne base de données si elle existe
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log('✅ Ancienne base de données supprimée');
      }
      
      // Créer une nouvelle base de données
      const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Erreur lors de la création de la base de données:', err);
          reject(err);
          return;
        }
        console.log('✅ Base de données créée avec succès');
        
        // Lire et exécuter le script SQL d'initialisation
        const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        
        db.exec(initSQL, (err) => {
          if (err) {
            console.error('❌ Erreur lors de l\'exécution du script SQL:', err);
            reject(err);
            return;
          }
          
          console.log('✅ Tables créées et données d\'exemple insérées');
          
          // Fermer la connexion
          db.close((err) => {
            if (err) {
              console.error('❌ Erreur lors de la fermeture:', err);
              reject(err);
              return;
            }
            console.log('✅ Base de données initialisée avec succès!');
            console.log(`📍 Fichier de base de données: ${DB_PATH}`);
            resolve();
          });
        });
      });
      
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      reject(error);
    }
  });
};

// Exécuter le script si appelé directement
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Configuration terminée!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la configuration:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;