import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function debugEndpointComplet() {
  console.log('🔍 Debug complet de l\'endpoint');
  console.log('================================');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. Vérifier l'état initial
    const [fondCaisseRows] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [2]
    );
    
    const fondCaisseData = fondCaisseRows;
    console.log('1. Données brutes fond_caisse:', fondCaisseData);
    console.log('   Type de solde:', typeof fondCaisseData[0]?.solde);
    
    const fondActuel = fondCaisseData.length > 0 ? parseFloat(fondCaisseData[0].solde || 0) : 0;
    console.log('2. fondActuel après parseFloat:', fondActuel, typeof fondActuel);
    
    // 2. Simuler le calcul comme dans l'endpoint
    const montant = 150;
    console.log('3. montant:', montant, typeof montant);
    
    const nouveauFondCaisse = fondActuel + montant;
    console.log('4. nouveauFondCaisse calculé:', nouveauFondCaisse, typeof nouveauFondCaisse);
    
    // 3. Vérifier le recalcul après insertion
    const [operationsFondRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
       FROM fond_caisse_operations 
       WHERE id_club = ?`,
      [2]
    );
    
    const operationsFond = operationsFondRows;
    console.log('5. Données opérations:', operationsFond);
    
    const totalCredits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_credits) : 0;
    const totalDebits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_debits) : 0;
    
    console.log('6. totalCredits:', totalCredits, typeof totalCredits);
    console.log('7. totalDebits:', totalDebits, typeof totalDebits);
    
    const nouveauFondRecalcule = totalCredits - totalDebits;
    console.log('8. nouveauFondRecalcule:', nouveauFondRecalcule, typeof nouveauFondRecalcule);
    
    // 4. Test de formatage
    console.log('9. nouveauFondCaisse.toFixed(2):', nouveauFondCaisse.toFixed(2));
    console.log('10. nouveauFondRecalcule.toFixed(2):', nouveauFondRecalcule.toFixed(2));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

debugEndpointComplet();