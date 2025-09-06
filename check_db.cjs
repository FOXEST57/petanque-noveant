const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/petanque.db');

console.log('🔍 Vérification de la base de données...');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Erreur lors de l\'ouverture:', err);
    return;
  }
  
  console.log('✅ Base de données ouverte en lecture seule');
  
  // Vérifier les événements
  db.all('SELECT id, title FROM events', (err, events) => {
    if (err) {
      console.error('❌ Erreur events:', err);
      return;
    }
    console.log('📅 Événements:', events.length);
    events.forEach(e => console.log(`  - ID: ${e.id}, Titre: ${e.title}`));
    
    // Vérifier les photos d'événements
    db.all('SELECT * FROM event_photos', (err, photos) => {
      if (err) {
        console.error('❌ Erreur event_photos:', err);
        return;
      }
      console.log('📸 Photos d\'événements:', photos.length);
      photos.forEach(p => console.log(`  - ID: ${p.id}, Event: ${p.event_id}, Fichier: ${p.filename}`));
      
      db.close();
    });
  });
});