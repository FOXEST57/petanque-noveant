const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addPhotosToClub1Events() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petanque_noveant'
  });
  
  console.log('=== AJOUT DE PHOTOS POUR LES ÉVÉNEMENTS DU CLUB ID 1 ===');
  
  // Récupérer les événements du club ID 1
  const [events] = await connection.execute('SELECT id, title FROM events WHERE club_id = 1 ORDER BY id');
  
  // Récupérer quelques photos existantes pour les copier
  const uploadsDir = 'C:\\petanque-noveant\\uploads\\events';
  const existingPhotos = fs.readdirSync(uploadsDir).filter(file => file.endsWith('.jpeg'));
  
  console.log(`Événements du club 1 trouvés: ${events.length}`);
  console.log(`Photos disponibles: ${existingPhotos.length}`);
  
  // Pour chaque événement du club 1, ajouter 2-3 photos
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const numPhotos = Math.min(3, existingPhotos.length - i * 3); // 3 photos max par événement
    
    console.log(`\\nAjout de photos pour l'événement "${event.title}" (ID: ${event.id})`);
    
    for (let j = 0; j < numPhotos; j++) {
      const photoIndex = (i * 3 + j) % existingPhotos.length;
      const originalPhoto = existingPhotos[photoIndex];
      const newFilename = `club1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpeg`;
      
      // Copier le fichier photo
      const sourcePath = path.join(uploadsDir, originalPhoto);
      const destPath = path.join(uploadsDir, newFilename);
      fs.copyFileSync(sourcePath, destPath);
      
      // Ajouter l'entrée dans la base de données
      await connection.execute(`
        INSERT INTO event_photos (event_id, filename, original_name, file_path, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        event.id,
        newFilename,
        `Photo ${j + 1} - ${event.title}`,
        `uploads/events/${newFilename}`,
        fs.statSync(destPath).size,
        'image/jpeg'
      ]);
      
      console.log(`  ✅ Photo ajoutée: ${newFilename}`);
    }
  }
  
  // Vérifier le résultat
  console.log('\\n=== VÉRIFICATION ===');
  const [newPhotos] = await connection.execute(`
    SELECT ep.id, ep.event_id, ep.filename, e.title 
    FROM event_photos ep
    JOIN events e ON ep.event_id = e.id
    WHERE e.club_id = 1
    ORDER BY ep.event_id
  `);
  
  newPhotos.forEach(photo => {
    console.log(`Photo ID: ${photo.id}, Event: ${photo.title}, Fichier: ${photo.filename}`);
  });
  
  await connection.end();
  console.log('\\n✅ Terminé !');
}

addPhotosToClub1Events().catch(console.error);