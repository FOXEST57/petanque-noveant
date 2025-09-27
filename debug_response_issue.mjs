import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function debugResponseIssue() {
  console.log('🔍 Debug du problème de réponse API');
  console.log('===================================');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Simuler exactement ce qui se passe dans l'endpoint
    const clubId = 2;
    const montant = 150; // Nombre
    
    // 1. Récupérer le fond actuel
    const [fondCaisseRows] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    const fondCaisseData = fondCaisseRows;
    const fondActuel = fondCaisseData.length > 0 ? parseFloat(fondCaisseData[0].solde || 0) : 0;
    console.log('1. fondActuel:', fondActuel, typeof fondActuel);
    
    // 2. Calculer le nouveau fond (comme dans l'endpoint)
    let nouveauFondCaisse = fondActuel + montant;
    console.log('2. nouveauFondCaisse initial:', nouveauFondCaisse, typeof nouveauFondCaisse);
    
    // 3. Simuler l'insertion (sans vraiment insérer)
    console.log('3. Simulation de l\'insertion...');
    
    // 4. Recalculer comme dans l'endpoint
    const [operationsFondRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
       FROM fond_caisse_operations 
       WHERE id_club = ?`,
      [clubId]
    );
    
    const operationsFond = operationsFondRows;
    console.log('4. operationsFond:', operationsFond);
    
    const totalCredits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_credits) : 0;
    const totalDebits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_debits) : 0;
    
    console.log('5. totalCredits:', totalCredits, typeof totalCredits);
    console.log('6. totalDebits:', totalDebits, typeof totalDebits);
    
    // Le nouveau solde du fond = total crédits - total débits
    nouveauFondCaisse = totalCredits - totalDebits;
    console.log('7. nouveauFondCaisse après recalcul:', nouveauFondCaisse, typeof nouveauFondCaisse);
    
    // Test de la réponse
    const response = {
      success: true,
      message: "Test",
      nouveauFondCaisse: nouveauFondCaisse.toFixed(2)
    };
    console.log('8. Réponse finale:', JSON.stringify(response, null, 2));
    
    // Test avec concaténation accidentelle
    const testConcat = fondActuel + montant.toString();
    console.log('9. Test concaténation (fondActuel + montant.toString()):', testConcat);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

debugResponseIssue();