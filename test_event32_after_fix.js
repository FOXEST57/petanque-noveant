import { initDatabase, getEvents } from './src/lib/database.js';

async function testEvent32() {
  try {
    console.log('🔍 Test de l\'événement 32 après correction...');
    
    // Initialiser la base de données
    await initDatabase();
    
    // Récupérer tous les événements
    const events = await getEvents();
    
    // Trouver l'événement 32
    const event32 = events.find(event => event.id === 32);
    
    if (event32) {
      console.log('📅 Événement 32 trouvé:');
      console.log({
        id: event32.id,
        title: event32.title,
        description: event32.description,
        date: event32.date,
        photos: event32.photos,
        created_at: event32.created_at,
        updated_at: event32.updated_at,
        club_id: event32.club_id
      });
      
      console.log(`📊 Nombre de photos dans le champ JSON: ${event32.photos ? event32.photos.length : 0}`);
      
      if (event32.photos && event32.photos.length > 0) {
        console.log('✅ Les photos sont maintenant correctement récupérées!');
        event32.photos.forEach((photo, index) => {
          console.log(`  Photo ${index + 1}: ${photo.filename}`);
        });
      } else {
        console.log('❌ Aucune photo trouvée dans le champ JSON');
      }
    } else {
      console.log('❌ Événement 32 non trouvé');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testEvent32();