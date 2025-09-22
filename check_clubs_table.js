import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function checkClubsTable() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Vérification de la structure de la table clubs...');
    
    const [structure] = await connection.execute('DESCRIBE clubs');
    console.log('Structure de la table clubs:');
    console.table(structure);
    
    console.log('\n📊 Données existantes dans la table clubs:');
    const [clubs] = await connection.execute('SELECT * FROM clubs LIMIT 5');
    console.table(clubs);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkClubsTable();