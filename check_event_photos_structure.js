import mysql from 'mysql2/promise';

async function checkEventPhotosStructure() {
  let connection;
  try {
    console.log('🔄 Vérification de la structure de la table event_photos...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    // Vérifier si la table event_photos existe
    try {
      console.log('\n🏆 Structure de la table event_photos:');
      const [structure] = await connection.execute('DESCRIBE event_photos');
      structure.forEach(field => {
        console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } catch (error) {
      console.log('❌ La table event_photos n\'existe pas ou n\'est pas accessible');
      console.log('Erreur:', error.message);
    }
    
    // Vérifier les photos de l'événement 33 sans ORDER BY
    try {
      console.log('\n📋 Photos de l\'événement 33:');
      const [eventPhotos] = await connection.execute(
        'SELECT * FROM event_photos WHERE event_id = ?',
        [33]
      );
      
      console.log(`📊 Nombre de photos trouvées: ${eventPhotos.length}`);
      
      if (eventPhotos.length > 0) {
        console.log('📸 Détails des photos:');
        eventPhotos.forEach((photo, index) => {
          console.log(`  ${index + 1}. ID: ${photo.id}`);
          console.log(`     Nom de fichier: ${photo.filename}`);
          console.log(`     Nom original: ${photo.original_name}`);
          console.log(`     Chemin: ${photo.file_path}`);
          console.log(`     Taille: ${photo.file_size} bytes`);
          console.log(`     Type MIME: ${photo.mime_type}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des photos:', error.message);
    }
    
    // Vérifier l'événement 33 et son champ photos
    console.log('\n📋 Vérification de l\'événement 33:');
    const [events] = await connection.execute(
      'SELECT id, title, club_id, photos FROM events WHERE id = ?',
      [33]
    );
    
    if (events.length > 0) {
      const event = events[0];
      console.log(`✅ Événement: "${event.title}", Club: ${event.club_id}`);
      console.log(`📋 Type du champ photos: ${typeof event.photos}`);
      console.log(`📋 Contenu brut du champ photos:`, event.photos);
      
      // Essayer de convertir en string si c'est un objet
      if (typeof event.photos === 'object' && event.photos !== null) {
        console.log('📋 Conversion en JSON string:', JSON.stringify(event.photos));
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkEventPhotosStructure();