import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function checkUserAdmin2() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier les données de l'utilisateur admin2@test.com
    const [users] = await connection.execute(
      'SELECT id, email, club_id, role FROM users WHERE email = ?',
      ['admin2@test.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Utilisateur admin2@test.com non trouvé');
    } else {
      console.log('✅ Utilisateur admin2@test.com:', users[0]);
    }
    
    // Vérifier aussi tous les utilisateurs avec role president ou vice_president
    const [admins] = await connection.execute(
      'SELECT id, email, club_id, role FROM users WHERE role IN ("president", "vice_president")'
    );
    
    console.log('\n📋 Tous les administrateurs:');
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}, Email: ${admin.email}, Club: ${admin.club_id}, Role: ${admin.role}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkUserAdmin2();