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

console.log('🔍 Vérification des clubs dans la base de données...');

async function checkClubs() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Base de données connectée');
    
    // Vérifier tous les clubs
    const [clubs] = await connection.execute('SELECT id, name, subdomain FROM clubs');
    console.log('🏛️ Clubs trouvés:', clubs.length);
    clubs.forEach(c => console.log(`  - ID: ${c.id}, Nom: ${c.name}, Sous-domaine: ${c.subdomain}`));
    
    // Vérifier spécifiquement le club noveant
    const [noveantClub] = await connection.execute('SELECT * FROM clubs WHERE subdomain = ?', ['noveant']);
    console.log('🎯 Club noveant:', noveantClub);
    
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
checkClubs();