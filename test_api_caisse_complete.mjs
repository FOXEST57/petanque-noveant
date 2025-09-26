import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const API_BASE_URL = 'http://localhost:3007';

// Token d'authentification (à remplacer par un vrai token)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsImNsdWJJZCI6MiwiaWF0IjoxNzM3OTAzNzI2LCJleHAiOjE3Mzc5OTA1MjZ9.example'; // Token d'exemple

async function makeAPICall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

async function testAPICaisseComplete() {
  console.log('🧪 Test complet de l\'API de caisse avec la nouvelle architecture');
  console.log('================================================================\n');
  
  try {
    // 1. Test de récupération du fond de caisse
    console.log('1. Test GET /api/caisse/fond...');
    const fondResult = await makeAPICall('/api/caisse/fond');
    console.log('Statut:', fondResult.status);
    console.log('Réponse:', fondResult.data);
    
    if (fondResult.success) {
      console.log('✅ Récupération du fond de caisse réussie');
    } else {
      console.log('❌ Erreur lors de la récupération du fond de caisse');
    }
    
    // 2. Test de récupération du solde complet
    console.log('\n2. Test GET /api/caisse/solde...');
    const soldeResult = await makeAPICall('/api/caisse/solde');
    console.log('Statut:', soldeResult.status);
    console.log('Réponse:', soldeResult.data);
    
    if (soldeResult.success) {
      console.log('✅ Récupération du solde complet réussie');
      console.log(`   - Fond de caisse: ${soldeResult.data.fondCaisse}€`);
      console.log(`   - Solde de caisse: ${soldeResult.data.soldeCaisse}€`);
      console.log(`   - Recettes: ${soldeResult.data.recettes}€`);
    } else {
      console.log('❌ Erreur lors de la récupération du solde complet');
    }
    
    // 3. Test de l'historique
    console.log('\n3. Test GET /api/caisse/historique...');
    const historiqueResult = await makeAPICall('/api/caisse/historique');
    console.log('Statut:', historiqueResult.status);
    
    if (historiqueResult.success) {
      console.log('✅ Récupération de l\'historique réussie');
      console.log(`   - Nombre d'opérations: ${historiqueResult.data.historique?.length || 0}`);
    } else {
      console.log('❌ Erreur lors de la récupération de l\'historique');
      console.log('Réponse:', historiqueResult.data);
    }
    
    // 4. Test de transfert bancaire (simulation)
    console.log('\n4. Test POST /api/caisse/transfert-bancaire...');
    const transfertData = {
      banqueId: 1,
      montant: 5.00,
      type: 'banque-vers-caisse'
    };
    
    const transfertResult = await makeAPICall('/api/caisse/transfert-bancaire', 'POST', transfertData);
    console.log('Statut:', transfertResult.status);
    console.log('Réponse:', transfertResult.data);
    
    if (transfertResult.success) {
      console.log('✅ Transfert bancaire réussi');
    } else {
      console.log('❌ Erreur lors du transfert bancaire');
      if (transfertResult.status === 401) {
        console.log('   (Erreur d\'authentification - token invalide)');
      }
    }
    
    // 5. Test de dépense en espèces (simulation)
    console.log('\n5. Test POST /api/caisse/depense-especes...');
    const depenseData = {
      montant: 2.50,
      description: 'Test de dépense - nouvelle architecture'
    };
    
    const depenseResult = await makeAPICall('/api/caisse/depense-especes', 'POST', depenseData);
    console.log('Statut:', depenseResult.status);
    console.log('Réponse:', depenseResult.data);
    
    if (depenseResult.success) {
      console.log('✅ Dépense en espèces réussie');
    } else {
      console.log('❌ Erreur lors de la dépense en espèces');
      if (depenseResult.status === 401) {
        console.log('   (Erreur d\'authentification - token invalide)');
      }
    }
    
    // 6. Vérification finale du solde
    console.log('\n6. Vérification finale du solde...');
    const soldeFinaleResult = await makeAPICall('/api/caisse/solde');
    
    if (soldeFinaleResult.success) {
      console.log('✅ Vérification finale réussie');
      console.log(`   - Fond de caisse final: ${soldeFinaleResult.data.fondCaisse}€`);
      console.log(`   - Solde de caisse final: ${soldeFinaleResult.data.soldeCaisse}€`);
    } else {
      console.log('❌ Erreur lors de la vérification finale');
    }
    
    console.log('\n🎉 Tests de l\'API terminés !');
    
    // Résumé des tests
    const tests = [
      { nom: 'Fond de caisse', success: fondResult.success },
      { nom: 'Solde complet', success: soldeResult.success },
      { nom: 'Historique', success: historiqueResult.success },
      { nom: 'Transfert bancaire', success: transfertResult.success },
      { nom: 'Dépense espèces', success: depenseResult.success },
      { nom: 'Vérification finale', success: soldeFinaleResult.success }
    ];
    
    const testsReussis = tests.filter(t => t.success).length;
    const totalTests = tests.length;
    
    console.log(`\n📊 Résumé: ${testsReussis}/${totalTests} tests réussis`);
    
    if (testsReussis === totalTests) {
      console.log('🎉 Tous les tests sont passés avec succès !');
    } else {
      console.log('⚠️  Certains tests ont échoué (probablement à cause de l\'authentification)');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale lors des tests:', error);
  }
}

// Exécuter les tests
testAPICaisseComplete().catch(console.error);