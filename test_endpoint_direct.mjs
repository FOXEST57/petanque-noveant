import fetch from 'node-fetch';

async function testEndpointDirect() {
  console.log('🧪 Test direct de l\'endpoint');
  console.log('==============================');
  
  try {
    // 1. Connexion
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@petanque-noveant.fr',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('1. Connexion:', loginData.success ? '✅' : '❌');
    
    if (!loginData.success) {
      console.error('Échec de la connexion');
      return;
    }
    
    const token = loginData.token;
    
    // 2. Test avec différents types de montants
    const testCases = [
      { montant: 150, description: 'Nombre entier' },
      { montant: '150', description: 'String numérique' },
      { montant: 150.50, description: 'Nombre décimal' },
      { montant: '150.50', description: 'String décimale' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n2. Test avec ${testCase.description}: ${testCase.montant} (${typeof testCase.montant})`);
      
      const transfertResponse = await fetch('http://localhost:3000/api/caisse/transfert-bancaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          banqueId: 2,
          montant: testCase.montant,
          type: 'banque-vers-caisse'
        })
      });
      
      const transfertData = await transfertResponse.json();
      console.log(`   Status: ${transfertResponse.status}`);
      console.log(`   Réponse:`, transfertData);
      
      if (transfertData.nouveauFondCaisse && transfertData.nouveauFondCaisse.includes('250')) {
        console.log(`   ⚠️  Concaténation détectée: ${transfertData.nouveauFondCaisse}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testEndpointDirect();