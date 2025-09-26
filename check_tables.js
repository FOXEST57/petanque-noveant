import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function checkTables() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== VÉRIFICATION DES TABLES ===\n');
    
    // Lister toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables existantes:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Vérifier spécifiquement la table members
    console.log('\n=== VÉRIFICATION DE LA TABLE MEMBERS ===');
    try {
      const [memberColumns] = await connection.execute('DESCRIBE members');
      console.log('Structure de la table members:');
      memberColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // Compter les membres
      const [memberCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
      console.log(`\nNombre de membres: ${memberCount[0].count}`);
      
    } catch (error) {
      console.log('❌ La table members n\'existe pas ou n\'est pas accessible');
      console.log('Erreur:', error.message);
    }
    
    // Vérifier la table clubs
    console.log('\n=== VÉRIFICATION DE LA TABLE CLUBS ===');
    try {
      const [clubColumns] = await connection.execute('DESCRIBE clubs');
      console.log('Structure de la table clubs:');
      clubColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // Compter les clubs
      const [clubCount] = await connection.execute('SELECT COUNT(*) as count FROM clubs');
      console.log(`\nNombre de clubs: ${clubCount[0].count}`);
      
    } catch (error) {
      console.log('❌ La table clubs n\'existe pas ou n\'est pas accessible');
      console.log('Erreur:', error.message);
    }
    
    // Vérifier la table users
    console.log('\n=== VÉRIFICATION DE LA TABLE USERS ===');
    try {
      const [userColumns] = await connection.execute('DESCRIBE users');
      console.log('Structure de la table users:');
      userColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
      });
      
      // Compter les utilisateurs
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`\nNombre d'utilisateurs: ${userCount[0].count}`);
      
    } catch (error) {
      console.log('❌ La table users n\'existe pas ou n\'est pas accessible');
      console.log('Erreur:', error.message);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkTables();