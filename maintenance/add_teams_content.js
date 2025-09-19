import mysql from 'mysql2/promise';

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function addTeamsContentColumn() {
  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔄 Ajout de la colonne teams_content...');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'petanque_noveant' AND TABLE_NAME = 'home_content' AND COLUMN_NAME = 'teams_content'"
    );
    
    if (columns.length > 0) {
      console.log('✅ La colonne teams_content existe déjà.');
    } else {
      // Ajouter la colonne
      await connection.execute('ALTER TABLE home_content ADD COLUMN teams_content TEXT AFTER club_description');
      console.log('✅ Colonne teams_content ajoutée avec succès.');
      
      // Initialiser avec une valeur par défaut
      await connection.execute("UPDATE home_content SET teams_content = 'Nos équipes participent régulièrement aux championnats locaux et régionaux.' WHERE id = 1");
      console.log('✅ Valeur par défaut ajoutée.');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addTeamsContentColumn();