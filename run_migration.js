import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📄 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('migrations/add_teams_animations_tournaments_fields.sql', 'utf8');
    
    // Diviser le SQL en requêtes individuelles
    const queries = migrationSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log('🚀 Exécution de la migration...');
    for (const query of queries) {
      if (query.trim()) {
        console.log(`Exécution: ${query.substring(0, 50)}...`);
        await connection.execute(query);
      }
    }
    
    console.log('✅ Migration exécutée avec succès!');
    
    // Vérifier que les colonnes ont été ajoutées
    const [columns] = await connection.execute('DESCRIBE home_content');
    console.log('\n📋 Structure de la table home_content:');
    columns.forEach(col => {
      if (['teams_content', 'animations_content', 'tournaments_content'].includes(col.Field)) {
        console.log(`✅ ${col.Field}: ${col.Type}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée.');
    }
  }
}

runMigration();