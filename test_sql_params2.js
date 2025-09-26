import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant'
});

try {
  console.log('=== Test des paramètres SQL avec différents types ===');
  
  const clubId = 2;
  const limit = 5;
  const offset = 0;
  
  // Test avec des chaînes
  console.log('\n--- Test avec des chaînes ---');
  try {
    const [rows] = await connection.execute(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ?
      ORDER BY nom, prenom
      LIMIT ? OFFSET ?
    `, [clubId.toString(), limit.toString(), offset.toString()]);
    console.log('✅ Succès avec chaînes - Nombre de résultats:', rows.length);
  } catch (error) {
    console.log('❌ Erreur avec chaînes:', error.message);
  }
  
  // Test avec query() au lieu d'execute()
  console.log('\n--- Test avec query() ---');
  try {
    const [rows] = await connection.query(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ?
      ORDER BY nom, prenom
      LIMIT ? OFFSET ?
    `, [clubId, limit, offset]);
    console.log('✅ Succès avec query() - Nombre de résultats:', rows.length);
  } catch (error) {
    console.log('❌ Erreur avec query():', error.message);
  }
  
  // Test avec une requête construite manuellement
  console.log('\n--- Test avec requête construite ---');
  try {
    const sql = `
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ${clubId}
      ORDER BY nom, prenom
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [rows] = await connection.execute(sql);
    console.log('✅ Succès avec requête construite - Nombre de résultats:', rows.length);
  } catch (error) {
    console.log('❌ Erreur avec requête construite:', error.message);
  }
  
} catch (error) {
  console.log('Erreur générale:', error.message);
} finally {
  await connection.end();
}