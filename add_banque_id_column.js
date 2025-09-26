import mysql from 'mysql2/promise';

async function addBanqueIdColumn() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('Connexion à la base de données établie');
    
    // Vérifier si la colonne banque_id existe déjà
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM caisse_historique LIKE 'banque_id'"
    );
    
    if (columns.length > 0) {
      console.log('La colonne banque_id existe déjà dans caisse_historique');
    } else {
      console.log('Ajout de la colonne banque_id à la table caisse_historique...');
      
      // Ajouter la colonne banque_id
      await connection.execute(`
        ALTER TABLE caisse_historique 
        ADD COLUMN banque_id INT NULL
      `);
      
      console.log('Colonne banque_id ajoutée avec succès');
      
      // Ajouter la contrainte de clé étrangère
      try {
        await connection.execute(`
          ALTER TABLE caisse_historique 
          ADD CONSTRAINT fk_caisse_historique_banque 
          FOREIGN KEY (banque_id) REFERENCES banque(id) ON DELETE SET NULL
        `);
        console.log('Contrainte de clé étrangère ajoutée avec succès');
      } catch (error) {
        console.log('Contrainte de clé étrangère déjà existante ou erreur:', error.message);
      }
      
      // Créer un index sur banque_id
      try {
        await connection.execute(`
          CREATE INDEX idx_caisse_historique_banque_id ON caisse_historique(banque_id)
        `);
        console.log('Index sur banque_id créé avec succès');
      } catch (error) {
        console.log('Index déjà existant ou erreur:', error.message);
      }
    }
    
    // Vérifier la structure de la table
    const [structure] = await connection.execute('DESCRIBE caisse_historique');
    console.log('Structure mise à jour de la table caisse_historique:');
    console.table(structure);
    
    await connection.end();
    console.log('Script terminé avec succès');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

addBanqueIdColumn();