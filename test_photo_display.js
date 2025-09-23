import fetch from 'node-fetch';

async function testPhotoDisplay() {
  console.log('🔄 Test de l\'affichage des photos depuis le frontend...');
  
  const API_BASE_URL = 'http://localhost:5174';
  const API_URL = 'http://localhost:3002';
  
  try {
    // 1. Récupérer les photos de l'événement 33 via l'API
    console.log('\n📋 1. Récupération des photos via l\'API...');
    const photosResponse = await fetch(`${API_URL}/api/events/33/photos`);
    
    if (!photosResponse.ok) {
      console.log(`❌ Erreur API: ${photosResponse.status} ${photosResponse.statusText}`);
      return;
    }
    
    const photos = await photosResponse.json();
    console.log(`✅ ${photos.length} photo(s) trouvée(s)`);
    
    if (photos.length > 0) {
      console.log('\n📸 Détails des photos:');
      photos.forEach((photo, index) => {
        console.log(`  ${index + 1}. Nom de fichier: ${photo.filename}`);
        console.log(`     Chemin: ${photo.file_path}`);
        console.log(`     URL frontend: ${API_URL}/uploads/events/${photo.filename}`);
        console.log('');
      });
      
      // 2. Tester l'accès aux fichiers photos
      console.log('📋 2. Test d\'accès aux fichiers photos...');
      
      for (const photo of photos) {
        const photoUrl = `${API_URL}/uploads/events/${photo.filename}`;
        console.log(`\n🔍 Test de l'URL: ${photoUrl}`);
        
        try {
          const photoResponse = await fetch(photoUrl);
          console.log(`   Status: ${photoResponse.status} ${photoResponse.statusText}`);
          console.log(`   Content-Type: ${photoResponse.headers.get('content-type')}`);
          console.log(`   Content-Length: ${photoResponse.headers.get('content-length')} bytes`);
          
          if (photoResponse.ok) {
            console.log('   ✅ Photo accessible');
          } else {
            console.log('   ❌ Photo non accessible');
          }
        } catch (error) {
          console.log(`   ❌ Erreur d'accès: ${error.message}`);
        }
      }
      
      // 3. Vérifier la structure des dossiers
      console.log('\n📋 3. Vérification de la structure des dossiers...');
      
      // Tester différents chemins possibles
      const testPaths = [
        `${API_URL}/uploads/events/${photos[0].filename}`,
        `${API_URL}${photos[0].file_path}`,
        `${API_URL}/api/events/photos/${photos[0].filename}`,
        `${API_BASE_URL}/uploads/events/${photos[0].filename}`,
        `${API_BASE_URL}${photos[0].file_path}`
      ];
      
      for (const testPath of testPaths) {
        console.log(`\n🔍 Test du chemin: ${testPath}`);
        try {
          const response = await fetch(testPath);
          console.log(`   Status: ${response.status} ${response.statusText}`);
          if (response.ok) {
            console.log('   ✅ Chemin valide');
          }
        } catch (error) {
          console.log(`   ❌ Erreur: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testPhotoDisplay();