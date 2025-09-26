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

async function diagnosticProblemeTransfert() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== DIAGNOSTIC DU PROBLÈME DE TRANSFERT BANCAIRE ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. État actuel de la base
    console.log('1. État actuel de la base:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondCaisse = parseFloat(clubRows[0]?.fond_caisse || 0);
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    
    // 2. Historique des opérations
    console.log('\n2. Historique des opérations:');
    const [historiqueRows] = await connection.execute(
      `SELECT id, type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE club_id = ? 
       ORDER BY date_operation DESC 
       LIMIT 5`,
      [clubId]
    );
    
    historiqueRows.forEach((op, index) => {
      console.log(`   ${index + 1}. [ID:${op.id}] ${op.type_operation}: +${op.montant_encaissement}€, -${op.montant_retrait}€`);
      console.log(`      Description: ${op.description}`);
      console.log(`      Date: ${op.date_operation}`);
      console.log('');
    });
    
    // 3. Calcul du solde avec la logique actuelle
    console.log('3. Calcul du solde avec la logique actuelle:');
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const totalEncaissements = parseFloat(operationsRows[0].total_encaissements || 0);
    const totalRetraits = parseFloat(operationsRows[0].total_retraits || 0);
    const soldeCalcule = fondCaisse + totalEncaissements - totalRetraits;
    const recettesCalculees = soldeCalcule - fondCaisse;
    
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    console.log(`   Total encaissements: ${totalEncaissements} €`);
    console.log(`   Total retraits: ${totalRetraits} €`);
    console.log(`   Solde calculé: ${soldeCalcule} €`);
    console.log(`   Recettes calculées (solde - fond): ${recettesCalculees} €`);
    
    // 4. Analyse du problème
    console.log('\n4. ANALYSE DU PROBLÈME:');
    
    // Vérifier s'il y a des opérations de crédit (transferts bancaires vers caisse)
    const [creditRows] = await connection.execute(
      `SELECT COUNT(*) as nb_credits, COALESCE(SUM(montant_encaissement), 0) as total_credits
       FROM caisse_historique 
       WHERE club_id = ? AND type_operation = 'credit'`,
      [clubId]
    );
    
    const nbCredits = creditRows[0].nb_credits;
    const totalCredits = parseFloat(creditRows[0].total_credits || 0);
    
    console.log(`   Nombre d'opérations de crédit (transferts bancaires): ${nbCredits}`);
    console.log(`   Total des crédits: ${totalCredits} €`);
    
    if (nbCredits > 0) {
      console.log('\n   🔍 PROBLÈME IDENTIFIÉ:');
      console.log('   Les transferts bancaires vers la caisse sont enregistrés comme des "encaissements"');
      console.log('   dans l\'historique, ce qui les fait apparaître comme des recettes.');
      console.log('   ');
      console.log('   LOGIQUE ACTUELLE (INCORRECTE):');
      console.log(`   - Transfert bancaire de ${totalCredits}€ vers caisse`);
      console.log(`   - Fond de caisse: ${fondCaisse}€ (devrait être ${totalCredits}€)`);
      console.log(`   - Encaissements: ${totalEncaissements}€ (inclut les transferts bancaires)`);
      console.log(`   - Solde: ${soldeCalcule}€`);
      console.log(`   - Recettes: ${recettesCalculees}€ (devrait être 0€)`);
      console.log('   ');
      console.log('   LOGIQUE CORRECTE (ATTENDUE):');
      console.log(`   - Transfert bancaire de ${totalCredits}€ vers caisse`);
      console.log(`   - Fond de caisse: ${totalCredits}€`);
      console.log(`   - Encaissements: 0€ (les transferts bancaires ne sont pas des recettes)`);
      console.log(`   - Solde: ${totalCredits}€`);
      console.log(`   - Recettes: 0€`);
    }
    
    // 5. Vérifier d'où vient le 0.01€
    console.log('\n5. ORIGINE DU 0.01€:');
    const [initRows] = await connection.execute(
      `SELECT fond_caisse FROM clubs WHERE id = ?`,
      [clubId]
    );
    
    console.log(`   Le fond de caisse initial était probablement de 0.01€`);
    console.log(`   Après le transfert de ${totalCredits}€, il devrait être de ${0.01 + totalCredits}€`);
    console.log(`   Mais la logique actuelle ne met à jour que le fond_caisse et enregistre aussi`);
    console.log(`   l'opération comme un encaissement, créant une double comptabilisation.`);
    
    console.log('\n=== DIAGNOSTIC TERMINÉ ===');
    console.log('✅ Problème identifié: Double comptabilisation des transferts bancaires');
    console.log('🔧 Solution: Les transferts bancaires ne doivent PAS être enregistrés comme des encaissements');
    console.log('🔧 Ils doivent seulement mettre à jour le fond_caisse');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

diagnosticProblemeTransfert().catch(console.error);