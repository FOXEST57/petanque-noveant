import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function fixMembershipTable() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 Vérification de la structure de la table membership_requests...');
    
    // Vérifier si les colonnes existent
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'membership_requests'
    `, [dbConfig.database]);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Colonnes existantes:', columnNames);
    
    // Ajouter date_traitement si elle n'existe pas
    if (!columnNames.includes('date_traitement')) {
      console.log('➕ Ajout de la colonne date_traitement...');
      await connection.execute(`
        ALTER TABLE membership_requests 
        ADD COLUMN date_traitement TIMESTAMP NULL
      `);
    }
    
    // Ajouter traite_par_user_id si elle n'existe pas
    if (!columnNames.includes('traite_par_user_id')) {
      console.log('➕ Ajout de la colonne traite_par_user_id...');
      await connection.execute(`
        ALTER TABLE membership_requests 
        ADD COLUMN traite_par_user_id INT NULL,
        ADD FOREIGN KEY (traite_par_user_id) REFERENCES users(id) ON DELETE SET NULL
      `);
    }
    
    // Ajouter commentaire_traitement si elle n'existe pas
    if (!columnNames.includes('commentaire_traitement')) {
      console.log('➕ Ajout de la colonne commentaire_traitement...');
      await connection.execute(`
        ALTER TABLE membership_requests 
        ADD COLUMN commentaire_traitement TEXT NULL
      `);
    }
    
    console.log('✅ Structure de la table membership_requests mise à jour avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

fixMembershipTable();