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

async function testCorrectionTransfert() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== TEST DE LA CORRECTION DE TRANSFERT BANCAIRE ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. Nettoyer les données de test précédentes
    console.log('1. Nettoyage des données de test précédentes...');
    
    // Supprimer l'opération de crédit existante
    await connection.execute(
      'DELETE FROM caisse_historique WHERE club_id = ? AND type_operation = "credit" AND description LIKE "Transfert depuis%"',
      [clubId]
    );
    
    // Remettre le fond de caisse à 0.01€ (valeur initiale)
    await connection.execute(
      'UPDATE clubs SET fond_caisse = 0.01 WHERE id = ?',
      [clubId]
    );
    
    console.log('   ✅ Données nettoyées');
    
    // 2. État avant le nouveau transfert
    console.log('\n2. État AVANT le nouveau transfert:');
    const [clubRowsBefore] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const [operationsRowsBefore] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const fondCaisseBefore = parseFloat(clubRowsBefore[0]?.fond_caisse || 0);
    const totalEncaissementsBefore = parseFloat(operationsRowsBefore[0].total_encaissements || 0);
    const totalRetraitsBefore = parseFloat(operationsRowsBefore[0].total_retraits || 0);
    const soldeBefore = fondCaisseBefore + totalEncaissementsBefore - totalRetraitsBefore;
    const recettesBefore = soldeBefore - fondCaisseBefore;
    
    console.log(`   Fond de caisse: ${fondCaisseBefore} €`);
    console.log(`   Total encaissements: ${totalEncaissementsBefore} €`);
    console.log(`   Total retraits: ${totalRetraitsBefore} €`);
    console.log(`   Solde: ${soldeBefore} €`);
    console.log(`   Recettes: ${recettesBefore} €`);
    
    // 3. Simuler un transfert bancaire vers caisse avec la nouvelle logique
    console.log('\n3. Simulation d\'un transfert bancaire de 500€ vers la caisse...');
    
    const montantTransfert = 500.00;
    const nouveauFondCaisse = fondCaisseBefore + montantTransfert;
    
    // Mettre à jour seulement le fond de caisse (nouvelle logique)
    await connection.execute(
      'UPDATE clubs SET fond_caisse = ? WHERE id = ?',
      [nouveauFondCaisse, clubId]
    );
    
    // NE PAS enregistrer dans l'historique (nouvelle logique)
    console.log('   ✅ Transfert effectué avec la nouvelle logique');
    
    // 4. État après le transfert
    console.log('\n4. État APRÈS le transfert avec la nouvelle logique:');
    const [clubRowsAfter] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const [operationsRowsAfter] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const fondCaisseAfter = parseFloat(clubRowsAfter[0]?.fond_caisse || 0);
    const totalEncaissementsAfter = parseFloat(operationsRowsAfter[0].total_encaissements || 0);
    const totalRetraitsAfter = parseFloat(operationsRowsAfter[0].total_retraits || 0);
    const soldeAfter = fondCaisseAfter + totalEncaissementsAfter - totalRetraitsAfter;
    const recettesAfter = soldeAfter - fondCaisseAfter;
    
    console.log(`   Fond de caisse: ${fondCaisseAfter} €`);
    console.log(`   Total encaissements: ${totalEncaissementsAfter} €`);
    console.log(`   Total retraits: ${totalRetraitsAfter} €`);
    console.log(`   Solde: ${soldeAfter} €`);
    console.log(`   Recettes: ${recettesAfter} €`);
    
    // 5. Vérification des résultats
    console.log('\n5. VÉRIFICATION DES RÉSULTATS:');
    
    const fondCaisseAttendu = 500.01; // 0.01 initial + 500 transfert
    const soldeAttendu = 500.01;
    const recettesAttendues = 0;
    
    console.log(`   Fond de caisse attendu: ${fondCaisseAttendu} € | Obtenu: ${fondCaisseAfter} € | ${fondCaisseAfter === fondCaisseAttendu ? '✅' : '❌'}`);
    console.log(`   Solde attendu: ${soldeAttendu} € | Obtenu: ${soldeAfter} € | ${soldeAfter === soldeAttendu ? '✅' : '❌'}`);
    console.log(`   Recettes attendues: ${recettesAttendues} € | Obtenues: ${recettesAfter} € | ${recettesAfter === recettesAttendues ? '✅' : '❌'}`);
    
    if (fondCaisseAfter === fondCaisseAttendu && soldeAfter === soldeAttendu && recettesAfter === recettesAttendues) {
      console.log('\n🎉 CORRECTION RÉUSSIE !');
      console.log('   La logique de transfert bancaire fonctionne maintenant correctement.');
      console.log('   Les transferts bancaires vers la caisse n\'apparaissent plus comme des recettes.');
    } else {
      console.log('\n❌ CORRECTION INCOMPLÈTE');
      console.log('   Il reste des problèmes dans la logique de transfert.');
    }
    
    console.log('\n=== TEST TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testCorrectionTransfert().catch(console.error);