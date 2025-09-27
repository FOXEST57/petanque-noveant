import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function fixMigration() {
  console.log('🔧 Correction de la migration incorrecte du fond de caisse');
  console.log('======================================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    await connection.beginTransaction();
    
    const clubId = 2;
    
    // 1. Vérifier l'état actuel
    console.log('1. État avant correction:');
    const [currentOperations] = await connection.execute(
      'SELECT * FROM fond_caisse_operations WHERE id_club = ?',
      [clubId]
    );
    
    console.log(`   - Opérations actuelles: ${currentOperations.length}`);
    currentOperations.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.type_operation} - ${op.montant}€ - ${op.description}`);
    });
    
    const [currentFond] = await connection.execute(
      'SELECT credit, debit, solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (currentFond.length > 0) {
      const fond = currentFond[0];
      console.log(`   - Fond de caisse: crédit=${fond.credit}€, débit=${fond.debit}€, solde=${fond.solde}€`);
    }
    
    // 2. Supprimer l'entrée incorrecte de migration
    console.log('\n2. Suppression de l\'entrée incorrecte:');
    const [deleteResult] = await connection.execute(
      'DELETE FROM fond_caisse_operations WHERE id_club = ? AND description LIKE "%Migration%"',
      [clubId]
    );
    
    console.log(`   ✅ ${deleteResult.affectedRows} entrée(s) de migration supprimée(s)`);
    
    // 3. Recréer l'entrée correcte basée sur le vrai transfert bancaire
    console.log('\n3. Création de l\'entrée correcte:');
    
    // Le vrai montant du transfert bancaire est dans fond_caisse.credit
    if (currentFond.length > 0) {
      const vraiMontant = parseFloat(currentFond[0].credit);
      
      if (vraiMontant > 0) {
        await connection.execute(
          'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, user_id) VALUES (?, ?, ?, ?, ?)',
          [clubId, 'credit', vraiMontant, 'Transfert bancaire initial', 1]
        );
        
        console.log(`   ✅ Nouvelle entrée créée: ${vraiMontant}€ (transfert bancaire)`);
        
        // 4. Mettre à jour le solde dans fond_caisse
        await connection.execute(
          'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
          [vraiMontant, clubId]
        );
        
        console.log(`   ✅ Solde mis à jour: ${vraiMontant}€`);
      }
    }
    
    // 5. Vérification finale
    console.log('\n4. État après correction:');
    const [newOperations] = await connection.execute(
      'SELECT * FROM fond_caisse_operations WHERE id_club = ?',
      [clubId]
    );
    
    console.log(`   - Opérations après correction: ${newOperations.length}`);
    newOperations.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.type_operation} - ${op.montant}€ - ${op.description}`);
    });
    
    const [newFond] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (newFond.length > 0) {
      console.log(`   - Nouveau solde fond de caisse: ${newFond[0].solde}€`);
    }
    
    // 6. Vérifier que les recettes restent séparées
    const [recettes] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    if (recettes.length > 0) {
      const totalRecettes = parseFloat(recettes[0].total_encaissements) - parseFloat(recettes[0].total_retraits);
      console.log(`   - Recettes de caisse (séparées): ${totalRecettes}€`);
      console.log(`   - Solde total de la caisse: ${newFond[0].solde + totalRecettes}€`);
    }
    
    await connection.commit();
    console.log('\n✅ Correction terminée avec succès!');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await connection.end();
  }
}

fixMigration().catch(console.error);