import mysql from 'mysql2/promise';

async function checkPhotosEvent33() {
  let connection;
  try {
    console.log('🔄 Vérification des photos de l\'événement 33 dans la base de données...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    // Vérifier l'événement 33
    const [events] = await connection.execute(
      'SELECT id, title, club_id, photos FROM events WHERE id = ?',
      [33]
    );
    
    if (events.length === 0) {
      console.log('❌ Événement 33 non trouvé');
      return;
    }
    
    const event = events[0];
    console.log(`✅ Événement trouvé: "${event.title}", Club: ${event.club_id}`);
    console.log(`📋 Champ photos (JSON): ${event.photos}`);
    
    // Parser le JSON des photos
    let photosArray = [];
    try {
      photosArray = JSON.parse(event.photos || '[]');
      console.log(`📊 Nombre de photos dans le champ JSON: ${photosArray.length}`);
      if (photosArray.length > 0) {
        console.log('📸 Photos dans le JSON:');
        photosArray.forEach((photo, index) => {
          console.log(`  ${index + 1}. ${photo}`);
        });
      }
    } catch (error) {
      console.log('❌ Erreur lors du parsing JSON:', error.message);
    }
    
    // Vérifier la table event_photos
    const [eventPhotos] = await connection.execute(
      'SELECT * FROM event_photos WHERE event_id = ? ORDER BY created_at DESC',
      [33]
    );
    
    console.log(`📊 Nombre de photos dans la table event_photos: ${eventPhotos.length}`);
    
    if (eventPhotos.length > 0) {
      console.log('📸 Photos dans la table event_photos:');
      eventPhotos.forEach((photo, index) => {
        console.log(`  ${index + 1}. ID: ${photo.id}`);
        console.log(`     Nom de fichier: ${photo.filename}`);
        console.log(`     Nom original: ${photo.original_name}`);
        console.log(`     Chemin: ${photo.file_path}`);
        console.log(`     Taille: ${photo.file_size} bytes`);
        console.log(`     Type MIME: ${photo.mime_type}`);
        console.log(`     Créé le: ${photo.created_at}`);
        console.log('');
      });
    }
    
    // Vérifier la cohérence entre les deux sources
    if (photosArray.length !== eventPhotos.length) {
      console.log('⚠️  INCOHÉRENCE: Le nombre de photos diffère entre le champ JSON et la table event_photos');
      console.log(`   - Champ JSON: ${photosArray.length} photos`);
      console.log(`   - Table event_photos: ${eventPhotos.length} photos`);
    } else {
      console.log('✅ Cohérence: Le nombre de photos correspond entre les deux sources');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPhotosEvent33();