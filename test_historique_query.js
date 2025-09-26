import mysql from 'mysql2/promise';

async function testHistoriqueQuery() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('Connexion à la base de données établie');
    
    // Test 1: Vérifier les tables existantes
    console.log('\n=== Tables existantes ===');
    const [tables] = await connection.execute("SHOW TABLES");
    console.table(tables);
    
    // Test 2: Vérifier la structure de caisse_historique
    console.log('\n=== Structure caisse_historique ===');
    const [structure] = await connection.execute('DESCRIBE caisse_historique');
    console.table(structure);
    
    // Test 3: Vérifier s'il y a des données dans caisse_historique
    console.log('\n=== Données dans caisse_historique ===');
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM caisse_historique');
    console.log('Nombre d\'enregistrements:', count[0].total);
    
    // Test 4: Tester la requête problématique avec un club_id de test
    console.log('\n=== Test de la requête historique ===');
    try {
      const clubId = 1; // ID de test
      const limit = 10;
      const offset = 0;
      
      const [rows] = await connection.execute(
        `SELECT 
          ch.*,
          u.nom as user_nom, u.prenom as user_prenom,
          m.nom as membre_nom, m.prenom as membre_prenom
         FROM caisse_historique ch
         LEFT JOIN members u ON ch.user_id = u.id
         LEFT JOIN members m ON ch.membre_id = m.id
         WHERE ch.club_id = ?
         ORDER BY ch.date_operation DESC
         LIMIT ? OFFSET ?`,
        [clubId, limit, offset]
      );
      
      console.log('Requête exécutée avec succès');
      console.log('Nombre de résultats:', rows.length);
      if (rows.length > 0) {
        console.log('Premier résultat:', rows[0]);
      }
      
    } catch (queryError) {
      console.error('Erreur dans la requête:', queryError.message);
      console.error('Code d\'erreur:', queryError.code);
    }
    
    await connection.end();
    console.log('\nTest terminé');
    
  } catch (error) {
    console.error('Erreur générale:', error.message);
    console.error('Code d\'erreur:', error.code);
    process.exit(1);
  }
}

testHistoriqueQuery();