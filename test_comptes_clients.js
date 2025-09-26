/**
 * Script de test pour les routes des comptes clients
 */

const API_BASE = 'http://localhost:3007/api';
const CLUB_PARAM = '?club=noveant';

// Token d'authentification (à récupérer depuis une vraie connexion)
let authToken = null;

async function login() {
  try {
    console.log('=== CONNEXION ===');
    const response = await fetch(`${API_BASE}/auth/login${CLUB_PARAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin2@test.com',
        password: 'test123'
      })
    });

    const data = await response.json();
    
    if (data.message && data.token) {
      authToken = data.token;
      console.log('✅ Connexion réussie');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Échec de la connexion:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function testCrediterCompte() {
  try {
    console.log('\n=== TEST CRÉDIT COMPTE ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/crediter${CLUB_PARAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        membreId: 39,
        montantRaw: '50.75',
        description: 'Test de crédit via API comptes clients',
        reference: 'TEST-001'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Crédit réussi');
      console.log(`   Membre: ${data.data.membreNom}`);
      console.log(`   Ancien solde: ${data.data.ancienSolde}€`);
      console.log(`   Montant crédité: ${data.data.montantCredite}€`);
      console.log(`   Nouveau solde: ${data.data.nouveauSolde}€`);
      console.log(`   Description: ${data.data.description}`);
      console.log(`   Référence: ${data.data.reference}`);
      return data.data;
    } else {
      console.log('❌ Échec du crédit:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors du crédit:', error.message);
    return null;
  }
}

async function testDebiterCompte() {
  try {
    console.log('\n=== TEST DÉBIT COMPTE ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/debiter${CLUB_PARAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        membreId: 39,
        montantRaw: '15.25',
        description: 'Test de débit via API comptes clients',
        reference: 'TEST-002'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Débit réussi');
      console.log(`   Membre: ${data.data.membreNom}`);
      console.log(`   Ancien solde: ${data.data.ancienSolde}€`);
      console.log(`   Montant débité: ${data.data.montantDebite}€`);
      console.log(`   Nouveau solde: ${data.data.nouveauSolde}€`);
      console.log(`   Description: ${data.data.description}`);
      console.log(`   Référence: ${data.data.reference}`);
      return data.data;
    } else {
      console.log('❌ Échec du débit:', data.error);
      console.log(`   Code: ${data.code}`);
      if (data.data) {
        console.log(`   Solde actuel: ${data.data.soldeActuel}€`);
        console.log(`   Montant demandé: ${data.data.montantDemande}€`);
      }
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors du débit:', error.message);
    return null;
  }
}

async function testConsulterSolde() {
  try {
    console.log('\n=== TEST CONSULTATION SOLDE ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/solde/39${CLUB_PARAM}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Consultation réussie');
      console.log(`   Membre: ${data.data.prenom} ${data.data.nom}`);
      console.log(`   Email: ${data.data.email}`);
      console.log(`   Solde actuel: ${data.data.soldeActuel}€`);
      console.log(`   Total crédits: ${data.data.totalCredits}€`);
      console.log(`   Total débits: ${data.data.totalDebits}€`);
      console.log(`   Solde calculé: ${data.data.soldeCalcule}€`);
      console.log(`   Nombre d'opérations: ${data.data.nombreOperations}`);
      console.log(`   Dernière opération: ${data.data.derniereOperation}`);
      return data.data;
    } else {
      console.log('❌ Échec de la consultation:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la consultation:', error.message);
    return null;
  }
}

async function testHistoriqueOperations() {
  try {
    console.log('\n=== TEST HISTORIQUE OPÉRATIONS ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/historique/39${CLUB_PARAM}&limit=10&offset=0`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Historique récupéré');
      console.log(`   Membre: ${data.data.membre.prenom} ${data.data.membre.nom}`);
      console.log(`   Nombre d'opérations: ${data.data.operations.length}`);
      console.log(`   Total dans la base: ${data.data.pagination.total}`);
      
      console.log('\n   Dernières opérations:');
      data.data.operations.slice(0, 5).forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.type.toUpperCase()} - ${op.montant}€`);
        console.log(`      Solde après: ${op.soldeApres}€`);
        console.log(`      Description: ${op.description}`);
        console.log(`      Date: ${new Date(op.dateOperation).toLocaleString('fr-FR')}`);
        console.log(`      Opérateur: ${op.operateurNom || 'N/A'}`);
        console.log('');
      });
      
      return data.data;
    } else {
      console.log('❌ Échec de la récupération de l\'historique:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la récupération de l\'historique:', error.message);
    return null;
  }
}

async function testListeSoldes() {
  try {
    console.log('\n=== TEST LISTE DES SOLDES ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/liste${CLUB_PARAM}&limit=5&offset=0`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Liste des soldes récupérée');
      console.log(`   Nombre de membres affichés: ${data.data.membres.length}`);
      console.log(`   Total des membres: ${data.data.pagination.total}`);
      
      console.log('\n   Soldes des membres:');
      data.data.membres.forEach((membre, index) => {
        console.log(`   ${index + 1}. ${membre.prenom} ${membre.nom}`);
        console.log(`      Solde: ${membre.soldeActuel}€`);
        console.log(`      Opérations: ${membre.nombreOperations}`);
        console.log('');
      });
      
      return data.data;
    } else {
      console.log('❌ Échec de la récupération de la liste:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la récupération de la liste:', error.message);
    return null;
  }
}

