import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🏦 Vérification des banques dans la base de données');
console.log('==================================================\n');

try {
  // Vérifier les banques du club 2 (noveant)
  console.log('1. Banques du club Noveant (id=2):');
  const [banquesRows] = await connection.execute(
    'SELECT id, nom, iban, created_at FROM banque WHERE club_id = ?',
    [2]
  );
  
  if (banquesRows.length > 0) {
    console.log(`   - Nombre de banques: ${banquesRows.length}`);
    banquesRows.forEach((banque, index) => {
      console.log(`   ${index + 1}. ID: ${banque.id} - ${banque.nom}`);
      console.log(`      IBAN: ${banque.iban || 'Non défini'}`);
      console.log(`      Créée le: ${banque.created_at}`);
      console.log('');
    });
  } else {
    console.log('   ❌ Aucune banque trouvée pour le club 2');
  }

  // Vérifier toutes les banques
  console.log('2. Toutes les banques:');
  const [allBanquesRows] = await connection.execute(
    'SELECT id, club_id, nom, iban FROM banque ORDER BY club_id, id'
  );
  
  if (allBanquesRows.length > 0) {
    console.log(`   - Nombre total de banques: ${allBanquesRows.length}`);
    allBanquesRows.forEach((banque, index) => {
      console.log(`   ${index + 1}. Club ${banque.club_id} - ID: ${banque.id} - ${banque.nom}`);
    });
  } else {
    console.log('   ❌ Aucune banque trouvée dans la base');
  }

  console.log('\n✅ Vérification terminée');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}