import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function testSoldeCaisse() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== TEST DU CALCUL DU SOLDE DE CAISSE ===\n');
    
    // 1. Récupérer le fond de caisse
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = 1'
    );
    
    const club = clubRows;
    const fondCaisse = club.length > 0 ? (club[0].fond_caisse || 0) : 0;
    console.log(`1. Fond de caisse: ${fondCaisse} €`);
    
    // 2. Afficher toutes les opérations dans caisse_historique
    const [allOperations] = await connection.execute(
      `SELECT id, type_operation, designation_principale, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE club_id = 1 
       ORDER BY date_operation DESC`
    );
    
    console.log('\n2. Toutes les opérations dans caisse_historique:');
    allOperations.forEach(op => {
      console.log(`   - ${op.type_operation} (${op.designation_principale}): +${op.montant_encaissement || 0} €, -${op.montant_retrait || 0} € - ${op.description}`);
    });
    
    // 3. Calculer selon la logique actuelle (excluant les crédits)
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = 1 AND type_operation != 'credit'`
    );
    
    const operations = operationsRows;
    const totalEncaissements = operations.length > 0 ? (operations[0].total_encaissements || 0) : 0;
    const totalRetraits = operations.length > 0 ? (operations[0].total_retraits || 0) : 0;
    
    console.log(`\n3. Calcul actuel (excluant les crédits):`);
    console.log(`   - Total encaissements: ${totalEncaissements} €`);
    console.log(`   - Total retraits: ${totalRetraits} €`);
    
    const soldeCaisseActuel = fondCaisse + totalEncaissements - totalRetraits;
    console.log(`   - Solde calculé: ${fondCaisse} + ${totalEncaissements} - ${totalRetraits} = ${soldeCaisseActuel} €`);
    
    // 4. Calculer en incluant TOUTES les opérations
    const [toutesOperationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = 1`
    );
    
    const toutesOperations = toutesOperationsRows;
    const totalEncaissementsComplet = toutesOperations.length > 0 ? (toutesOperations[0].total_encaissements || 0) : 0;
    const totalRetraitsComplet = toutesOperations.length > 0 ? (toutesOperations[0].total_retraits || 0) : 0;
    
    console.log(`\n4. Calcul complet (incluant toutes les opérations):`);
    console.log(`   - Total encaissements: ${totalEncaissementsComplet} €`);
    console.log(`   - Total retraits: ${totalRetraitsComplet} €`);
    
    const soldeCaisseComplet = fondCaisse + totalEncaissementsComplet - totalRetraitsComplet;
    console.log(`   - Solde calculé: ${fondCaisse} + ${totalEncaissementsComplet} - ${totalRetraitsComplet} = ${soldeCaisseComplet} €`);
    
    // 5. Vérifier les crédits membres dans membre_comptes_historique
    const [creditsMembers] = await connection.execute(
      `SELECT COUNT(*) as nb_credits, SUM(montant) as total_credits
       FROM membre_comptes_historique 
       WHERE club_id = 1 AND type_operation = 'credit'`
    );
    
    const credits = creditsMembers;
    const nbCredits = credits.length > 0 ? (credits[0].nb_credits || 0) : 0;
    const totalCredits = credits.length > 0 ? (credits[0].total_credits || 0) : 0;
    
    console.log(`\n5. Crédits membres dans membre_comptes_historique:`);
    console.log(`   - Nombre de crédits: ${nbCredits}`);
    console.log(`   - Total des crédits: ${totalCredits} €`);
    
    // 6. Analyser les opérations d'ajout d'espèces
    const [ajoutsEspeces] = await connection.execute(
      `SELECT COUNT(*) as nb_ajouts, SUM(montant_encaissement) as total_ajouts
       FROM caisse_historique 
       WHERE club_id = 1 AND type_operation = 'ajout_especes'`
    );
    
    const ajouts = ajoutsEspeces;
    const nbAjouts = ajouts.length > 0 ? (ajouts[0].nb_ajouts || 0) : 0;
    const totalAjouts = ajouts.length > 0 ? (ajouts[0].total_ajouts || 0) : 0;
    
    console.log(`\n6. Ajouts d'espèces dans caisse_historique:`);
    console.log(`   - Nombre d'ajouts: ${nbAjouts}`);
    console.log(`   - Total des ajouts: ${totalAjouts} €`);
    
    console.log('\n=== CONCLUSION ===');
    if (totalCredits === totalAjouts) {
      console.log('✅ Les crédits membres correspondent aux ajouts d\'espèces');
      console.log('✅ Le problème vient probablement de l\'affichage ou du rafraîchissement');
    } else {
      console.log('❌ Incohérence entre les crédits membres et les ajouts d\'espèces');
    }
    
  } finally {
    await connection.end();
  }
}

testSoldeCaisse().catch(console.error);