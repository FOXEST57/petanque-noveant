import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function checkUsers() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== VÉRIFICATION DES UTILISATEURS ===\n');
    
    // 1. Vérifier la structure de la table users
    console.log('1. Structure de la table users:');
    const [columns] = await connection.execute('DESCRIBE users');
    console.table(columns);
    
    // 2. Lister tous les utilisateurs
    console.log('\n2. Tous les utilisateurs:');
    const [users] = await connection.execute('SELECT * FROM users');
    console.table(users);
    
    // 3. Vérifier s'il y a des utilisateurs avec différents rôles
    console.log('\n3. Répartition par rôle:');
    const [roles] = await connection.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    console.table(roles);
    
    await connection.end();
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkUsers();