import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

async function checkEventPhotos() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Vérifier la structure de la table event_photos
    console.log('🔍 Structure de la table event_photos:');
    const [structure] = await connection.execute('DESCRIBE event_photos');
    console.table(structure);
    
    // Vérifier s'il y a des photos dans la table
    console.log('\n📸 Photos dans la table event_photos:');
    const [photos] = await connection.execute('SELECT * FROM event_photos LIMIT 10');
    console.log('Nombre de photos:', photos.length);
    if (photos.length > 0) {
      photos.forEach((photo, index) => {
        console.log(`Photo ${index + 1}:`, {
          id: photo.id,
          event_id: photo.event_id,
          filename: photo.filename,
          club_id: photo.club_id
        });
      });
    } else {
      console.log('Aucune photo trouvée dans la table event_photos');
    }
    
    // Vérifier les événements et leurs photos
    console.log('\n🔍 Événements avec photos:');
    const [eventsWithPhotos] = await connection.execute(`
      SELECT e.id, e.title, e.club_id, COUNT(ep.id) as photo_count
      FROM events e
      LEFT JOIN event_photos ep ON e.id = ep.event_id
      WHERE e.club_id = 2
      GROUP BY e.id, e.title, e.club_id
    `);
    console.table(eventsWithPhotos);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkEventPhotos();