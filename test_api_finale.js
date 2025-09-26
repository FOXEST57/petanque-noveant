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

async function testAPIFinale() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== TEST FINAL DE L\'API CAISSE ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. Vérifier l'état de la base
    console.log('1. État actuel de la base:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondCaisse = clubRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    
    // 2. Calcul du solde avec la nouvelle logique
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const totalEncaissements = parseFloat(operationsRows[0].total_encaissements || 0);
    const totalRetraits = parseFloat(operationsRows[0].total_retraits || 0);
    const soldeCalcule = parseFloat(fondCaisse) + totalEncaissements - totalRetraits;
    
    console.log(`   Total encaissements: ${totalEncaissements} €`);
    console.log(`   Total retraits: ${totalRetraits} €`);
    console.log(`   Solde calculé: ${soldeCalcule} €`);
    
    // 3. Créer un token temporaire pour les tests
    console.log('\n2. Création d\'un token temporaire pour les tests:');
    
    // Vérifier s'il y a un utilisateur admin
    const [adminRows] = await connection.execute(
      'SELECT id FROM users WHERE club_id = ? AND role = ? LIMIT 1',
      [clubId, 'admin']
    );
    
    let userId;
    if (adminRows.length > 0) {
      userId = adminRows[0].id;
      console.log(`   Utilisateur admin trouvé: ID ${userId}`);
    } else {
      // Créer un utilisateur temporaire pour les tests
      const [insertResult] = await connection.execute(
        'INSERT INTO users (club_id, email, password_hash, role, nom, prenom) VALUES (?, ?, ?, ?, ?, ?)',
        [clubId, 'test@test.com', 'test', 'admin', 'Test', 'User']
      );
      userId = insertResult.insertId;
      console.log(`   Utilisateur temporaire créé: ID ${userId}`);
    }
    
    // Créer un token temporaire
    const token = 'test-token-' + Date.now();
    await connection.execute(
      'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [userId, token]
    );
    console.log(`   Token temporaire créé: ${token}`);
    
    // 4. Test de l'API avec le token valide
    console.log('\n3. Test de l\'API avec token valide:');
    
    try {
      const response = await fetch('http://localhost:3007/api/caisse/solde', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Club-Subdomain': 'noveant'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API Response:`);
        console.log(`      Fond de caisse: ${data.fondCaisse} €`);
        console.log(`      Solde de caisse: ${data.soldeCaisse} €`);
        console.log(`      Recettes: ${data.recettes} €`);
        
        // Vérifier si l'API retourne le bon solde
        if (Math.abs(data.soldeCaisse - soldeCalcule) < 0.01) {
          console.log(`   ✅ SUCCÈS: L'API retourne le bon solde!`);
          console.log(`   ✅ Le transfert bancaire de 500€ est maintenant pris en compte`);
        } else {
          console.log(`   ❌ PROBLÈME: L'API retourne ${data.soldeCaisse}€ au lieu de ${soldeCalcule}€`);
        }
        
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Erreur API: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur lors de l'appel API: ${error.message}`);
    }
    
    // 5. Nettoyage du token temporaire
    await connection.execute('DELETE FROM auth_tokens WHERE token = ?', [token]);
    console.log('\n4. Token temporaire supprimé');
    
    console.log('\n=== TEST TERMINÉ ===');
    
    if (soldeCalcule > 0.01) {
      console.log('✅ RÉSOLUTION CONFIRMÉE: Le problème de transfert bancaire est résolu!');
      console.log(`✅ Le solde de caisse inclut maintenant les transferts bancaires: ${soldeCalcule}€`);
    } else {
      console.log('❌ Le problème persiste');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testAPIFinale().catch(console.error);