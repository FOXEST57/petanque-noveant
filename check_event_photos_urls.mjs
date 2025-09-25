import fetch from 'node-fetch';

async function checkEventPhotos() {
  try {
    // Récupérer les événements publics avec le bon header
    const eventsResponse = await fetch('http://localhost:3007/api/events/public', {
      headers: {
        'Host': 'noveant.localhost:3007'
      }
    });
    const eventsData = await eventsResponse.json();
    
    console.log('📅 Réponse API:', eventsData);
    
    const events = eventsData.data || eventsData.events || eventsData;
    console.log('📅 Événements publics:', events?.length || 'undefined');
    
    if (!events || !Array.isArray(events)) {
      console.log('❌ Pas d\'événements trouvés');
      return;
    }
    
    for (const event of events.slice(0, 2)) {
      console.log('\n🎯 Événement:', event.id, '-', event.title);
      
      // Les photos sont déjà incluses dans l'événement
      const photos = event.photos || [];
      console.log('📸 Photos:', photos.length);
      
      if (photos.length > 0) {
        console.log('🖼️ Première photo:', photos[0]);
        
        // Construire l'URL comme le fait EventCarousel
        const imageUrl = `http://localhost:3007/uploads/events/${photos[0].filename}`;
        console.log('🔗 URL construite:', imageUrl);
        
        // Tester l'accès
        const imageResponse = await fetch(imageUrl);
        console.log('✅ Status:', imageResponse.status);
        
        // Vérifier si le fichier existe physiquement
        console.log('📁 Filename dans DB:', photos[0].filename);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkEventPhotos();