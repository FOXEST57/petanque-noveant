import mysql from 'mysql2/promise';

async function createCaisseTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('Connexion à la base de données établie');
    
    // Vérifier si la table existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'caisse_historique'"
    );
    
    if (tables.length > 0) {
      console.log('La table caisse_historique existe déjà');
    } else {
      console.log('Création de la table caisse_historique...');
      
      // Créer la table caisse_historique
      await connection.execute(`
        CREATE TABLE caisse_historique (
          id INT PRIMARY KEY AUTO_INCREMENT,
          club_id INT NOT NULL,
          user_id INT NOT NULL,
          membre_id INT NULL,
          type_operation VARCHAR(50) NOT NULL COMMENT 'credit, transfert, fond',
          montant DECIMAL(10,2) NOT NULL COMMENT 'Montant positif ou négatif selon l operation',
          description TEXT,
          date_operation DATETIME NOT NULL,
          
          INDEX idx_club_date (club_id, date_operation),
          INDEX idx_type_operation (type_operation),
          
          FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
          FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE
        )
      `);
      
      console.log('Table caisse_historique créée avec succès');
    }
    
    // Vérifier la structure de la table
    const [structure] = await connection.execute('DESCRIBE caisse_historique');
    console.log('Structure de la table caisse_historique:');
    console.table(structure);
    
    await connection.end();
    console.log('Script terminé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

createCaisseTable();