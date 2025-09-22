const mysql = require('mysql2/promise');

async function checkEvents() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petanque_noveant'
  });
  
  console.log('=== ÉVÉNEMENTS EXISTANTS ===');
  const [events] = await connection.execute('SELECT id, title, club_id FROM events ORDER BY id');
  events.forEach(event => {
    console.log(`ID: ${event.id}, Titre: ${event.title}, Club ID: ${event.club_id}`);
  });
  
  console.log('\n=== PHOTOS D\'ÉVÉNEMENTS ===');
  const [photos] = await connection.execute('SELECT id, event_id, filename FROM event_photos ORDER BY event_id');
  photos.forEach(photo => {
    console.log(`Photo ID: ${photo.id}, Event ID: ${photo.event_id}, Fichier: ${photo.filename}`);
  });
  
  console.log('\n=== CLUBS EXISTANTS ===');
  const [clubs] = await connection.execute('SELECT id, nom FROM clubs ORDER BY id');
  clubs.forEach(club => {
    console.log(`Club ID: ${club.id}, Nom: ${club.nom}`);
  });
  
  await connection.end();
}

checkEvents().catch(console.error);