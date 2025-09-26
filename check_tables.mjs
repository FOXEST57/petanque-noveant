import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function checkTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Lister toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nTables existantes:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    // Vérifier si la table clubs existe
    const [clubsCheck] = await connection.execute("SHOW TABLES LIKE 'clubs'");
    if (clubsCheck.length > 0) {
      console.log('\n✅ Table clubs trouvée');
      
      // Afficher la structure de la table clubs
      const [clubsStructure] = await connection.execute('DESCRIBE clubs');
      console.log('\nStructure de la table clubs:');
      console.table(clubsStructure);
      
      // Afficher les données de la table clubs
      const [clubsData] = await connection.execute('SELECT * FROM clubs');
      console.log('\nDonnées de la table clubs:');
      console.table(clubsData);
    } else {
      console.log('\n❌ Table clubs non trouvée');
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnexion fermée');
    }
  }
}

checkTables();