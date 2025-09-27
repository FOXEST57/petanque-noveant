import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function debugCalculSolde() {
  console.log('🔍 Debug du calcul de solde');
  console.log('============================');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Récupérer le fond actuel
    const [fondCaisseRows] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [2]
    );
    
    const fondCaisseData = fondCaisseRows;
    console.log('1. Données brutes fond_caisse:', fondCaisseData);
    
    const fondActuel = fondCaisseData.length > 0 ? parseFloat(fondCaisseData[0].solde || 0) : 0;
    console.log('2. fondActuel après parseFloat:', fondActuel, typeof fondActuel);
    
    const montant = 150;
    console.log('3. montant:', montant, typeof montant);
    
    // Test du calcul
    const nouveauFondCaisse = fondActuel + montant;
    console.log('4. nouveauFondCaisse (fondActuel + montant):', nouveauFondCaisse, typeof nouveauFondCaisse);
    
    // Test avec conversion explicite
    const nouveauFondCaisseExplicite = Number(fondActuel) + Number(montant);
    console.log('5. nouveauFondCaisseExplicite (Number + Number):', nouveauFondCaisseExplicite, typeof nouveauFondCaisseExplicite);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

debugCalculSolde();