import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function applyMigration() {
  let connection;
  
  try {
    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Application de la migration team_members...');
    
    // Vérifier si la colonne club_id existe déjà
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'team_members' AND COLUMN_NAME = 'club_id'
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log('✅ La colonne club_id existe déjà dans team_members');
    } else {
      console.log('➕ Ajout de la colonne club_id...');
      await connection.execute('ALTER TABLE team_members ADD COLUMN club_id INT NOT NULL DEFAULT 1');
      console.log('✅ Colonne club_id ajoutée');
    }
    
    // Vérifier l'index
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'team_members' AND INDEX_NAME = 'idx_team_members_club_id'
    `, [dbConfig.database]);
    
    if (indexes.length === 0) {
      console.log('➕ Création de l\'index idx_team_members_club_id...');
      await connection.execute('CREATE INDEX idx_team_members_club_id ON team_members(club_id)');
      console.log('✅ Index créé');
    } else {
      console.log('✅ L\'index idx_team_members_club_id existe déjà');
    }
    
    // Mettre à jour les enregistrements existants
    console.log('🔄 Mise à jour des enregistrements existants...');
    const [updateResult] = await connection.execute('UPDATE team_members SET club_id = 1 WHERE club_id IS NULL OR club_id = 0');
    console.log(`✅ ${updateResult.affectedRows} enregistrements mis à jour`);
    
    // Vérifier la contrainte unique
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'team_members' AND CONSTRAINT_NAME = 'unique_team_member_club'
    `, [dbConfig.database]);
    
    if (constraints.length === 0) {
      // Supprimer l'ancienne contrainte si elle existe
      try {
        await connection.execute('ALTER TABLE team_members DROP INDEX unique_team_member');
        console.log('🗑️ Ancienne contrainte unique supprimée');
      } catch (error) {
        console.log('ℹ️ Aucune ancienne contrainte unique à supprimer');
      }
      
      console.log('➕ Création de la nouvelle contrainte unique...');
      await connection.execute('ALTER TABLE team_members ADD CONSTRAINT unique_team_member_club UNIQUE (team_id, member_id, club_id)');
      console.log('✅ Nouvelle contrainte unique créée');
    } else {
      console.log('✅ La contrainte unique_team_member_club existe déjà');
    }
    
    // Vérifier la structure finale
    console.log('\n📋 Structure finale de la table team_members:');
    const [structure] = await connection.execute('DESCRIBE team_members');
    structure.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });
    
    console.log('\n🎉 Migration appliquée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applyMigration();