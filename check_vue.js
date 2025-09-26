import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant'
});

try {
  console.log('=== Vérification de la vue vue_soldes_membres ===');
  
  // Vérifier si la vue existe
  const [views] = await connection.execute("SHOW TABLES LIKE 'vue_soldes_membres'");
  console.log('Vue existe:', views.length > 0);
  
  if (views.length > 0) {
    // Décrire la structure
    const [structure] = await connection.execute('DESCRIBE vue_soldes_membres');
    console.log('\nStructure de la vue:');
    console.table(structure);
    
    // Tester une requête simple
    const [sample] = await connection.execute('SELECT * FROM vue_soldes_membres LIMIT 1');
    console.log('\nÉchantillon de données:');
    console.table(sample);
  } else {
    console.log('La vue vue_soldes_membres n\'existe pas');
    
    // Vérifier les tables disponibles
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nTables disponibles:');
    tables.forEach(table => console.log('-', Object.values(table)[0]));
  }
  
} catch (error) {
  console.log('Erreur:', error.message);
} finally {
  await connection.end();
}