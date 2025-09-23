import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import FormData from 'form-data';

async function testUploadEvent33Club1() {
  let connection;
  try {
    console.log('🔄 Test d\'upload de photos pour l\'événement 33 avec test_club1@test.com...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    // Récupérer l'utilisateur test_club1@test.com
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test_club1@test.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Utilisateur test_club1@test.com non trouvé');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Utilisateur trouvé: ${user.email}, Club: ${user.club_id}`);
    
    // Vérifier l'événement 33
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [33]
    );
    
    if (events.length === 0) {
      console.log('❌ Événement 33 non trouvé');
      return;
    }
    
    const event = events[0];
    console.log(`✅ Événement trouvé: "${event.title}", Club: ${event.club_id}`);
    
    // Vérifier si l'utilisateur peut accéder à cet événement
    if (user.club_id !== event.club_id) {
      console.log(`❌ L'utilisateur (club ${user.club_id}) ne peut pas accéder à l'événement du club ${event.club_id}`);
      return;
    }
    
    // Créer un token JWT pour l'utilisateur
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        clubId: user.club_id,
        role: user.role 
      },
      'votre-cle-secrete-jwt-tres-longue-et-complexe-changez-moi-dev-2024',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Token JWT créé pour test_club1@test.com');
    
    // Créer une image de test (très petite)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // Créer FormData
    const formData = new FormData();
    formData.append('photos', imageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Tentative d\'upload de photo...');
    
    // Envoyer la requête d'upload (port 5174 pour le serveur de dev)
    const response = await fetch('http://localhost:5174/api/events/33/photos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log(`📊 Statut de la réponse: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload réussi!');
      console.log('📋 Résultat:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur d\'upload:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testUploadEvent33Club1();