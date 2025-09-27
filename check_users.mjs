import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('🔍 Vérification des utilisateurs dans la base de données');
console.log('======================================================\n');

try {
  // Vérifier les utilisateurs du club 2 (noveant)
  console.log('1. Utilisateurs du club Noveant (id=2):');
  const [usersRows] = await connection.execute(
    'SELECT id, nom, prenom, email, role, statut FROM users WHERE club_id = ?',
    [2]
  );
  
  if (usersRows.length > 0) {
    console.log(`   - Nombre d'utilisateurs: ${usersRows.length}`);
    usersRows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nom} ${user.prenom} (${user.email}) - ${user.role} - ${user.statut}`);
    });
  } else {
    console.log('   ❌ Aucun utilisateur trouvé pour le club 2');
  }

  // Vérifier tous les utilisateurs
  console.log('\n2. Tous les utilisateurs:');
  const [allUsersRows] = await connection.execute(
    'SELECT id, club_id, nom, prenom, email, role, statut FROM users ORDER BY club_id, id'
  );
  
  if (allUsersRows.length > 0) {
    console.log(`   - Nombre total d'utilisateurs: ${allUsersRows.length}`);
    allUsersRows.forEach((user, index) => {
      console.log(`   ${index + 1}. Club ${user.club_id} - ${user.nom} ${user.prenom} (${user.email}) - ${user.role} - ${user.statut}`);
    });
  } else {
    console.log('   ❌ Aucun utilisateur trouvé dans la base');
  }

  // Vérifier les clubs
  console.log('\n3. Clubs disponibles:');
  const [clubsRows] = await connection.execute(
    'SELECT id, nom, subdomain FROM clubs ORDER BY id'
  );
  
  if (clubsRows.length > 0) {
    clubsRows.forEach((club, index) => {
      console.log(`   ${index + 1}. Club ${club.id} - ${club.nom} (${club.subdomain})`);
    });
  } else {
    console.log('   ❌ Aucun club trouvé');
  }

  console.log('\n✅ Vérification terminée');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}