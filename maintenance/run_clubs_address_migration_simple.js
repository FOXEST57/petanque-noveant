import mysql from 'mysql2/promise';
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
    
    console.log('🚀 Ajout des nouveaux champs d\'adresse...');
    
    // Ajouter les nouveaux champs un par un
    const alterQueries = [
      "ALTER TABLE clubs ADD COLUMN numero_rue VARCHAR(10) DEFAULT NULL COMMENT 'Numéro de rue'",
      "ALTER TABLE clubs ADD COLUMN nom_rue VARCHAR(255) DEFAULT NULL COMMENT 'Nom de la rue'",
      "ALTER TABLE clubs ADD COLUMN code_postal VARCHAR(5) DEFAULT NULL COMMENT 'Code postal'"
    ];
    
    for (const query of alterQueries) {
      try {
        console.log(`Exécution: ${query.substring(0, 60)}...`);
        await connection.execute(query);
        console.log('✅ Colonne ajoutée avec succès');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('⚠️ Colonne déjà existante, passage à la suivante');
        } else {
          throw error;
        }
      }
    }
    
    console.log('📊 Migration des données existantes...');
    
    // Migrer les données existantes
    const updateQuery = `
      UPDATE clubs SET 
        numero_rue = CASE 
          WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ' ', 1), ',', 1))
          ELSE 
            TRIM(SUBSTRING_INDEX(adresse, ' ', 1))
        END,
        nom_rue = CASE 
          WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ',', 1), ' ', -1))
          ELSE 
            TRIM(SUBSTRING(adresse, LOCATE(' ', adresse) + 1, 
              LOCATE(',', CONCAT(adresse, ',')) - LOCATE(' ', adresse) - 1))
        END,
        code_postal = CASE 
          WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ',', 2), ' ', 1))
          ELSE NULL
        END
      WHERE adresse IS NOT NULL AND adresse != ''
    `;
    
    await connection.execute(updateQuery);
    console.log('✅ Données migrées avec succès');
    
    console.log('🔍 Ajout des index...');
    
    // Ajouter les index
    const indexQueries = [
      "ALTER TABLE clubs ADD INDEX idx_code_postal (code_postal)",
      "ALTER TABLE clubs ADD INDEX idx_ville_code_postal (ville, code_postal)"
    ];
    
    for (const query of indexQueries) {
      try {
        console.log(`Exécution: ${query.substring(0, 60)}...`);
        await connection.execute(query);
        console.log('✅ Index ajouté avec succès');
      } catch (error) {
        if (error.message.includes('Duplicate key name')) {
          console.log('⚠️ Index déjà existant, passage au suivant');
        } else {
          throw error;
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