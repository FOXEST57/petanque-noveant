import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testCaisseCorrections() {
  let connection;
  
  try {
    console.log('🔗 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion établie');

    // Test 1: Vérifier que la table membre_comptes_historique existe
    console.log('\n📋 Test 1: Vérification de la table membre_comptes_historique');
    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'membre_comptes_historique'"
      );
      if (tables.length > 0) {
        console.log('✅ Table membre_comptes_historique existe');
        
        // Vérifier la structure
        const [columns] = await connection.execute(
          "DESCRIBE membre_comptes_historique"
        );
        console.log('📊 Structure de la table:');
        columns.forEach(col => {
          console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('❌ Table membre_comptes_historique n\'existe pas');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification de la table:', error.message);
    }

    // Test 2: Vérifier que la vue vue_soldes_membres existe
    console.log('\n📋 Test 2: Vérification de la vue vue_soldes_membres');
    try {
      const [views] = await connection.execute(
        "SHOW TABLES LIKE 'vue_soldes_membres'"
      );
      if (views.length > 0) {
        console.log('✅ Vue vue_soldes_membres existe');
        
        // Tester la vue
        const [soldes] = await connection.execute(
          "SELECT * FROM vue_soldes_membres LIMIT 5"
        );
        console.log(`📊 ${soldes.length} soldes trouvés dans la vue`);
      } else {
        console.log('❌ Vue vue_soldes_membres n\'existe pas');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification de la vue:', error.message);
    }

    // Test 3: Vérifier que la colonne designation_principale existe dans caisse_historique
    console.log('\n📋 Test 3: Vérification de la colonne designation_principale');
    try {
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM caisse_historique LIKE 'designation_principale'"
      );
      if (columns.length > 0) {
        console.log('✅ Colonne designation_principale existe');
        
        // Vérifier les valeurs
        const [designations] = await connection.execute(`
          SELECT designation_principale, COUNT(*) as count 
          FROM caisse_historique 
          WHERE designation_principale IS NOT NULL 
          GROUP BY designation_principale
        `);
        console.log('📊 Répartition des désignations principales:');
        designations.forEach(d => {
          console.log(`   - ${d.designation_principale}: ${d.count}`);
        });
      } else {
        console.log('❌ Colonne designation_principale n\'existe pas');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification de la colonne:', error.message);
    }

    // Test 4: Vérifier la structure de caisse_historique (montant_encaissement/montant_retrait)
    console.log('\n📋 Test 4: Vérification de la structure de caisse_historique');
    try {
      const [columns] = await connection.execute("DESCRIBE caisse_historique");
      const hasEncaissement = columns.some(col => col.Field === 'montant_encaissement');
      const hasRetrait = columns.some(col => col.Field === 'montant_retrait');
      const hasMontant = columns.some(col => col.Field === 'montant');
      
      console.log(`✅ montant_encaissement: ${hasEncaissement ? 'Existe' : 'N\'existe pas'}`);
      console.log(`✅ montant_retrait: ${hasRetrait ? 'Existe' : 'N\'existe pas'}`);
      console.log(`${hasMontant ? '⚠️' : '✅'} montant: ${hasMontant ? 'Existe encore (à supprimer)' : 'Supprimé'}`);
    } catch (error) {
      console.log('❌ Erreur lors de la vérification de la structure:', error.message);
    }

    // Test 5: Vérifier qu'il n'y a plus d'opérations 'credit' dans caisse_historique
    console.log('\n📋 Test 5: Vérification des opérations de crédit');
    try {
      const [credits] = await connection.execute(
        "SELECT COUNT(*) as count FROM caisse_historique WHERE type_operation = 'credit'"
      );
      if (credits[0].count === 0) {
        console.log('✅ Aucune opération de crédit dans caisse_historique');
      } else {
        console.log(`⚠️ ${credits[0].count} opérations de crédit encore présentes dans caisse_historique`);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des crédits:', error.message);
    }

    // Test 6: Vérifier les données dans membre_comptes_historique
    console.log('\n📋 Test 6: Vérification des données dans membre_comptes_historique');
    try {
      const [comptes] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT membre_id) as membres_distincts,
          SUM(CASE WHEN type_operation = 'credit' THEN 1 ELSE 0 END) as credits,
          SUM(CASE WHEN type_operation LIKE 'transfert%' THEN 1 ELSE 0 END) as transferts
        FROM membre_comptes_historique
      `);
      
      if (comptes[0].total > 0) {
        console.log(`✅ ${comptes[0].total} enregistrements dans membre_comptes_historique`);
        console.log(`   - ${comptes[0].membres_distincts} membres distincts`);
        console.log(`   - ${comptes[0].credits} crédits`);
        console.log(`   - ${comptes[0].transferts} transferts`);
      } else {
        console.log('ℹ️ Aucun enregistrement dans membre_comptes_historique (normal si pas d\'opérations encore)');
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des données:', error.message);
    }

    console.log('\n🎉 Tests terminés');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

testCaisseCorrections();