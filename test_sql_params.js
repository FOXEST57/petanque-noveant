import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant'
});

try {
  console.log('=== Test des paramètres SQL ===');
  
  const clubId = 2;
  const limit = 5;
  const offset = 0;
  
  console.log('Paramètres:', { clubId, limit, offset });
  console.log('Types:', { 
    clubId: typeof clubId, 
    limit: typeof limit, 
    offset: typeof offset 
  });
  
  // Test 1: Requête simple sans LIMIT/OFFSET
  console.log('\n--- Test 1: Sans LIMIT/OFFSET ---');
  try {
    const [rows1] = await connection.execute(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ?
      ORDER BY nom, prenom
    `, [clubId]);
    console.log('✅ Succès - Nombre de résultats:', rows1.length);
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  // Test 2: Avec LIMIT seulement
  console.log('\n--- Test 2: Avec LIMIT seulement ---');
  try {
    const [rows2] = await connection.execute(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ?
      ORDER BY nom, prenom
      LIMIT ?
    `, [clubId, limit]);
    console.log('✅ Succès - Nombre de résultats:', rows2.length);
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  // Test 3: Avec LIMIT et OFFSET
  console.log('\n--- Test 3: Avec LIMIT et OFFSET ---');
  try {
    const [rows3] = await connection.execute(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = ?
      ORDER BY nom, prenom
      LIMIT ? OFFSET ?
    `, [clubId, limit, offset]);
    console.log('✅ Succès - Nombre de résultats:', rows3.length);
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  // Test 4: Test de l'historique
  console.log('\n--- Test 4: Historique ---');
  try {
    const membreId = 39;
    const [rows4] = await connection.execute(`
      SELECT 
        cc.id,
        cc.debit,
        cc.credit,
        cc.solde,
        cc.type_operation,
        cc.description,
        cc.reference,
        cc.created_at,
        u.nom as created_by_nom,
        u.prenom as created_by_prenom
      FROM comptes_clients cc
      LEFT JOIN users u ON cc.created_by = u.id
      WHERE cc.membre_id = ? AND cc.club_id = ?
      ORDER BY cc.created_at DESC
      LIMIT ? OFFSET ?
    `, [membreId, clubId, limit, offset]);
    console.log('✅ Succès - Nombre de résultats:', rows4.length);
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
} catch (error) {
  console.log('Erreur générale:', error.message);
} finally {
  await connection.end();
}