import mysql from 'mysql2/promise';

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('=== Clubs disponibles ===');
    const [clubs] = await connection.execute('SELECT id, name FROM clubs ORDER BY id');
    console.table(clubs);
    
    console.log('\n=== Paramètres du site par club ===');
    const [settings] = await connection.execute(`
      SELECT club_id, setting_key, setting_value 
      FROM site_settings 
      WHERE setting_key IN ('club_name', 'site_name', 'primary_color') 
      ORDER BY club_id, setting_key
    `);
    console.table(settings);
    
    console.log('\n=== Utilisateurs super admin ===');
    const [users] = await connection.execute(`
      SELECT id, email, role, club_id 
      FROM users 
      WHERE role = 'super_admin'
    `);
    console.table(users);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkDatabase();