import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3007';

async function testTransfertEndpoint() {
  console.log('🧪 Test de l\'endpoint de transfert bancaire');
  console.log('============================================\n');

  try {
    // Données du test
    const transfertData = {
      type: 'banque-vers-caisse',
      montant: 100,
      banque_id: 1,
      description: 'Test transfert 100€'
    };

    console.log('1. Données du transfert:');
    console.log(JSON.stringify(transfertData, null, 2));

    // Faire la requête POST
    console.log('\n2. Envoi de la requête...');
    const response = await fetch(`${API_BASE}/api/caisse/transfert-bancaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Club-Subdomain': 'noveant'
      },
      body: JSON.stringify(transfertData)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const result = await response.json();
    console.log('\n3. Réponse du serveur:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Transfert réussi !');
    } else {
      console.log('\n❌ Erreur lors du transfert');
    }

  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    console.log('\nVérifiez que le serveur est démarré sur le port 3000');
  }
}

testTransfertEndpoint();