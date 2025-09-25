import fetch from 'node-fetch';

async function checkEventsAndPhotos() {
  try {
    console.log('🔍 Test API événements publics...');
    const response = await fetch('http://localhost:3007/api/events/public', {
      headers: {
        'Host': 'noveant.localhost:3007'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      const events = result.data || result;
      console.log('✅ Événements récupérés:', events.length);
      
      // Afficher les 3 premiers événements (ceux qui seraient affichés)
      const relevantEvents = events.slice(0, 3);
      console.log('\n📅 Événements affichés sur la page d\'accueil:');
      relevantEvents.forEach((event, index) => {
        console.log(`Événement ${index + 1}:`, {
          id: event.id,
          title: event.title,
          date: event.date,
          club_id: event.club_id
        });
      });
      
      // Vérifier les photos pour chaque événement affiché
      console.log('\n📸 Vérification des photos pour ces événements:');
      for (const event of relevantEvents) {
        const photoResponse = await fetch(`http://localhost:3007/api/events/${event.id}/photos`, {
          headers: {
            'Host': 'noveant.localhost:3007'
          }
        });
        
        if (photoResponse.ok) {
          const photos = await photoResponse.json();
          console.log(`Événement ${event.id} (${event.title}): ${photos.length} photos`);
          if (photos.length > 0) {
            console.log('  Première photo:', photos[0].filename);
          }
        }
      }
      
    } else {
      console.log('❌ Erreur API:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkEventsAndPhotos();