const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

console.log('🔍 Vérification de la base de données MariaDB/MySQL...');

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Base de données connectée');
    
    // Vérifier les événements
    const [events] = await connection.execute('SELECT id, title FROM events');
    console.log('📅 Événements:', events.length);
    events.forEach(e => console.log(`  - ID: ${e.id}, Titre: ${e.title}`));
    
    // Vérifier les photos d'événements
    const [photos] = await connection.execute('SELECT * FROM event_photos');
    console.log('📸 Photos d\'événements:', photos.length);
    photos.forEach(p => console.log(`  - ID: ${p.id}, Event: ${p.event_id}, Fichier: ${p.filename}`));
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Connexion fermée');
    }
  }
}

// Exécuter la vérification
checkDatabase();