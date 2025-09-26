import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function removeFondCaisseColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Vérifier si la colonne fond_caisse existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'petanque_noveant' 
      AND TABLE_NAME = 'clubs' 
      AND COLUMN_NAME = 'fond_caisse'
    `);

    if (columns.length > 0) {
      console.log('Colonne fond_caisse trouvée, suppression en cours...');
      
      // Supprimer la colonne fond_caisse
      await connection.execute('ALTER TABLE clubs DROP COLUMN fond_caisse');
      console.log('✅ Colonne fond_caisse supprimée avec succès');
      
      // Vérifier la structure de la table après suppression
      const [structure] = await connection.execute('DESCRIBE clubs');
      console.log('\nNouvelle structure de la table clubs:');
      console.table(structure);
      
    } else {
      console.log('❌ Colonne fond_caisse non trouvée dans la table clubs');
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

removeFondCaisseColumn();