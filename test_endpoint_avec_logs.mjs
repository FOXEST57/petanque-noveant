import fetch from 'node-fetch';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3007';

async function testEndpointAvecLogs() {
  console.log('🧪 Test de l\'endpoint avec logs détaillés');
  console.log('==========================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'petanque_noveant'
  });

  try {
    const clubId = 2;

    // 1. État initial de la base
    console.log('1. État initial de la base de données:');
    const [initialOps] = await connection.execute(
      'SELECT COUNT(*) as count FROM fond_caisse_operations WHERE id_club = ?',
      [clubId]
    );
    console.log(`   - Nombre d'opérations initial: ${initialOps[0].count}`);

    // 2. Connexion
    console.log('\n2. Connexion à l\'API...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Club-Subdomain': 'noveant'
      },
      body: JSON.stringify({
        email: 'test.transfert@noveant.com',
        password: 'test123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Échec de la connexion');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie');

    // 3. Appel de l'endpoint de transfert
    console.log('\n3. Appel de l\'endpoint de transfert...');
    const transfertData = {
      banqueId: 2,
      montant: 150,
      type: 'banque-vers-caisse'
    };

    console.log('   Données envoyées:', JSON.stringify(transfertData, null, 2));

    const transfertResponse = await fetch(`${API_BASE}/api/caisse/transfert-bancaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Club-Subdomain': 'noveant'
      },
      body: JSON.stringify(transfertData)
    });

    console.log(`   Status: ${transfertResponse.status} ${transfertResponse.statusText}`);

    const transfertResult = await transfertResponse.json();
    console.log('   Réponse:', JSON.stringify(transfertResult, null, 2));

    // 4. Vérification immédiate en base
    console.log('\n4. Vérification immédiate en base (attente 1 seconde)...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const [finalOps] = await connection.execute(
      'SELECT COUNT(*) as count FROM fond_caisse_operations WHERE id_club = ?',
      [clubId]
    );
    console.log(`   - Nombre d'opérations final: ${finalOps[0].count}`);

    const difference = finalOps[0].count - initialOps[0].count;
    console.log(`   - Différence: ${difference} opération(s)`);

    if (difference > 0) {
      console.log('\n✅ L\'opération a été enregistrée en base !');
      
      // Afficher la dernière opération
      const [lastOp] = await connection.execute(
        'SELECT * FROM fond_caisse_operations WHERE id_club = ? ORDER BY date_operation DESC LIMIT 1',
        [clubId]
      );
      
      if (lastOp.length > 0) {
        const op = lastOp[0];
        console.log('   Dernière opération:');
        console.log(`   - Type: ${op.type_operation}`);
        console.log(`   - Montant: ${op.montant}€`);
        console.log(`   - Description: ${op.description}`);
        console.log(`   - Date: ${op.date_operation}`);
      }
    } else {
      console.log('\n❌ L\'opération n\'a PAS été enregistrée en base');
      console.log('   Malgré le succès de l\'API, aucune insertion n\'a eu lieu');
    }

    // 5. Vérifier aussi la table fond_caisse
    console.log('\n5. Vérification de la table fond_caisse:');
    const [fondCaisse] = await connection.execute(
      'SELECT * FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (fondCaisse.length > 0) {
      console.log(`   - Solde actuel: ${fondCaisse[0].solde}€`);
      console.log(`   - Dernière modification: ${fondCaisse[0].date_modification}`);
    } else {
      console.log('   - Aucune entrée dans fond_caisse');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

testEndpointAvecLogs();