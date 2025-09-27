import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🔍 Vérification complète de l\'état des tables de caisse');
console.log('=====================================================');

try {
  // Vérifier l'ancienne table fond_caisse
  console.log('\n1. Table fond_caisse (ancienne):');
  const [fondCaisseRows] = await connection.execute(
    'SELECT * FROM fond_caisse WHERE id_club = ?',
    [2]
  );
  
  if (fondCaisseRows.length > 0) {
    const fondCaisse = fondCaisseRows[0];
    console.log(`   - Crédit: ${fondCaisse.credit}€`);
    console.log(`   - Débit: ${fondCaisse.debit}€`);
    console.log(`   - Solde: ${fondCaisse.solde}€`);
  } else {
    console.log('   ❌ Aucune donnée trouvée');
  }

  // Vérifier la nouvelle table fond_caisse_operations
  console.log('\n2. Table fond_caisse_operations (nouvelle):');
  const [operationsRows] = await connection.execute(
    'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC',
    [2]
  );
  
  console.log(`   - Nombre d'opérations: ${operationsRows.length}`);
  
  if (operationsRows.length > 0) {
    console.log('   - Dernières opérations:');
    operationsRows.forEach((op, index) => {
      console.log(`     ${index + 1}. ${op.type} - ${op.montant}€ - ${op.description} (${op.date_operation})`);
    });
  } else {
    console.log('   ❌ Aucune opération trouvée');
  }

  // Vérifier les recettes de caisse
  console.log('\n3. Recettes de caisse (caisse_historique):');
  const [recettesRows] = await connection.execute(
    'SELECT SUM(montant) as total_recettes FROM caisse_historique WHERE club_id = ? AND type = "encaissement"',
    [2]
  );
  
  const totalRecettes = recettesRows[0]?.total_recettes || 0;
  console.log(`   - Total recettes: ${totalRecettes}€`);

  // Vérifier s'il y a des transferts récents dans caisse_historique
  console.log('\n4. Transferts récents dans caisse_historique:');
  const [transfertsRows] = await connection.execute(
    'SELECT * FROM caisse_historique WHERE club_id = ? AND description LIKE "%transfert%" ORDER BY date_operation DESC LIMIT 5',
    [2]
  );
  
  if (transfertsRows.length > 0) {
    console.log('   - Transferts trouvés:');
    transfertsRows.forEach((t, index) => {
      console.log(`     ${index + 1}. ${t.type} - ${t.montant}€ - ${t.description} (${t.date_operation})`);
    });
  } else {
    console.log('   ❌ Aucun transfert trouvé dans caisse_historique');
  }

  console.log('\n✅ Vérification terminée');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}