async function testSoldeInsuffisant() {
  try {
    console.log('\n=== TEST SOLDE INSUFFISANT ===');
    
    const response = await fetch(`${API_BASE}/comptes-clients/debiter${CLUB_PARAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        membreId: 39,
        montantRaw: '10000.00', // Montant très élevé pour tester le solde insuffisant
        description: 'Test de solde insuffisant',
        reference: 'TEST-INSUFFISANT'
      })
    });

    const data = await response.json();
    
    if (!data.success && data.code === 'INSUFFICIENT_BALANCE') {
      console.log('✅ Test de solde insuffisant réussi');
      console.log(`   Erreur: ${data.error}`);
      console.log(`   Solde actuel: ${data.data.soldeActuel}€`);
      console.log(`   Montant demandé: ${data.data.montantDemande}€`);
      console.log(`   Solde après opération: ${data.data.soldeApresOperation}€`);
      return true;
    } else {
      console.log('❌ Le test de solde insuffisant a échoué - l\'opération n\'aurait pas dû réussir');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test de solde insuffisant:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS DES COMPTES CLIENTS\n');
  
  // 1. Se connecter
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Impossible de se connecter - arrêt des tests');
    return;
  }

  // 2. Tester le crédit
  const creditResult = await testCrediterCompte();
  
  // 3. Tester la consultation du solde
  const soldeResult = await testConsulterSolde();
  
  // 4. Tester le débit
  const debitResult = await testDebiterCompte();
  
  // 5. Tester l'historique
  const historiqueResult = await testHistoriqueOperations();
  
  // 6. Tester la liste des soldes
  const listeResult = await testListeSoldes();
  
  // 7. Tester le solde insuffisant
  const insuffisantResult = await testSoldeInsuffisant();
  
  // Résumé
  console.log('\n=== RÉSUMÉ DES TESTS ===');
  console.log(`✅ Connexion: ${loginSuccess ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Crédit compte: ${creditResult ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Consultation solde: ${soldeResult ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Débit compte: ${debitResult ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Historique: ${historiqueResult ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Liste soldes: ${listeResult ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Solde insuffisant: ${insuffisantResult ? 'OK' : 'ÉCHEC'}`);
  
  const totalTests = 7;
  const successfulTests = [loginSuccess, creditResult, soldeResult, debitResult, historiqueResult, listeResult, insuffisantResult].filter(Boolean).length;
  
  console.log(`\n🎯 RÉSULTAT: ${successfulTests}/${totalTests} tests réussis`);
  
  if (successfulTests === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
  } else {
    console.log('⚠️  Certains tests ont échoué - vérifiez les logs ci-dessus');
  }
}

// Exécuter tous les tests
runAllTests().catch(console.error);