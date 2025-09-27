import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🔍 Debug du problème de transfert bancaire');
console.log('==========================================\n');

try {
  const clubId = 2;

  // 1. Vérifier l'état de la table fond_caisse
  console.log('1. État de la table fond_caisse:');
  const [fondCaisseRows] = await connection.execute(
    'SELECT * FROM fond_caisse WHERE id_club = ?',
    [clubId]
  );
  
  if (fondCaisseRows.length > 0) {
    console.log('   ✅ Entrée trouvée dans fond_caisse:');
    fondCaisseRows.forEach(row => {
      console.log(`      ID: ${row.id}, Club: ${row.id_club}`);
      console.log(`      Crédit: ${row.credit}€, Débit: ${row.debit}€, Solde: ${row.solde}€`);
      console.log(`      Créé: ${row.date_creation}, Modifié: ${row.date_modification}`);
    });
  } else {
    console.log('   ❌ Aucune entrée dans fond_caisse pour le club 2');
  }

  // 2. Vérifier l'état de la table fond_caisse_operations
  console.log('\n2. État de la table fond_caisse_operations:');
  const [operationsRows] = await connection.execute(
    'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC',
    [clubId]
  );
  
  console.log(`   - Nombre d'opérations: ${operationsRows.length}`);
  if (operationsRows.length > 0) {
    operationsRows.forEach((op, index) => {
      console.log(`   ${index + 1}. [${op.date_operation}] ${op.type_operation}`);
      console.log(`      Montant: ${op.montant}€`);
      console.log(`      Description: ${op.description}`);
      console.log(`      Banque ID: ${op.banque_id}, User ID: ${op.user_id}`);
      console.log('');
    });
  }

  // 3. Vérifier les transactions récentes dans toutes les tables
  console.log('3. Transactions récentes (dernières 10 minutes):');
  const dateRecente = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
  
  // Vérifier fond_caisse_operations
  const [recentOps] = await connection.execute(
    'SELECT * FROM fond_caisse_operations WHERE id_club = ? AND date_operation >= ? ORDER BY date_operation DESC',
    [clubId, dateRecente]
  );
  
  console.log(`   - Opérations récentes dans fond_caisse_operations: ${recentOps.length}`);
  recentOps.forEach((op, index) => {
    console.log(`     ${index + 1}. ${op.type_operation} - ${op.montant}€ - ${op.description}`);
  });

  // Vérifier caisse_historique
  const [recentHist] = await connection.execute(
    'SELECT * FROM caisse_historique WHERE club_id = ? AND date_operation >= ? ORDER BY date_operation DESC',
    [clubId, dateRecente]
  );
  
  console.log(`   - Opérations récentes dans caisse_historique: ${recentHist.length}`);
  recentHist.forEach((op, index) => {
    console.log(`     ${index + 1}. ${op.type_operation} - Encaissement: ${op.montant_encaissement}€, Retrait: ${op.montant_retrait}€`);
  });

  // 4. Vérifier la structure des tables
  console.log('\n4. Structure de la table fond_caisse_operations:');
  const [structure] = await connection.execute('DESCRIBE fond_caisse_operations');
  structure.forEach(col => {
    console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
  });

  console.log('\n✅ Debug terminé');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}