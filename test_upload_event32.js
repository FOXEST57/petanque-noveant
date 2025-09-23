import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testPhotoUpload() {
    try {
        // Créer un fichier de test simple
        const testContent = Buffer.from('test image content for event 32');
        const testImagePath = 'test-image-event32.jpg';
        fs.writeFileSync(testImagePath, testContent);
        
        // Créer le FormData
        const formData = new FormData();
        formData.append('photos', fs.createReadStream(testImagePath), {
            filename: 'test-image-event32.jpg',
            contentType: 'image/jpeg'
        });
        
        console.log('🔍 Tentative d\'upload vers l\'événement 32 (Test Nouvel Événement)...');
        
        // Token valide pour le club 1
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJjbHViSWQiOjEsImVtYWlsIjoidGVzdF9jbHViMUB0ZXN0LmNvbSIsInJvbGUiOiJwcmVzaWRlbnQiLCJpYXQiOjE3NTg2MDQ0OTYsImV4cCI6MTc1ODYwODA5Nn0.vV0r8QC4w8UUUuF2u6vbey9KEUL1GTF90o39toQdMnE';
        
        // Faire la requête
        const response = await fetch('http://localhost:3002/api/events/32/photos', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        const responseText = await response.text();
        console.log('📄 Response:', responseText);
        
        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
        } else {
            console.log('✅ Upload réussi!');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        // Nettoyer le fichier de test
        if (fs.existsSync('test-image-event32.jpg')) {
            fs.unlinkSync('test-image-event32.jpg');
            console.log('🧹 Fichier de test supprimé');
        }
    }
}

testPhotoUpload();