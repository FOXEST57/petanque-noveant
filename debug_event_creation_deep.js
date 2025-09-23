import mysql from 'mysql2/promise';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuration de la base de données
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'petanque_noveant'
};

async function debugEventCreation() {
    console.log('🔍 DÉBOGAGE APPROFONDI - CRÉATION D\'ÉVÉNEMENT ET UPLOAD PHOTOS');
    console.log('================================================================');
    
    let connection;
    
    try {
        // 1. Connexion à la base de données
        console.log('\n1️⃣ Connexion à la base de données...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion établie');
        
        // 2. Vérifier la structure de la table events
        console.log('\n2️⃣ Vérification de la structure de la table events...');
        const [tableStructure] = await connection.execute('DESCRIBE events');
        console.log('Structure de la table events:');
        tableStructure.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
        });
        
        // 3. Test de création d'événement via API
        console.log('\n3️⃣ Test de création d\'événement via API...');
        
        // Récupérer un token valide
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test_club1@test.com',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Token obtenu:', token.substring(0, 20) + '...');
        
        // Créer un événement de test
        const eventData = {
            titre: `Test Debug Event ${Date.now()}`,
            description: 'Événement de test pour débogage',
            date: new Date().toISOString().split('T')[0],
            heure: '14:00',
            lieu: 'Terrain de test',
            prix: 10,
            max_participants: 20
        };
        
        console.log('📤 Envoi des données d\'événement:', eventData);
        
        const createResponse = await fetch('http://localhost:3002/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });
        
        console.log('📥 Statut de la réponse:', createResponse.status);
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error('❌ Erreur lors de la création:', errorText);
            return;
        }
        
        const createResult = await createResponse.json();
        console.log('✅ Événement créé - Réponse complète:', JSON.stringify(createResult, null, 2));
        
        // Analyser la structure de la réponse
        console.log('\n4️⃣ Analyse de la réponse de création...');
        console.log('Type de la réponse:', typeof createResult);
        console.log('Propriétés disponibles:', Object.keys(createResult));
        
        let eventId;
        if (createResult.data && createResult.data.id) {
            eventId = createResult.data.id;
            console.log('✅ ID trouvé dans createResult.data.id:', eventId);
        } else if (createResult.id) {
            eventId = createResult.id;
            console.log('✅ ID trouvé dans createResult.id:', eventId);
        } else {
            console.error('❌ Aucun ID trouvé dans la réponse!');
            console.log('Structure complète:', createResult);
            return;
        }
        
        // 5. Vérifier l'événement dans la base de données
        console.log('\n5️⃣ Vérification dans la base de données...');
        const [dbEvents] = await connection.execute('SELECT * FROM events WHERE id = ?', [eventId]);
        if (dbEvents.length > 0) {
            console.log('✅ Événement trouvé dans la DB:', dbEvents[0]);
        } else {
            console.error('❌ Événement non trouvé dans la DB!');
        }
        
        // 6. Test d'upload de photos
        console.log('\n6️⃣ Test d\'upload de photos...');
        
        // Créer un fichier de test temporaire
        const testImagePath = path.join(process.cwd(), 'test-image-debug.txt');
        fs.writeFileSync(testImagePath, 'Test image content for debugging');
        
        const formData = new FormData();
        formData.append('photos', fs.createReadStream(testImagePath), {
            filename: 'test-image.txt',
            contentType: 'text/plain'
        });
        
        const uploadUrl = `http://localhost:3002/api/events/${eventId}/photos`;
        console.log('📤 URL d\'upload:', uploadUrl);
        console.log('📤 Type d\'eventId:', typeof eventId);
        console.log('📤 Valeur d\'eventId:', eventId);
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log('📥 Statut upload:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('❌ Erreur upload:', errorText);
        } else {
            const uploadResult = await uploadResponse.json();
            console.log('✅ Upload réussi:', uploadResult);
        }
        
        // Nettoyer le fichier de test
        fs.unlinkSync(testImagePath);
        
        // 7. Vérifier les photos dans la base de données
        console.log('\n7️⃣ Vérification des photos dans la DB...');
        const [dbPhotos] = await connection.execute('SELECT * FROM event_photos WHERE event_id = ?', [eventId]);
        console.log('Photos trouvées:', dbPhotos);
        
    } catch (error) {
        console.error('❌ ERREUR CRITIQUE:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

// Exécuter le débogage
debugEventCreation().catch(console.error);