const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

const sqlPath = path.join(__dirname, 'create_database.sql');

console.log('🚀 Initialisation de la base de données MariaDB/MySQL...');

async function initializeDatabase() {
  let connection;
  
  try {
    // Créer la connexion MySQL
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Connexion à MySQL établie');
    
    // Créer la base de données si elle n'existe pas
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Base de données '${dbConfig.database}' créée ou vérifiée`);
    
    // Se connecter à la base de données spécifique
    await connection.changeUser({ database: dbConfig.database });
    console.log(`✅ Connexion à la base de données '${dbConfig.database}' établie`);
        
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Fichier SQL lu avec succès');
    
    // Diviser le contenu SQL en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    // Exécuter chaque requête
    for (const query of queries) {
      if (query.trim()) {
        await connection.execute(query);
      }
    }
    
    console.log('✅ Script SQL exécuté avec succès');
    console.log('🎉 Base de données initialisée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Connexion fermée');
    }
  }
}

// Lancer l'initialisation
initializeDatabase();