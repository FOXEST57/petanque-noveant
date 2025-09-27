import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🧪 Test d\'insertion directe dans fond_caisse_operations');
console.log('====================================================\n');

try {
  const clubId = 2;
  const userId = 22; // Notre utilisateur de test
  const banqueId = 2; // Banque du club Noveant
  const montant = 100;
  const description = 'Test insertion directe';
  const typeOperation = 'credit';

  console.log('1. Paramètres d\'insertion:');
  console.log(`   - Club ID: ${clubId}`);
  console.log(`   - User ID: ${userId}`);
  console.log(`   - Banque ID: ${banqueId}`);
  console.log(`   - Montant: ${montant}€`);
  console.log(`   - Type: ${typeOperation}`);
  console.log(`   - Description: ${description}`);

  console.log('\n2. Test d\'insertion...');
  
  try {
    const result = await connection.execute(
      'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, banque_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [clubId, typeOperation, montant, description, banqueId, userId]
    );
    
    console.log('✅ Insertion réussie !');
    console.log(`   - Insert ID: ${result[0].insertId}`);
    console.log(`   - Affected rows: ${result[0].affectedRows}`);
    
    // Vérifier l'insertion
    console.log('\n3. Vérification de l\'insertion...');
    const [rows] = await connection.execute(
      'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC LIMIT 1',
      [clubId]
    );
    
    if (rows.length > 0) {
      const op = rows[0];
      console.log('✅ Opération trouvée:');
      console.log(`   - ID: ${op.id}`);
      console.log(`   - Type: ${op.type_operation}`);
      console.log(`   - Montant: ${op.montant}€`);
      console.log(`   - Description: ${op.description}`);
      console.log(`   - Banque ID: ${op.banque_id}`);
      console.log(`   - User ID: ${op.user_id}`);
      console.log(`   - Date: ${op.date_operation}`);
    } else {
      console.log('❌ Aucune opération trouvée après insertion');
    }
    
  } catch (insertError) {
    console.log('❌ Erreur lors de l\'insertion:');
    console.log(`   - Code: ${insertError.code}`);
    console.log(`   - Message: ${insertError.message}`);
    console.log(`   - SQL State: ${insertError.sqlState}`);
    
    // Vérifier si la table existe
    console.log('\n4. Vérification de l\'existence de la table...');
    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'fond_caisse_operations'"
      );
      
      if (tables.length > 0) {
        console.log('✅ Table fond_caisse_operations existe');
        
        // Vérifier la structure
        console.log('\n5. Structure de la table:');
        const [structure] = await connection.execute('DESCRIBE fond_caisse_operations');
        structure.forEach(col => {
          console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
        });
      } else {
        console.log('❌ Table fond_caisse_operations n\'existe pas');
      }
    } catch (tableError) {
      console.log('❌ Erreur lors de la vérification de la table:', tableError.message);
    }
  }

  console.log('\n✅ Test terminé');

} catch (error) {
  console.error('❌ Erreur générale:', error.message);
} finally {
  await connection.end();
}