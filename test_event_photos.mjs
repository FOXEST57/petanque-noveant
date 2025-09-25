import { getEventPhotos } from './src/lib/database.js';

async function testEventPhotos() {
  try {
    console.log('Test 1: Événement 4, Club 2');
    const photos1 = await getEventPhotos(4, 2);
    console.log('Photos trouvées:', JSON.stringify(photos1, null, 2));
    
    console.log('\nTest 2: Événement 4, Club 1');
    const photos2 = await getEventPhotos(4, 1);
    console.log('Photos trouvées:', JSON.stringify(photos2, null, 2));
    
    console.log('\nTest 3: Tous les événements avec photos');
    // Vérifier s'il y a des photos dans la table
    const db = await import('./src/lib/database.js');
    const query = `
      SELECT ep.*, e.title, e.club_id 
      FROM event_photos ep 
      JOIN events e ON ep.event_id = e.id 
      ORDER BY ep.event_id, ep.id
    `;
    
    // Utiliser la connexion directe pour cette requête
    const sqlite3 = await import('sqlite3');
    const { Database } = sqlite3.default;
    const dbConnection = new Database('./database.db');
    
    dbConnection.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur requête:', err);
      } else {
        console.log('Toutes les photos d\'événements:', JSON.stringify(rows, null, 2));
      }
      dbConnection.close();
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testEventPhotos();