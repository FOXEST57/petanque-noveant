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

async function runClubsAddressMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📄 Lecture du fichier de migration...');
    const migrationSQL = fs.readFileSync('database/migration_update_clubs_address.sql', 'utf8');
    
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
    const [columns] = await connection.execute('DESCRIBE clubs');
    console.log('\n📋 Structure de la table clubs:');
    columns.forEach(col => {
      if (['numero_rue', 'nom_rue', 'code_postal', 'adresse'].includes(col.Field)) {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      }
    });
    
    // Vérifier quelques exemples de données migrées
    console.log('\n📊 Exemples de données migrées:');
    const [rows] = await connection.execute('SELECT nom, adresse, numero_rue, nom_rue, code_postal FROM clubs LIMIT 3');
    rows.forEach(row => {
      console.log(`Club: ${row.nom}`);
      console.log(`  Ancienne adresse: ${row.adresse || 'N/A'}`);
      console.log(`  Nouveau format: ${row.numero_rue || ''} ${row.nom_rue || ''}, ${row.code_postal || ''}`);
      console.log('');
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

runClubsAddressMigration();