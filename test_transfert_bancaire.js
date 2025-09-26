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

async function testTransfertBancaire() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== TEST TRANSFERT BANCAIRE ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. État initial
    console.log('1. État initial:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondInitial = clubRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondInitial} €`);
    
    // 2. Vérifier les banques disponibles
    const [banqueRows] = await connection.execute(
      'SELECT id, nom FROM banque WHERE club_id = ?',
      [clubId]
    );
    
    console.log('\n2. Banques disponibles:');
    if (banqueRows.length === 0) {
      console.log('   Aucune banque trouvée - création d\'une banque de test');
      
      // Créer une banque de test
      await connection.execute(
        'INSERT INTO banque (club_id, nom, iban, solde) VALUES (?, ?, ?, ?)',
        [clubId, 'Banque Test', 'FR7612345678901234567890123', 1000.00]
      );
      
      const [newBanqueRows] = await connection.execute(
        'SELECT id, nom FROM banque WHERE club_id = ? ORDER BY id DESC LIMIT 1',
        [clubId]
      );
      
      console.log(`   Banque créée: ${newBanqueRows[0].nom} (ID: ${newBanqueRows[0].id})`);
    } else {
      banqueRows.forEach(banque => {
        console.log(`   ${banque.nom} (ID: ${banque.id})`);
      });
    }
    
    // 3. Récupérer la première banque pour le test
    const [banqueTestRows] = await connection.execute(
      'SELECT id, nom FROM banque WHERE club_id = ? LIMIT 1',
      [clubId]
    );
    
    if (banqueTestRows.length === 0) {
      console.log('❌ Aucune banque disponible pour le test');
      return;
    }
    
    const banqueTest = banqueTestRows[0];
    console.log(`\n3. Utilisation de la banque: ${banqueTest.nom} (ID: ${banqueTest.id})`);
    
    // 4. Simuler un transfert bancaire de 500€ vers la caisse
    console.log('\n4. Simulation du transfert bancaire (500€ vers caisse):');
    
    await connection.beginTransaction();
    
    try {
      const montant = 500;
      const nouveauFondCaisse = parseFloat(fondInitial) + montant;
      
      // Mettre à jour le fond de caisse
      await connection.execute(
        'UPDATE clubs SET fond_caisse = ? WHERE id = ?',
        [nouveauFondCaisse, clubId]
      );
      
      // Enregistrer l'opération dans l'historique
      await connection.execute(
        'INSERT INTO caisse_historique (club_id, user_id, type_operation, montant_encaissement, montant_retrait, description, date_operation, banque_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)',
        [clubId, 1, 'credit', montant, 0, `Transfert depuis ${banqueTest.nom}`, banqueTest.id]
      );
      
      await connection.commit();
      console.log(`   ✅ Transfert simulé: +${montant}€`);
      console.log(`   ✅ Nouveau fond de caisse: ${nouveauFondCaisse}€`);
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
    // 5. Vérifier l'état après transfert
    console.log('\n5. État après transfert:');
    
    const [clubApresRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondApres = clubApresRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondApres} €`);
    
    // 6. Calculer le solde selon la logique actuelle (problématique)
    console.log('\n6. Calcul du solde selon la logique actuelle (PROBLÉMATIQUE):');
    
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ? AND type_operation != 'credit'`,
      [clubId]
    );
    
    const operations = operationsRows[0];
    const totalEncaissements = parseFloat(operations.total_encaissements || 0);
    const totalRetraits = parseFloat(operations.total_retraits || 0);
    const soldeCaisseProblematique = parseFloat(fondApres) + totalEncaissements - totalRetraits;
    
    console.log(`   Fond de caisse: ${fondApres} €`);
    console.log(`   Total encaissements (hors crédit): ${totalEncaissements} €`);
    console.log(`   Total retraits: ${totalRetraits} €`);
    console.log(`   Solde calculé (PROBLÉMATIQUE): ${soldeCaisseProblematique} €`);
    
    // 7. Calculer le solde correct (en incluant les crédits)
    console.log('\n7. Calcul du solde CORRECT (en incluant les crédits):');
    
    const [operationsCorrectesRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const operationsCorrectes = operationsCorrectesRows[0];
    const totalEncaissementsCorrect = parseFloat(operationsCorrectes.total_encaissements || 0);
    const totalRetraitsCorrect = parseFloat(operationsCorrectes.total_retraits || 0);
    const soldeCaisseCorrect = parseFloat(fondApres) + totalEncaissementsCorrect - totalRetraitsCorrect;
    
    console.log(`   Fond de caisse: ${fondApres} €`);
    console.log(`   Total encaissements (TOUS): ${totalEncaissementsCorrect} €`);
    console.log(`   Total retraits: ${totalRetraitsCorrect} €`);
    console.log(`   Solde calculé (CORRECT): ${soldeCaisseCorrect} €`);
    
    // 8. Afficher les opérations récentes
    console.log('\n8. Opérations récentes dans caisse_historique:');
    
    const [historiqueRows] = await connection.execute(
      `SELECT type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE club_id = ? 
       ORDER BY date_operation DESC 
       LIMIT 5`,
      [clubId]
    );
    
    historiqueRows.forEach(op => {
      console.log(`   ${op.type_operation}: +${op.montant_encaissement}€, -${op.montant_retrait}€ - ${op.description}`);
    });
    
    console.log('\n=== CONCLUSION ===');
    console.log('❌ PROBLÈME IDENTIFIÉ: Les transferts bancaires vers la caisse sont enregistrés comme "credit"');
    console.log('❌ Mais le calcul du solde exclut les opérations de type "credit"');
    console.log('✅ SOLUTION: Modifier la logique de calcul pour inclure les crédits OU changer le type d\'opération');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testTransfertBancaire().catch(console.error);