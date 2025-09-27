import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function checkTables() {
  console.log('🔍 Vérification des tables fond_caisse et fond_caisse_operations');
  console.log('================================================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const clubId = 2;
    
    // 1. Vérifier fond_caisse (ancienne table)
    console.log('1. Table fond_caisse (ancienne):');
    const [fondCaisseRows] = await connection.execute(
      'SELECT * FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (fondCaisseRows.length > 0) {
      const fond = fondCaisseRows[0];
      console.log(`   - Crédit: ${fond.credit}€`);
      console.log(`   - Débit: ${fond.debit}€`);
      console.log(`   - Solde: ${fond.solde}€`);
    } else {
      console.log('   - Aucune donnée trouvée');
    }
    
    // 2. Vérifier fond_caisse_operations (nouvelle table)
    console.log('\n2. Table fond_caisse_operations (nouvelle):');
    const [operationsRows] = await connection.execute(
      'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC',
      [clubId]
    );
    
    console.log(`   - Nombre d'opérations: ${operationsRows.length}`);
    operationsRows.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.type_operation} - ${op.montant}€ - ${op.description} (${op.date_operation})`);
    });
    
    // 3. Calculer le solde depuis fond_caisse_operations
    const [totalsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
       FROM fond_caisse_operations 
       WHERE id_club = ?`,
      [clubId]
    );
    
    const totals = totalsRows[0];
    const calculatedSolde = parseFloat(totals.total_credits) - parseFloat(totals.total_debits);
    
    console.log('\n3. Calcul du solde depuis fond_caisse_operations:');
    console.log(`   - Total crédits: ${totals.total_credits}€`);
    console.log(`   - Total débits: ${totals.total_debits}€`);
    console.log(`   - Solde calculé: ${calculatedSolde}€`);
    
    // 4. Vérifier si la colonne solde de fond_caisse doit être mise à jour
    if (fondCaisseRows.length > 0) {
      const currentSolde = parseFloat(fondCaisseRows[0].solde);
      console.log('\n4. Comparaison:');
      console.log(`   - Solde actuel dans fond_caisse: ${currentSolde}€`);
      console.log(`   - Solde calculé depuis fond_caisse_operations: ${calculatedSolde}€`);
      
      if (Math.abs(currentSolde - calculatedSolde) > 0.01) {
        console.log('   ⚠️  PROBLÈME: Les soldes ne correspondent pas !');
        console.log('   💡 Solution: Mettre à jour la colonne solde de fond_caisse');
        
        // Mettre à jour le solde
        await connection.execute(
          'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
          [calculatedSolde, clubId]
        );
        
        console.log(`   ✅ Solde mis à jour: ${calculatedSolde}€`);
      } else {
        console.log('   ✅ Les soldes correspondent');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkTables().catch(console.error);