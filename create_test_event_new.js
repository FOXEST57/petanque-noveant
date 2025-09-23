import fetch from 'node-fetch';

async function createTestEvent() {
    try {
        // Token valide pour le club 1
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJjbHViSWQiOjEsImVtYWlsIjoidGVzdF9jbHViMUB0ZXN0LmNvbSIsInJvbGUiOiJwcmVzaWRlbnQiLCJpYXQiOjE3NTg2MDQ0OTYsImV4cCI6MTc1ODYwODA5Nn0.vV0r8QC4w8UUUuF2u6vbey9KEUL1GTF90o39toQdMnE';
        
        const eventData = {
            name: 'Test Nouvel Événement',
            description: 'Événement créé pour tester l\'upload de photos',
            date: '2025-10-15',
            location: 'Terrain de test',
            maxParticipants: 20
        };
        
        console.log('🔍 Création d\'un nouvel événement...');
        
        const response = await fetch('http://localhost:3002/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        const responseData = await response.text();
        console.log('📄 Response:', responseData);
        
        if (response.ok) {
            const result = JSON.parse(responseData);
            console.log('✅ Événement créé avec succès!');
            console.log('🆔 ID de l\'événement:', result.data?.id || 'Non trouvé');
            return result.data?.id;
        } else {
            console.error('❌ Erreur lors de la création:', response.status, responseData);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

createTestEvent();