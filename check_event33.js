import { initDatabase, getEvents, getEventPhotos } from './src/lib/database.js';
import mysql from 'mysql2/promise';

async function checkEvent33() {
  try {
    console.log('🔍 Vérification de l\'événement 33 "fete de la biere"...');
    
    // Initialiser la base de données
    await initDatabase();
    
    // Récupérer tous les événements
    const events = await getEvents();
    
    // Trouver l'événement 33
    const event33 = events.find(event => event.id === 33);
    
    if (event33) {
      console.log('📅 Événement 33 trouvé:');
      console.log({
        id: event33.id,
        title: event33.title,
        description: event33.description,
        date: event33.date,
        photos: event33.photos,
        created_at: event33.created_at,
        updated_at: event33.updated_at,
        club_id: event33.club_id
      });
      
      console.log(`📊 Nombre de photos dans le champ JSON: ${event33.photos ? event33.photos.length : 0}`);
      
      // Vérifier aussi dans la table event_photos
      const photosInTable = await getEventPhotos(event33.id);
      console.log(`📸 Photos dans event_photos pour l'événement ${event33.id}: ${photosInTable.length}`);
      
      if (photosInTable.length > 0) {
        photosInTable.forEach((photo, index) => {
          console.log(`  Photo ${index + 1}: ${photo.filename} (${photo.file_size} bytes)`);
        });
      }
      
      // Vérifier le champ photos brut dans la base
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'petanque_noveant'
      };
      
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        'SELECT id, title, photos FROM events WHERE id = ?',
        [event33.id]
      );
      
      if (rows.length > 0) {
        console.log('🔍 Champ photos brut dans la base:');
        console.log('Type:', typeof rows[0].photos);
        console.log('Contenu:', rows[0].photos);
        
        if (rows[0].photos) {
          try {
            const parsed = JSON.parse(rows[0].photos);
            console.log('✅ JSON valide, contenu parsé:', parsed);
          } catch (e) {
            console.log('❌ Erreur lors du parsing du JSON:', e.message);
          }
        }
      }
      
      await connection.end();
      
    } else {
      console.log('❌ Événement 33 non trouvé');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkEvent33();