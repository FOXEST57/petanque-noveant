import mysql from 'mysql2/promise';

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection(config);
    
    console.log('Vérification de la structure de la table home_content:');
    const [rows] = await connection.execute('DESCRIBE home_content');
    
    console.log('Colonnes existantes:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkTableStructure();