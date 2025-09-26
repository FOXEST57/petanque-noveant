import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function testSearchAPI() {
  try {
    console.log('🔍 Test de l\'API de recherche avec le surnom "PICASSO"...\n');
    
    // Créer un token JWT avec un utilisateur réel
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const testToken = jwt.sign(
      { 
        userId: 7, 
        clubId: 2,  // Club noveant
        email: 'admin2@test.com', 
        role: 'president' 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Token de test généré avec utilisateur réel (ID: 7)');
    
    // Test avec authentification et header de club
    const response = await fetch('http://localhost:3007/api/members/search?q=PICASSO', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
        'X-Club-Subdomain': 'noveant'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('\n✅ Résultats de la recherche:');
      console.table(jsonData.members);
      
      // Vérifier si PICASSO est trouvé
      const picassoMember = jsonData.members.find(m => m.surnom === 'PICASSO');
      if (picassoMember) {
        console.log('\n🎯 Membre avec surnom PICASSO trouvé:', picassoMember);
      } else {
        console.log('\n❌ Aucun membre avec surnom PICASSO trouvé');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testSearchAPI();