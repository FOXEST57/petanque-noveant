import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function verifierEtatCaisse() {
  console.log('🔍 Vérification de l\'état actuel de la caisse');
  console.log('==============================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const clubId = 2; // Club Noveant
    
    // 1. Vérifier le fond de caisse depuis fond_caisse_operations
    console.log('1. 💰 Fond de caisse (depuis fond_caisse_operations):');
    const [operationsFondRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
       FROM fond_caisse_operations 
       WHERE id_club = ?`,
      [clubId]
    );
    
    const operationsFond = operationsFondRows;
    const totalCredits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_credits) : 0;
    const totalDebits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_debits) : 0;
    const fondCaisse = totalCredits - totalDebits;
    
    console.log(`   - Total crédits: ${totalCredits}€`);
    console.log(`   - Total débits: ${totalDebits}€`);
    console.log(`   - Solde fond de caisse: ${fondCaisse}€\n`);
    
    // 2. Vérifier les recettes depuis caisse_historique
    console.log('2. 📊 Recettes (depuis caisse_historique):');
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const operations = operationsRows;
    const totalEncaissements = operations.length > 0 ? parseFloat(operations[0].total_encaissements) : 0;
    const totalRetraits = operations.length > 0 ? parseFloat(operations[0].total_retraits) : 0;
    const recettes = totalEncaissements - totalRetraits;
    
    console.log(`   - Total encaissements: ${totalEncaissements}€`);
    console.log(`   - Total retraits: ${totalRetraits}€`);
    console.log(`   - Recettes disponibles: ${recettes}€\n`);
    
    // 3. Calcul du solde total
    const soldeCaisse = fondCaisse + recettes;
    console.log('3. 💵 Résumé:');
    console.log(`   - Fond de caisse: ${fondCaisse}€`);
    console.log(`   - Recettes disponibles: ${recettes}€`);
    console.log(`   - Solde total de la caisse: ${soldeCaisse}€\n`);
    
    // 4. Dernières opérations de chaque type
    console.log('4. 📋 Dernières opérations:');
    
    // Dernières opérations fond_caisse_operations
    const [lastFondOps] = await connection.execute(
      `SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC LIMIT 3`,
      [clubId]
    );
    
    console.log('   Fond de caisse (fond_caisse_operations):');
    if (lastFondOps.length > 0) {
      lastFondOps.forEach((op, index) => {
        console.log(`     ${index + 1}. ${op.date_operation} - ${op.type_operation} ${op.montant}€ - ${op.description}`);
      });
    } else {
      console.log('     Aucune opération trouvée');
    }
    
    // Dernières opérations caisse_historique
    const [lastCaisseOps] = await connection.execute(
      `SELECT * FROM caisse_historique WHERE club_id = ? ORDER BY date_operation DESC LIMIT 3`,
      [clubId]
    );
    
    console.log('\n   Recettes (caisse_historique):');
    if (lastCaisseOps.length > 0) {
      lastCaisseOps.forEach((op, index) => {
        const montant = op.montant_encaissement || op.montant_retrait;
        const type = op.montant_encaissement ? 'encaissement' : 'retrait';
        console.log(`     ${index + 1}. ${op.date_operation} - ${type} ${montant}€ - ${op.description}`);
      });
    } else {
      console.log('     Aucune opération trouvée');
    }
    
    console.log('\n✅ Vérification terminée !');
    
    // 5. Simulation de la logique de transfert
    console.log('\n5. 🧪 Simulation transfert de 100€:');
    const montantTest = 100;
    
    if (soldeCaisse < montantTest) {
      console.log(`   ❌ Fonds insuffisants (${soldeCaisse}€ < ${montantTest}€)`);
    } else if (recettes >= montantTest) {
      console.log(`   ✅ Transfert entièrement sur recettes (${recettes}€ >= ${montantTest}€)`);
      console.log(`   → Fond de caisse inchangé: ${fondCaisse}€`);
      console.log(`   → Recettes après: ${recettes - montantTest}€`);
    } else {
      const montantSurFond = montantTest - recettes;
      console.log(`   ✅ Transfert mixte:`);
      console.log(`   → ${recettes}€ sur recettes`);
      console.log(`   → ${montantSurFond}€ sur fond de caisse`);
      console.log(`   → Fond de caisse après: ${fondCaisse - montantSurFond}€`);
      console.log(`   → Recettes après: 0€`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await connection.end();
  }
}

verifierEtatCaisse().catch(console.error);