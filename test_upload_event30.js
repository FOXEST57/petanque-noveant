import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testPhotoUploadEvent30() {
    try {
        // Créer un fichier de test simple
        const testContent = Buffer.from('test image content for event 30');
        fs.writeFileSync('test-image-event30.jpg', testContent);
        
        // Créer le FormData
        const formData = new FormData();
        formData.append('photos', fs.createReadStream('test-image-event30.jpg'), {
            filename: 'test-image-event30.jpg',
            contentType: 'image/jpeg'
        });
        
        console.log('🔍 Tentative d\'upload vers l\'événement 30 (boules)...');
        
        // Faire la requête avec le token valide du club 1
        const response = await fetch('http://localhost:3002/api/events/30/photos', {
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
        
        // Nettoyer le fichier de test
        if (fs.existsSync('test-image-event30.jpg')) {
            fs.unlinkSync('test-image-event30.jpg');
            console.log('🧹 Fichier de test supprimé');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        
        // Nettoyer le fichier de test en cas d'erreur
        if (fs.existsSync('test-image-event30.jpg')) {
            fs.unlinkSync('test-image-event30.jpg');
        }
    }
}

testPhotoUploadEvent30();