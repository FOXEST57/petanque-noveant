import { initDatabase, getEvents, getEventPhotos } from '../src/lib/database.js';

const checkEvents = async () => {
  try {
    console.log('Initialisation de la base de données...');
    await initDatabase();
    
    console.log('Vérification des événements restants...');
    const events = await getEvents();
    console.log(`Nombre d'événements: ${events.length}`);
    
    console.log('\nDétail des événements et leurs photos:');
    for (const event of events) {
      const photos = await getEventPhotos(event.id);
      console.log(`- Événement ${event.id}: "${event.title}" (${event.date}) - ${photos.length} photos`);
      
      if (photos.length > 0) {
        photos.forEach((photo, index) => {
          console.log(`  Photo ${index + 1}: ${photo.filename}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  }
};

checkEvents();