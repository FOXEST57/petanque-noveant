import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🔧 Correction de la table fond_caisse');
console.log('====================================\n');

try {
  const clubId = 2;

  // 1. Vérifier l'état actuel
  console.log('1. Vérification de l\'état actuel...');
  const [existingRows] = await connection.execute(
    'SELECT * FROM fond_caisse WHERE id_club = ?',
    [clubId]
  );

  if (existingRows.length > 0) {
    console.log('✅ Entrée existante dans fond_caisse:');
    console.log(`   - Solde: ${existingRows[0].solde}€`);
    console.log(`   - Créé: ${existingRows[0].date_creation}`);
    console.log(`   - Modifié: ${existingRows[0].date_modification}`);
  } else {
    console.log('❌ Aucune entrée dans fond_caisse pour le club 2');
    
    // 2. Créer l'entrée manquante
    console.log('\n2. Création de l\'entrée fond_caisse...');
    await connection.execute(
      'INSERT INTO fond_caisse (id_club, solde, date_creation, date_modification) VALUES (?, ?, NOW(), NOW())',
      [clubId, 0]
    );
    console.log('✅ Entrée créée avec un solde initial de 0€');
  }

  // 3. Vérifier la structure de la table
  console.log('\n3. Structure de la table fond_caisse:');
  const [structure] = await connection.execute('DESCRIBE fond_caisse');
  structure.forEach(col => {
    console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
  });

  // 4. Calculer le solde correct basé sur les opérations existantes
  console.log('\n4. Calcul du solde correct...');
  const [operationsRows] = await connection.execute(
    `SELECT 
      COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
      COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
     FROM fond_caisse_operations 
     WHERE id_club = ?`,
    [clubId]
  );

  const operations = operationsRows;
  const totalCredits = operations.length > 0 ? parseFloat(operations[0].total_credits) : 0;
  const totalDebits = operations.length > 0 ? parseFloat(operations[0].total_debits) : 0;
  const soldeCalcule = totalCredits - totalDebits;

  console.log(`   - Total crédits: ${totalCredits}€`);
  console.log(`   - Total débits: ${totalDebits}€`);
  console.log(`   - Solde calculé: ${soldeCalcule}€`);

  // 5. Mettre à jour le solde si nécessaire
  if (soldeCalcule !== 0) {
    console.log('\n5. Mise à jour du solde...');
    await connection.execute(
      'UPDATE fond_caisse SET solde = ?, date_modification = NOW() WHERE id_club = ?',
      [soldeCalcule, clubId]
    );
    console.log(`✅ Solde mis à jour à ${soldeCalcule}€`);
  }

  console.log('\n✅ Correction terminée avec succès !');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}