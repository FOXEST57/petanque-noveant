import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testPhotoUploadEvent36() {
    try {
        console.log('🔄 Test d\'upload de photos pour l\'événement 36...');
        
        // Créer un fichier de test simple
        const testContent = Buffer.from('test image content for event 36');
        const testImagePath = 'test-image-event36.jpg';
        fs.writeFileSync(testImagePath, testContent);
        
        // Créer le FormData
        const formData = new FormData();
        formData.append('photos', fs.createReadStream(testImagePath), {
            filename: 'test-image-event36.jpg',
            contentType: 'image/jpeg'
        });
        
        console.log('📋 FormData créé avec succès');
        
        // Token valide pour le club 1 (test_club1@test.com)
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJjbHViSWQiOjEsImVtYWlsIjoidGVzdF9jbHViMUB0ZXN0LmNvbSIsInJvbGUiOiJwcmVzaWRlbnQiLCJpYXQiOjE3NTg2MjEzMTksImV4cCI6MTc1ODYyNDkxOX0.7KEPFTJePtVQdVH9qkMpG_bpVWYlKMpkm3NP1rIjEzc';
        
        console.log('🔍 Tentative d\'upload vers l\'événement 36...');
        
        // Faire la requête
        const response = await fetch('http://localhost:3002/api/events/36/photos', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        const responseText = await response.text();
        console.log('📄 Response:', responseText);
        
        if (!response.ok) {
            console.log('❌ Erreur lors de l\'upload');
        } else {
            console.log('✅ Upload réussi!');
            
            // Vérifier que la photo a été ajoutée
            console.log('\n🔍 Vérification de l\'ajout en base...');
            const checkResponse = await fetch('http://localhost:3002/api/events/36/photos');
            if (checkResponse.ok) {
                const photos = await checkResponse.json();
                console.log(`📸 Nombre de photos maintenant: ${photos.length}`);
                photos.forEach(photo => {
                    console.log(`   - ${photo.filename} (${photo.file_size} bytes)`);
                });
            }
        }
        
        // Nettoyer le fichier de test
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

testPhotoUploadEvent36();