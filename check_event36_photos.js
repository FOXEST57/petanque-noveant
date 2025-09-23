import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
});

console.log('🔍 Vérification de l\'événement 36...\n');

// 1. Vérifier l'événement dans la table events
const [events] = await connection.execute(
  'SELECT * FROM events WHERE id = ?',
  [36]
);

if (events.length > 0) {
  const event = events[0];
  console.log('📋 Événement trouvé:');
  console.log(`   - ID: ${event.id}`);
  console.log(`   - Titre: ${event.title}`);
  console.log(`   - Club: ${event.club_id}`);
  console.log(`   - Photos (JSON): ${event.photos}`);
  console.log(`   - Photos (type): ${typeof event.photos}`);
  
  // Essayer de parser le JSON
  try {
    const photosArray = JSON.parse(event.photos || '[]');
    console.log(`   - Photos (parsed): ${JSON.stringify(photosArray)}`);
    console.log(`   - Nombre de photos: ${photosArray.length}`);
  } catch (e) {
    console.log(`   - Erreur parsing JSON: ${e.message}`);
  }
} else {
  console.log('❌ Événement 36 non trouvé');
}

// 2. Vérifier la table event_photos
const [photos] = await connection.execute(
  'SELECT * FROM event_photos WHERE event_id = ?',
  [36]
);

console.log(`\n📸 Photos dans event_photos: ${photos.length}`);
photos.forEach(photo => {
  console.log(`   - ID: ${photo.id}, Filename: ${photo.filename}`);
  console.log(`   - Path: ${photo.file_path}`);
  console.log(`   - Size: ${photo.file_size} bytes`);
});

// 3. Vérifier le dossier uploads/events
const uploadsDir = path.join(process.cwd(), 'uploads', 'events');
console.log(`\n📁 Vérification du dossier: ${uploadsDir}`);

try {
  const files = fs.readdirSync(uploadsDir);
  const event36Files = files.filter(file => file.includes('event_36'));
  console.log(`   - Fichiers pour event_36: ${event36Files.length}`);
  event36Files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${stats.size} bytes)`);
  });
} catch (e) {
  console.log(`   - Erreur lecture dossier: ${e.message}`);
}

await connection.end();