import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('=== TEST DE L\'API SITE-SETTINGS ===\n');
    
    // Test de la route publique
    console.log('1. Test de la route publique (/api/site-settings/public):');
    const publicResponse = await fetch('http://localhost:3002/api/site-settings/public');
    const publicData = await publicResponse.json();
    console.log('Statut:', publicResponse.status);
    console.log('Données:', JSON.stringify(publicData, null, 2));
    
    console.log('\n2. Test de la route authentifiée (/api/site-settings):');
    // Pour la route authentifiée, on va simuler un token
    const authResponse = await fetch('http://localhost:3002/api/site-settings', {
      headers: {
        'Authorization': 'Bearer fake-token-for-test',
        'Content-Type': 'application/json'
      }
    });
    const authData = await authResponse.json();
    console.log('Statut:', authResponse.status);
    console.log('Données:', JSON.stringify(authData, null, 2));
    
  } catch (error) {
    console.error('Erreur lors du test:', error.message);
  }
}

testAPI();