import { initDatabase, getEvents, getEventPhotos } from './src/lib/database.js';
import mysql from 'mysql2/promise';

async function checkFeteBiere() {
  try {
    console.log('🔍 Recherche de l\'événement "Fête de la bière"...');
    
    // Initialiser la base de données
    await initDatabase();
    
    // Récupérer tous les événements
    const events = await getEvents();
    
    // Chercher l'événement "Fête de la bière"
    const feteBiere = events.find(event => 
      event.title && event.title.toLowerCase().includes('fête') && 
      event.title.toLowerCase().includes('bière')
    );
    
    if (feteBiere) {
      console.log('📅 Événement "Fête de la bière" trouvé:');
      console.log({
        id: feteBiere.id,
        title: feteBiere.title,
        description: feteBiere.description,
        date: feteBiere.date,
        photos: feteBiere.photos,
        created_at: feteBiere.created_at,
        updated_at: feteBiere.updated_at,
        club_id: feteBiere.club_id
      });
      
      console.log(`📊 Nombre de photos dans le champ JSON: ${feteBiere.photos ? feteBiere.photos.length : 0}`);
      
      // Vérifier aussi dans la table event_photos
      const photosInTable = await getEventPhotos(feteBiere.id);
      console.log(`📸 Photos dans event_photos pour l'événement ${feteBiere.id}: ${photosInTable.length}`);
      
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
        [feteBiere.id]
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
      console.log('❌ Événement "Fête de la bière" non trouvé');
      console.log('📋 Événements disponibles:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title} (ID: ${event.id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkFeteBiere();