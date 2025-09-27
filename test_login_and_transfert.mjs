import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3007';

async function testLoginAndTransfert() {
  console.log('🧪 Test de connexion et transfert bancaire');
  console.log('==========================================\n');

  try {
    // 1. Se connecter pour obtenir un token
    console.log('1. Connexion...');
    const loginData = {
      email: 'test.transfert@noveant.com',
      password: 'test123'
    };

    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Club-Subdomain': 'noveant'
      },
      body: JSON.stringify(loginData)
    });

    if (!loginResponse.ok) {
      const loginError = await loginResponse.json();
      console.log('❌ Erreur de connexion:', loginError);
      return;
    }

    const loginResult = await loginResponse.json();
    console.log('✅ Connexion réussie');
    console.log(`   - Utilisateur: ${loginResult.user.nom} ${loginResult.user.prenom}`);
    console.log(`   - Rôle: ${loginResult.user.role}`);

    const token = loginResult.token;

    // 2. Tester le transfert bancaire avec le token
    console.log('\n2. Test du transfert bancaire...');
    const transfertData = {
      banqueId: 2,
      montant: 100,
      type: 'banque-vers-caisse'
    };

    console.log('Données du transfert:');
    console.log(JSON.stringify(transfertData, null, 2));

    const transfertResponse = await fetch(`${API_BASE}/api/caisse/transfert-bancaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Club-Subdomain': 'noveant'
      },
      body: JSON.stringify(transfertData)
    });

    console.log(`\nStatus: ${transfertResponse.status} ${transfertResponse.statusText}`);

    const transfertResult = await transfertResponse.json();
    console.log('\n3. Réponse du serveur:');
    console.log(JSON.stringify(transfertResult, null, 2));

    if (transfertResponse.ok) {
      console.log('\n✅ Transfert réussi !');
      
      // 3. Vérifier que le transfert a été enregistré
      console.log('\n4. Vérification en base de données...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
      
      // Importer le module pour vérifier la base
      const { default: mysql } = await import('mysql2/promise');
      const { config } = await import('dotenv');
      config();

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'petanque_noveant'
      });

      const [operationsRows] = await connection.execute(
        'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC LIMIT 1',
        [2]
      );

      if (operationsRows.length > 0) {
        const lastOperation = operationsRows[0];
        console.log('✅ Opération trouvée en base:');
        console.log(`   - Type: ${lastOperation.type_operation}`);
        console.log(`   - Montant: ${lastOperation.montant}€`);
        console.log(`   - Description: ${lastOperation.description}`);
        console.log(`   - Date: ${lastOperation.date_operation}`);
      } else {
        console.log('❌ Aucune opération trouvée en base');
      }

      await connection.end();

    } else {
      console.log('\n❌ Erreur lors du transfert');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

testLoginAndTransfert();