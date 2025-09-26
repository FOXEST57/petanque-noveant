import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function createFondCaisseTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Création de la table fond_caisse (sans contrainte de clé étrangère pour éviter les erreurs)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS fond_caisse (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_club INT NOT NULL,
        credit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montants crédités (transferts banque vers caisse)',
        debit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montants débités (transferts caisse vers banque)',
        solde DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Solde actuel du fond de caisse',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_club (id_club)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createTableQuery);
    console.log('Table fond_caisse créée avec succès');

    // Migration des données existantes
    const migrateDataQuery = `
      INSERT INTO fond_caisse (id_club, solde)
      SELECT id, COALESCE(fond_caisse, 0.00) as solde
      FROM clubs
      ON DUPLICATE KEY UPDATE 
        solde = VALUES(solde)
    `;

    await connection.execute(migrateDataQuery);
    console.log('Données migrées avec succès');

    // Vérification des données
    const [rows] = await connection.execute(`
      SELECT fc.id_club, c.nom as club_nom, fc.credit, fc.debit, fc.solde
      FROM fond_caisse fc
      JOIN clubs c ON fc.id_club = c.id
      ORDER BY fc.id_club
    `);

    console.log('\nDonnées dans la nouvelle table fond_caisse:');
    console.table(rows);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnexion fermée');
    }
  }
}

createFondCaisseTable();