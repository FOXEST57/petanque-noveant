import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function checkEventBoules() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Chercher l'événement 'boules'
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE title LIKE "%boules%" ORDER BY id DESC LIMIT 5'
    );
    
    console.log('🔍 Événements contenant "boules":');
    events.forEach(event => {
      console.log(`- ID: ${event.id}, Titre: ${event.title}, Club ID: ${event.club_id}, Date: ${event.date}`);
    });
    
    if (events.length > 0) {
      const latestEvent = events[0];
      console.log('\n📊 Dernier événement "boules" trouvé:');
      console.log(JSON.stringify(latestEvent, null, 2));
      
      // Vérifier s'il y a des photos pour cet événement
      const [photos] = await connection.execute(
        'SELECT * FROM event_photos WHERE event_id = ?',
        [latestEvent.id]
      );
      
      console.log(`\n📸 Photos pour l'événement ${latestEvent.id}:`, photos.length);
      if (photos.length > 0) {
        photos.forEach(photo => {
          console.log(`- ${photo.filename} (${photo.file_size} bytes)`);
        });
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkEventBoules();