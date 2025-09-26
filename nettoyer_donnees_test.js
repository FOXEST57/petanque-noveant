import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function nettoyerDonneesTest() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== NETTOYAGE DES DONNÉES DE TEST ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. Afficher l'état avant nettoyage
    console.log('1. État avant nettoyage:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondCaisse = clubRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    
    const [operationsRows] = await connection.execute(
      `SELECT COUNT(*) as nb_operations, 
              COALESCE(SUM(montant_encaissement), 0) as total_encaissements
       FROM caisse_historique 
       WHERE club_id = ? AND type_operation = 'credit'`,
      [clubId]
    );
    
    const nbOperations = operationsRows[0].nb_operations || 0;
    const totalCredits = operationsRows[0].total_encaissements || 0;
    console.log(`   Opérations de crédit: ${nbOperations}`);
    console.log(`   Total des crédits: ${totalCredits} €`);
    
    // 2. Supprimer les opérations de test
    console.log('\n2. Suppression des opérations de test:');
    
    await connection.beginTransaction();
    
    try {
      // Supprimer les opérations de crédit (transferts bancaires de test)
      const [deleteResult] = await connection.execute(
        `DELETE FROM caisse_historique 
         WHERE club_id = ? AND type_operation = 'credit' 
         AND description LIKE '%Transfert depuis%'`,
        [clubId]
      );
      
      console.log(`   ✅ ${deleteResult.affectedRows} opérations de crédit supprimées`);
      
      // Remettre le fond de caisse à 0
      await connection.execute(
        'UPDATE clubs SET fond_caisse = 0.00 WHERE id = ?',
        [clubId]
      );
      
      console.log(`   ✅ Fond de caisse remis à 0.00 €`);
      
      await connection.commit();
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
    // 3. Vérifier l'état après nettoyage
    console.log('\n3. État après nettoyage:');
    
    const [clubApresRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondApres = clubApresRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondApres} €`);
    
    const [operationsApresRows] = await connection.execute(
      `SELECT COUNT(*) as nb_operations
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const nbOperationsApres = operationsApresRows[0].nb_operations || 0;
    console.log(`   Opérations restantes: ${nbOperationsApres}`);
    
    // 4. Test du calcul du solde après nettoyage
    console.log('\n4. Test du calcul du solde après nettoyage:');
    
    const [operationsFinalesRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const totalEncaissements = parseFloat(operationsFinalesRows[0].total_encaissements || 0);
    const totalRetraits = parseFloat(operationsFinalesRows[0].total_retraits || 0);
    const soldeCalcule = parseFloat(fondApres) + totalEncaissements - totalRetraits;
    
    console.log(`   Total encaissements: ${totalEncaissements} €`);
    console.log(`   Total retraits: ${totalRetraits} €`);
    console.log(`   Solde calculé: ${soldeCalcule} €`);
    
    console.log('\n=== NETTOYAGE TERMINÉ ===');
    console.log('✅ Les données de test ont été supprimées');
    console.log('✅ Le fond de caisse est remis à 0.00 €');
    console.log('✅ La base est prête pour de nouveaux tests');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

nettoyerDonneesTest().catch(console.error);