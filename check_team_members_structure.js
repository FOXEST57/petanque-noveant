const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTeamMembersStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'petanque_noveant'
    });
    
    console.log('🔍 Structure de la table team_members:');
    const [rows] = await connection.execute('DESCRIBE team_members');
    
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key ? `(${row.Key})` : ''}`);
    });
    
    // Vérifier spécifiquement la colonne club_id
    const hasClubId = rows.some(row => row.Field === 'club_id');
    console.log(`\n✅ Colonne club_id présente: ${hasClubId ? 'OUI' : 'NON'}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTeamMembersStructure();