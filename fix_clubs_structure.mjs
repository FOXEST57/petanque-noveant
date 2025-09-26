import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function fixClubsStructure() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 Correction de la structure de la table clubs...\n');
    
    // 1. Vérifier la structure actuelle
    console.log('1. Structure actuelle de la table clubs:');
    const [structure] = await connection.execute('DESCRIBE clubs');
    console.table(structure);
    
    // 2. Vérifier si la colonne fond_caisse existe
    const fondCaisseColumn = structure.find(col => col.Field === 'fond_caisse');
    
    if (fondCaisseColumn) {
      console.log('\n❌ La colonne fond_caisse existe encore dans clubs');
      console.log('   Suppression en cours...');
      
      // Supprimer la colonne fond_caisse
      await connection.execute('ALTER TABLE clubs DROP COLUMN fond_caisse');
      console.log('✅ Colonne fond_caisse supprimée avec succès');
      
      // Vérifier la nouvelle structure
      console.log('\n3. Nouvelle structure de la table clubs:');
      const [newStructure] = await connection.execute('DESCRIBE clubs');
      console.table(newStructure);
      
    } else {
      console.log('\n✅ La colonne fond_caisse n\'existe pas dans clubs');
      console.log('   Aucune action nécessaire');
    }
    
    // 4. Vérifier que la table fond_caisse existe et contient des données
    console.log('\n4. Vérification de la table fond_caisse:');
    try {
      const [fondCaisseData] = await connection.execute('SELECT * FROM fond_caisse');
      console.log('✅ Table fond_caisse trouvée avec', fondCaisseData.length, 'enregistrement(s)');
      console.table(fondCaisseData);
    } catch (error) {
      console.log('❌ Erreur avec la table fond_caisse:', error.message);
    }
    
    console.log('\n🎉 Correction terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    await connection.end();
  }
}

fixClubsStructure().catch(console.error);