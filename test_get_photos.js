import fetch from 'node-fetch';

// Test script pour vérifier la récupération des photos d'événements
async function testGetPhotos() {
    try {
        console.log("🧪 Test de récupération des photos d'événements");
        
        // Test pour l'événement 24
        console.log("\n📸 Test pour l'événement ID 24:");
        const response24 = await fetch('http://localhost:3002/api/events/24/photos');
        
        console.log("📊 Statut de la réponse:", response24.status);
        console.log("📊 Headers de la réponse:", Object.fromEntries(response24.headers));
        
        const data24 = await response24.json();
        console.log("📊 Données reçues:", JSON.stringify(data24, null, 2));
        
        // Test pour l'événement 25
        console.log("\n📸 Test pour l'événement ID 25:");
        const response25 = await fetch('http://localhost:3002/api/events/25/photos');
        
        console.log("📊 Statut de la réponse:", response25.status);
        const data25 = await response25.json();
        console.log("📊 Données reçues:", JSON.stringify(data25, null, 2));
        
        // Test pour un événement inexistant
        console.log("\n📸 Test pour l'événement ID 999 (inexistant):");
        const response999 = await fetch('http://localhost:3002/api/events/999/photos');
        
        console.log("📊 Statut de la réponse:", response999.status);
        const data999 = await response999.json();
        console.log("📊 Données reçues:", JSON.stringify(data999, null, 2));

    } catch (error) {
        console.error("❌ Erreur dans le test:", error);
    }
}

testGetPhotos();