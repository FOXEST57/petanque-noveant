import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function checkClubsStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Vérification de la structure de la table clubs...\n');
    
    const [structure] = await connection.execute('DESCRIBE clubs');
    console.log('Structure de la table clubs:');
    console.table(structure);
    
    const fondCaisseColumn = structure.find(col => col.Field === 'fond_caisse');
    if (fondCaisseColumn) {
      console.log('\n❌ La colonne fond_caisse existe encore dans clubs');
      console.log('   Cette colonne doit être supprimée pour éviter les erreurs SQL');
    } else {
      console.log('\n✅ La colonne fond_caisse a été supprimée de clubs');
    }
    
    // Vérifier aussi la table fond_caisse
    console.log('\n🔍 Vérification de la table fond_caisse...');
    const [fondCaisseStructure] = await connection.execute('DESCRIBE fond_caisse');
    console.log('Structure de la table fond_caisse:');
    console.table(fondCaisseStructure);
    
    // Vérifier les données dans fond_caisse
    const [fondCaisseData] = await connection.execute('SELECT * FROM fond_caisse');
    console.log('\nDonnées dans fond_caisse:');
    console.table(fondCaisseData);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkClubsStructure().catch(console.error);