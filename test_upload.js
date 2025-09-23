import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testPhotoUpload() {
    try {
        // Créer un fichier de test simple
        const testContent = Buffer.from('test image content');
        fs.writeFileSync('test-image.jpg', testContent);
        
        // Créer le FormData
        const formData = new FormData();
        formData.append('photos', fs.createReadStream('test-image.jpg'), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
        });
        
        console.log('🔍 Tentative d\'upload vers l\'événement 29...');
        
        // Faire la requête avec un token de test
        const response = await fetch('http://localhost:3002/api/events/29/photos', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJjbHViSWQiOjEsImVtYWlsIjoidGVzdF9jbHViMUB0ZXN0LmNvbSIsInJvbGUiOiJwcmVzaWRlbnQiLCJpYXQiOjE3NTg2MDQ0OTYsImV4cCI6MTc1ODYwODA5Nn0.vV0r8QC4w8UUUuF2u6vbey9KEUL1GTF90o39toQdMnE'
            }
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        const responseText = await response.text();
        console.log('📄 Response:', responseText);
        
        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        // Nettoyer le fichier de test
        if (fs.existsSync('test-image.jpg')) {
            fs.unlinkSync('test-image.jpg');
        }
    }
}

testPhotoUpload();