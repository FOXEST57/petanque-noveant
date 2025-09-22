import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

// Utiliser le même secret que dans le .env
const JWT_SECRET = 'votre-cle-secrete-jwt-tres-longue-et-complexe-changez-moi-dev-2024';

async function testWithRealAuth() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== TEST AVEC AUTHENTIFICATION RÉELLE ===\n');
    
    // 1. Récupérer un utilisateur president (équivalent admin)
    const [users] = await connection.execute(
      'SELECT id, email, club_id FROM users WHERE role = "president" LIMIT 1'
    );
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur president trouvé');
      return;
    }
    
    const user = users[0];
    console.log('✅ Utilisateur president trouvé:', user);
    
    // 2. Créer un token JWT valide
    const token = jwt.sign(
      { 
        userId: user.id, 
        clubId: user.club_id || 1, // Utiliser club_id 1 par défaut
        email: user.email, 
        role: 'president'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ Token JWT créé');
    
    // 3. Tester l'API avec le token
    console.log('\n=== TEST DE L\'API AVEC TOKEN VALIDE ===\n');
    
    const response = await fetch('http://localhost:3002/api/site-settings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Statut:', response.status);
    console.log('Données complètes:', JSON.stringify(data, null, 2));
    
    // 4. Vérifier spécifiquement les champs manquants
    if (data.success && data.data) {
      const expectedFields = [
        'club_address', 'ffpjp_id', 'club_phone', 'club_email', 
        'club_description', 'facebook_url', 'instagram_url'
      ];
      
      console.log('\n=== VÉRIFICATION DES CHAMPS DANS LA RÉPONSE API ===\n');
      
      expectedFields.forEach(field => {
        if (field in data.data) {
          console.log(`✅ ${field}: "${data.data[field]}"`);
        } else {
          console.log(`❌ ${field}: MANQUANT DANS LA RÉPONSE`);
        }
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testWithRealAuth();