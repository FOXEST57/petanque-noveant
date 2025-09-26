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

async function testCorrectionSolde() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== TEST CORRECTION SOLDE CAISSE ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. État actuel de la base
    console.log('1. État actuel de la base:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondCaisse = clubRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    
    // 2. Afficher les opérations récentes
    console.log('\n2. Opérations récentes dans caisse_historique:');
    const [historiqueRows] = await connection.execute(
      `SELECT type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE club_id = ? 
       ORDER BY date_operation DESC 
       LIMIT 10`,
      [clubId]
    );
    
    historiqueRows.forEach((op, index) => {
      console.log(`   ${index + 1}. ${op.type_operation}: +${op.montant_encaissement}€, -${op.montant_retrait}€ - ${op.description}`);
    });
    
    // 3. Calcul avec l'ancienne logique (excluant les crédits)
    console.log('\n3. Calcul avec l\'ANCIENNE logique (excluant les crédits):');
    const [operationsAnciennes] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ? AND type_operation != 'credit'`,
      [clubId]
    );
    
    const totalEncaissementsAncien = parseFloat(operationsAnciennes[0].total_encaissements || 0);
    const totalRetraitsAncien = parseFloat(operationsAnciennes[0].total_retraits || 0);
    const soldeAncien = parseFloat(fondCaisse) + totalEncaissementsAncien - totalRetraitsAncien;
    
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    console.log(`   Total encaissements (hors crédit): ${totalEncaissementsAncien} €`);
    console.log(`   Total retraits: ${totalRetraitsAncien} €`);
    console.log(`   Solde calculé (ANCIEN): ${soldeAncien} €`);
    
    // 4. Calcul avec la nouvelle logique (incluant tous les crédits)
    console.log('\n4. Calcul avec la NOUVELLE logique (incluant tous les crédits):');
    const [operationsNouvelles] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const totalEncaissementsNouveau = parseFloat(operationsNouvelles[0].total_encaissements || 0);
    const totalRetraitsNouveau = parseFloat(operationsNouvelles[0].total_retraits || 0);
    const soldeNouveau = parseFloat(fondCaisse) + totalEncaissementsNouveau - totalRetraitsNouveau;
    
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    console.log(`   Total encaissements (TOUS): ${totalEncaissementsNouveau} €`);
    console.log(`   Total retraits: ${totalRetraitsNouveau} €`);
    console.log(`   Solde calculé (NOUVEAU): ${soldeNouveau} €`);
    
    // 5. Test de l'API corrigée
    console.log('\n5. Test de l\'API corrigée via appel HTTP:');
    
    try {
      const response = await fetch('http://localhost:3007/api/caisse/solde', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token', // Token de test
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API Response:`);
        console.log(`      Fond de caisse: ${data.fondCaisse} €`);
        console.log(`      Solde de caisse: ${data.soldeCaisse} €`);
        console.log(`      Recettes: ${data.recettes} €`);
        console.log(`      Total encaissements: ${data.totalEncaissements} €`);
        console.log(`      Total retraits: ${data.totalRetraits} €`);
        
        // Vérifier si la correction fonctionne
        if (Math.abs(data.soldeCaisse - soldeNouveau) < 0.01) {
          console.log(`   ✅ CORRECTION RÉUSSIE: L'API retourne le bon solde!`);
        } else {
          console.log(`   ❌ PROBLÈME: L'API retourne ${data.soldeCaisse}€ au lieu de ${soldeNouveau}€`);
        }
      } else {
        console.log(`   ❌ Erreur API: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur lors de l'appel API: ${error.message}`);
      console.log(`   💡 Vérifiez que le serveur API est démarré sur le port 3007`);
    }
    
    // 6. Analyse des différences
    console.log('\n6. Analyse des différences:');
    const differenceEncaissements = totalEncaissementsNouveau - totalEncaissementsAncien;
    const differenceSolde = soldeNouveau - soldeAncien;
    
    console.log(`   Différence encaissements: +${differenceEncaissements} €`);
    console.log(`   Différence solde final: +${differenceSolde} €`);
    
    if (differenceEncaissements > 0) {
      console.log(`   ✅ Les transferts bancaires (crédits) sont maintenant inclus dans le calcul`);
    }
    
    console.log('\n=== CONCLUSION ===');
    if (soldeNouveau > soldeAncien) {
      console.log('✅ CORRECTION APPLIQUÉE: Le nouveau calcul inclut les transferts bancaires');
      console.log(`✅ Le solde passe de ${soldeAncien}€ à ${soldeNouveau}€`);
      console.log('✅ Les transferts bancaires vers la caisse sont maintenant comptabilisés');
    } else {
      console.log('❌ Aucune différence détectée - vérifiez les données de test');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testCorrectionSolde().catch(console.error);