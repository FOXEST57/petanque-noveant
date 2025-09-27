import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function analyzeHistory() {
  console.log('🔍 Analyse de l\'historique des opérations de fond de caisse');
  console.log('=======================================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const clubId = 2;
    
    // 1. Vérifier l'ancienne table fond_caisse
    console.log('1. Ancienne table fond_caisse:');
    const [fondCaisseRows] = await connection.execute(
      'SELECT * FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (fondCaisseRows.length > 0) {
      const fond = fondCaisseRows[0];
      console.log(`   - Crédit initial: ${fond.credit}€`);
      console.log(`   - Débit initial: ${fond.debit}€`);
      console.log(`   - Solde actuel: ${fond.solde}€`);
      console.log(`   - Date création: ${fond.date_creation}`);
      console.log(`   - Date modification: ${fond.date_modification}`);
    }
    
    // 2. Vérifier toutes les opérations dans fond_caisse_operations
    console.log('\n2. Toutes les opérations dans fond_caisse_operations:');
    const [operationsRows] = await connection.execute(
      'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation ASC',
      [clubId]
    );
    
    console.log(`   - Nombre total d'opérations: ${operationsRows.length}`);
    operationsRows.forEach((op, index) => {
      console.log(`   ${index + 1}. [${op.date_operation}] ${op.type_operation.toUpperCase()} - ${op.montant}€`);
      console.log(`      Description: ${op.description}`);
      if (op.banque_id) console.log(`      Banque ID: ${op.banque_id}`);
      if (op.user_id) console.log(`      User ID: ${op.user_id}`);
      console.log('');
    });
    
    // 3. Vérifier les transferts bancaires récents dans caisse_historique
    console.log('3. Transferts bancaires dans caisse_historique (pour comparaison):');
    const [historiqueRows] = await connection.execute(
      `SELECT * FROM caisse_historique 
       WHERE club_id = ? AND type_operation LIKE '%transfert%' 
       ORDER BY date_operation DESC LIMIT 10`,
      [clubId]
    );
    
    console.log(`   - Nombre de transferts trouvés: ${historiqueRows.length}`);
    historiqueRows.forEach((op, index) => {
      console.log(`   ${index + 1}. [${op.date_operation}] ${op.type_operation}`);
      console.log(`      Encaissement: ${op.montant_encaissement}€`);
      console.log(`      Retrait: ${op.montant_retrait}€`);
      console.log(`      Description: ${op.description}`);
      console.log('');
    });
    
    // 4. Vérifier s'il y a eu une migration de données
    console.log('4. Vérification de la migration:');
    const [migrationRows] = await connection.execute(
      `SELECT * FROM fond_caisse_operations 
       WHERE id_club = ? AND description LIKE '%migration%' 
       ORDER BY date_operation ASC`,
      [clubId]
    );
    
    if (migrationRows.length > 0) {
      console.log('   ⚠️  MIGRATION DÉTECTÉE:');
      migrationRows.forEach((op, index) => {
        console.log(`   ${index + 1}. Migration de ${op.montant}€ - ${op.description}`);
      });
      
      console.log('\n   💡 EXPLICATION:');
      console.log('   Le montant de 250.02€ provient probablement de la migration');
      console.log('   des données existantes de l\'ancienne table fond_caisse.');
      console.log('   Cela inclut votre transfert de 100€ plus d\'autres opérations antérieures.');
    }
    
    // 5. Calculer le total
    const [totalsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
       FROM fond_caisse_operations 
       WHERE id_club = ?`,
      [clubId]
    );
    
    const totals = totalsRows[0];
    console.log('\n5. Calcul final:');
    console.log(`   - Total crédits: ${totals.total_credits}€`);
    console.log(`   - Total débits: ${totals.total_debits}€`);
    console.log(`   - Solde final: ${parseFloat(totals.total_credits) - parseFloat(totals.total_debits)}€`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

analyzeHistory().catch(console.error);