import fetch from 'node-fetch';

async function testSoldeAPI() {
  console.log('🧪 Test de l\'API /caisse/solde');
  console.log('================================\n');
  
  try {
    // Test sans authentification d'abord
    console.log('1. Test sans authentification...');
    const response1 = await fetch('http://localhost:3007/api/caisse/solde');
    console.log('Statut:', response1.status);
    
    if (!response1.ok) {
      const error1 = await response1.json();
      console.log('Erreur attendue (pas d\'auth):', error1);
    }
    
    // Test avec un token invalide
    console.log('\n2. Test avec token invalide...');
    const response2 = await fetch('http://localhost:3007/api/caisse/solde', {
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
    console.log('Statut:', response2.status);
    
    if (!response2.ok) {
      const error2 = await response2.json();
      console.log('Erreur attendue (token invalide):', error2);
    }
    
    // Test avec paramètre club (comme dans l'erreur)
    console.log('\n3. Test avec paramètre club...');
    const response3 = await fetch('http://localhost:3007/api/caisse/solde?club=noveant');
    console.log('Statut:', response3.status);
    
    if (!response3.ok) {
      const error3 = await response3.json();
      console.log('Erreur:', error3);
    } else {
      const data3 = await response3.json();
      console.log('Succès:', data3);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testSoldeAPI().catch(console.error);