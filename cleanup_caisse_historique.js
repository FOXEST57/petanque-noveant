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

async function cleanupCaisseHistorique() {
  let connection;
  
  try {
    console.log('🔗 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion établie');

    // Étape 1: Supprimer les opérations de crédit de caisse_historique
    console.log('\n🧹 Étape 1: Suppression des opérations de crédit dans caisse_historique');
    
    // D'abord, vérifier combien d'opérations de crédit existent
    const [creditCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM caisse_historique WHERE type_operation = 'credit'"
    );
    console.log(`📊 ${creditCount[0].count} opérations de crédit trouvées`);
    
    if (creditCount[0].count > 0) {
      // Afficher les opérations qui vont être supprimées
      const [creditOps] = await connection.execute(`
        SELECT id, date_operation, montant, description, membre_id 
        FROM caisse_historique 
        WHERE type_operation = 'credit'
        ORDER BY date_operation
      `);
      
      console.log('📋 Opérations de crédit à supprimer:');
      creditOps.forEach(op => {
        console.log(`   - ID ${op.id}: ${op.montant}€ pour membre ${op.membre_id} le ${op.date_operation}`);
      });
      
      // Supprimer les opérations de crédit
      const [deleteResult] = await connection.execute(
        "DELETE FROM caisse_historique WHERE type_operation = 'credit'"
      );
      console.log(`✅ ${deleteResult.affectedRows} opérations de crédit supprimées`);
    } else {
      console.log('✅ Aucune opération de crédit à supprimer');
    }

    // Étape 2: Supprimer l'ancienne colonne montant
    console.log('\n🧹 Étape 2: Suppression de l\'ancienne colonne montant');
    
    // Vérifier si la colonne existe
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM caisse_historique LIKE 'montant'"
    );
    
    if (columns.length > 0) {
      console.log('📊 Colonne montant trouvée, suppression en cours...');
      
      // Supprimer la colonne
      await connection.execute(
        "ALTER TABLE caisse_historique DROP COLUMN montant"
      );
      console.log('✅ Colonne montant supprimée');
    } else {
      console.log('✅ Colonne montant déjà supprimée');
    }

    // Étape 3: Vérification finale
    console.log('\n🔍 Étape 3: Vérification finale');
    
    // Vérifier qu'il n'y a plus d'opérations de crédit
    const [finalCreditCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM caisse_historique WHERE type_operation = 'credit'"
    );
    console.log(`📊 Opérations de crédit restantes: ${finalCreditCount[0].count}`);
    
    // Vérifier que la colonne montant n'existe plus
    const [finalColumns] = await connection.execute(
      "SHOW COLUMNS FROM caisse_historique LIKE 'montant'"
    );
    console.log(`📊 Colonne montant: ${finalColumns.length === 0 ? 'Supprimée' : 'Existe encore'}`);
    
    // Afficher la structure finale
    console.log('\n📋 Structure finale de caisse_historique:');
    const [finalStructure] = await connection.execute("DESCRIBE caisse_historique");
    finalStructure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Afficher les statistiques finales
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN type_operation = 'ajout_especes' THEN 1 END) as ajout_especes,
        COUNT(CASE WHEN type_operation = 'retrait_especes' THEN 1 END) as retrait_especes,
        COUNT(CASE WHEN type_operation = 'depense' THEN 1 END) as depenses,
        COUNT(CASE WHEN type_operation = 'transfert_banque' THEN 1 END) as transferts_banque
      FROM caisse_historique
    `);
    
    console.log('\n📊 Statistiques finales de caisse_historique:');
    console.log(`   - Total: ${stats[0].total} opérations`);
    console.log(`   - Ajout espèces: ${stats[0].ajout_especes}`);
    console.log(`   - Retrait espèces: ${stats[0].retrait_especes}`);
    console.log(`   - Dépenses: ${stats[0].depenses}`);
    console.log(`   - Transferts banque: ${stats[0].transferts_banque}`);

    console.log('\n🎉 Nettoyage terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

cleanupCaisseHistorique();