import { getEvents } from './src/lib/database.js';

async function checkAllEvents() {
  try {
    console.log('🔄 Vérification de tous les événements...');
    
    // Récupérer tous les événements pour le club 2 (club de l'utilisateur admin2@test.com)
    const events = await getEvents(2);
    
    console.log(`📋 Nombre d'événements trouvés: ${events.length}`);
    
    events.forEach(event => {
      console.log(`ID: ${event.id}, Titre: ${event.title}, Date: ${event.date}, Photos: ${event.photos ? event.photos.length : 0}`);
    });
    
    // Chercher spécifiquement l'événement "fete de la biere"
    const feteEvent = events.find(e => e.title && e.title.toLowerCase().includes('fete'));
    if (feteEvent) {
      console.log('\n🍺 Événement "fête de la bière" trouvé:');
      console.log(`ID: ${feteEvent.id}, Titre: ${feteEvent.title}, Club ID: ${feteEvent.club_id}`);
    } else {
      console.log('\n❌ Aucun événement "fête de la bière" trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAllEvents();