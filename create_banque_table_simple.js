import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

async function createBanqueTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connexion à la base de données établie');

    // Créer la table banque
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS banque (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT NOT NULL,
        nom VARCHAR(255) NOT NULL,
        adresse TEXT,
        iban VARCHAR(34),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        INDEX idx_club_id (club_id)
      )
    `;
    
    await connection.execute(createTableQuery);
    console.log('Table banque créée avec succès');

    // Insérer la banque principale pour chaque club
    const insertDefaultBanksQuery = `
      INSERT INTO banque (club_id, nom, adresse, iban)
      SELECT 
        id as club_id,
        'Banque Principale' as nom,
        'Adresse à renseigner' as adresse,
        'IBAN à renseigner' as iban
      FROM clubs
      WHERE NOT EXISTS (
        SELECT 1 FROM banque WHERE banque.club_id = clubs.id AND banque.nom = 'Banque Principale'
      )
    `;
    
    const [result] = await connection.execute(insertDefaultBanksQuery);
    console.log(`${result.affectedRows} banques principales ajoutées`);

    // Vérifier les données
    const [rows] = await connection.execute('SELECT * FROM banque');
    console.log('Banques créées:', rows);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connexion fermée');
    }
  }
}

createBanqueTable();