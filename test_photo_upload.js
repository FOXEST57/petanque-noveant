import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Test script pour reproduire l'erreur 500 lors de l'upload de photos
async function testPhotoUpload() {
    try {
        console.log("🧪 Test d'upload de photo d'événement");
        
        // D'abord, on doit se connecter pour obtenir un token
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'superadmin@petanque-club.fr', // Utilisation du super admin
                password: 'SuperAdmin123!' // Mot de passe par défaut du super admin
            })
        });

        if (!loginResponse.ok) {
            console.error("❌ Échec de la connexion:", await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log("✅ Connexion réussie, token obtenu");

        // Créer un fichier de test (image factice)
        const testImagePath = 'test_image.jpg';
        const testImageBuffer = Buffer.from('fake image data for testing');
        fs.writeFileSync(testImagePath, testImageBuffer);

        // Préparer FormData pour l'upload
        const form = new FormData();
        form.append('photos', fs.createReadStream(testImagePath), {
            filename: 'test_photo.jpg',
            contentType: 'image/jpeg'
        });

        console.log("📤 Tentative d'upload de photo pour l'événement ID 24");

        // Tenter l'upload de photo
        const uploadResponse = await fetch('http://localhost:3002/api/events/24/photos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        console.log("📊 Statut de la réponse:", uploadResponse.status);
        console.log("📊 Headers de la réponse:", Object.fromEntries(uploadResponse.headers));

        const responseText = await uploadResponse.text();
        console.log("📊 Corps de la réponse:", responseText);

        if (!uploadResponse.ok) {
            console.error("❌ Erreur lors de l'upload:", uploadResponse.status, responseText);
        } else {
            console.log("✅ Upload réussi!");
        }

        // Nettoyer le fichier de test
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error("❌ Erreur dans le test:", error);
    }
}

testPhotoUpload();