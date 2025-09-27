import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🔍 Debug de la logique de l\'endpoint');
console.log('====================================\n');

try {
  const clubId = 2;
  const banqueId = 2;
  const montant = 150;
  const type = 'banque-vers-caisse';

  console.log('1. Paramètres du test:');
  console.log(`   - Club ID: ${clubId}`);
  console.log(`   - Banque ID: ${banqueId}`);
  console.log(`   - Montant: ${montant}€`);
  console.log(`   - Type: ${type}`);

  // Simuler la logique de l'endpoint
  console.log('\n2. Simulation de la logique de l\'endpoint...');

  // Vérifier la banque
  const [banqueRows] = await connection.execute(
    'SELECT nom FROM banque WHERE id = ? AND club_id = ?',
    [banqueId, clubId]
  );

  if (banqueRows.length === 0) {
    console.log('❌ Banque non trouvée');
    process.exit(1);
  }

  const nomBanque = banqueRows[0].nom;
  console.log(`   ✅ Banque trouvée: ${nomBanque}`);

  // Récupérer le fond de caisse actuel
  const [fondCaisseRows] = await connection.execute(
    'SELECT solde FROM fond_caisse WHERE id_club = ?',
    [clubId]
  );

  const fondActuel = fondCaisseRows.length > 0 ? (fondCaisseRows[0].solde || 0) : 0;
  console.log(`   - Fond actuel: ${fondActuel}€`);

  let nouveauFondCaisse;
  let description;
  let typeOperation;

  if (type === 'banque-vers-caisse') {
    nouveauFondCaisse = fondActuel + montant;
    description = `Transfert depuis ${nomBanque}`;
    typeOperation = 'credit';
  }

  console.log(`   - Nouveau fond calculé: ${nouveauFondCaisse}€`);
  console.log(`   - Description: ${description}`);
  console.log(`   - Type opération: ${typeOperation}`);

  // Test d'insertion
  console.log('\n3. Test d\'insertion dans fond_caisse_operations...');
  
  await connection.beginTransaction();
  
  try {
    const result = await connection.execute(
      'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, banque_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [clubId, typeOperation, montant, description, banqueId, 22] // user_id = 22
    );
    
    console.log('✅ Insertion réussie !');
    console.log(`   - Insert ID: ${result[0].insertId}`);

    // Recalculer comme dans l'endpoint
    console.log('\n4. Recalcul du solde comme dans l\'endpoint...');
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

    console.log(`   - Total crédits: ${totalCredits}€`);
    console.log(`   - Total débits: ${totalDebits}€`);

    // Le nouveau solde du fond = total crédits - total débits
    const nouveauFondRecalcule = totalCredits - totalDebits;
    console.log(`   - Nouveau fond recalculé: ${nouveauFondRecalcule}€`);

    // Mettre à jour le solde
    await connection.execute(
      'UPDATE fond_caisse SET solde = ?, date_modification = NOW() WHERE id_club = ?',
      [nouveauFondRecalcule, clubId]
    );

    console.log('✅ Mise à jour du solde réussie');

    await connection.commit();

    // Vérifier le résultat final
    console.log('\n5. Vérification finale...');
    const [finalOps] = await connection.execute(
      'SELECT COUNT(*) as count FROM fond_caisse_operations WHERE id_club = ?',
      [clubId]
    );

    const [finalFond] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );

    console.log(`   - Nombre d'opérations: ${finalOps[0].count}`);
    console.log(`   - Solde final: ${finalFond[0].solde}€`);

  } catch (error) {
    await connection.rollback();
    console.log('❌ Erreur lors de l\'insertion:', error.message);
  }

  console.log('\n✅ Debug terminé');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}