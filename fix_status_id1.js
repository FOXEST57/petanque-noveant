import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function fixStatusId1() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Vérifier le statut actuel de la demande ID 1
    const [rows] = await connection.execute(
      'SELECT id, nom, prenom, statut FROM membership_requests WHERE id = 1'
    );
    
    console.log('Statut actuel de la demande ID 1:', rows[0]);

    // Corriger le statut de la demande ID 1 à "en_attente"
    await connection.execute(
      'UPDATE membership_requests SET statut = ? WHERE id = 1',
      ['en_attente']
    );

    console.log('Statut de la demande ID 1 mis à jour à "en_attente"');

    // Vérification finale
    const [updatedRows] = await connection.execute(
      'SELECT id, nom, prenom, statut FROM membership_requests WHERE id = 1'
    );
    
    console.log('Statut après mise à jour:', updatedRows[0]);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion fermée');
    }
  }
}

fixStatusId1();