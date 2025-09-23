import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testUploadEvent4() {
  try {
    console.log('🔄 Test d\'upload de photos pour l\'événement 4...');
    
    // Utiliser le token obtenu précédemment
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImNsdWJJZCI6MiwiZW1haWwiOiJhZG1pbjJAdGVzdC5jb20iLCJyb2xlIjoicHJlc2lkZW50IiwiaWF0IjoxNzU4NjA2MjQ5LCJleHAiOjE3NTg2MDk4NDl9.B_yJFQQDpQNkyRhbHMbK2VXs99Rj5vXHbzIQs23YtJ0';
    console.log('✅ Token d\'authentification utilisé');

    // Créer un fichier de test plus petit
    const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==', 'base64');
    
    // Créer le FormData
    const formData = new FormData();
    formData.append('photos', testImageContent, {
      filename: 'test-event4.png',
      contentType: 'image/png'
    });

    console.log('📋 FormData créé avec succès');
    console.log('📋 Taille du buffer:', testImageContent.length);

    // Upload des photos
    console.log('📤 Tentative d\'upload...');
    const uploadResponse = await fetch(`http://localhost:3002/api/events/4/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log(`📤 Statut de l'upload: ${uploadResponse.status} ${uploadResponse.statusText}`);

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload réussi!');
      console.log('📋 Réponse:', uploadResult);
    } else {
      const errorText = await uploadResponse.text();
      console.log('❌ Erreur lors de l\'upload:', errorText);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testUploadEvent4();