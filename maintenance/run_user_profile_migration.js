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

async function runUserProfileMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📄 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('database/migration_add_user_profile_fields.sql', 'utf8');
    
    // Diviser le SQL en requêtes individuelles
    const queries = migrationSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log('🚀 Exécution de la migration...');
    for (const query of queries) {
      if (query.trim()) {
        console.log(`Exécution: ${query.substring(0, 80)}...`);
        try {
          await connection.execute(query);
          console.log('✅ Requête exécutée avec succès');
        } catch (error) {
          console.log(`⚠️ Erreur (peut être normale si la colonne existe déjà): ${error.message}`);
        }
      }
    }
    
    console.log('✅ Migration terminée!');
    
    // Vérifier que les colonnes ont été ajoutées
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\n📋 Structure de la table users:');
    columns.forEach(col => {
      if (['numero_rue', 'rue', 'code_postal', 'ville', 'solde'].includes(col.Field)) {
        console.log(`✅ ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

runUserProfileMigration();