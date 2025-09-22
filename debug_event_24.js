import { initDatabase, getEventPhotos } from './src/lib/database.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function debugEvent24() {
  let connection;
  try {
    await initDatabase();
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Débogage de l\'événement 24...\n');

    // 1. Vérifier si l'événement 24 existe
    const [eventRows] = await connection.execute('SELECT * FROM events WHERE id = ?', [24]);
    const event = eventRows[0];
    console.log('📅 Événement 24:', event);

    // 2. Vérifier les photos directement dans la table event_photos pour l'événement 24
    const [photosRawRows] = await connection.execute('SELECT * FROM event_photos WHERE event_id = ?', [24]);
    console.log('\n📸 Photos brutes pour l\'événement 24:', photosRawRows);

    // 3. Vérifier avec la jointure (comme dans getEventPhotos)
    const [photosWithJoinRows] = await connection.execute(`
      SELECT ep.* 
      FROM event_photos ep
      JOIN events e ON ep.event_id = e.id
      WHERE ep.event_id = ? AND e.club_id = ?
      ORDER BY ep.upload_date DESC
    `, [24, 1]);
    console.log('\n📸 Photos avec jointure pour l\'événement 24:', photosWithJoinRows);

    // 4. Utiliser la fonction getEventPhotos
    const photosFromFunction = await getEventPhotos(24, 1);
    console.log('\n📸 Photos via getEventPhotos pour l\'événement 24:', photosFromFunction);

    // 5. Vérifier toutes les photos qui ont "event_24" dans le filename
    const [photosWithEvent24Rows] = await connection.execute('SELECT * FROM event_photos WHERE filename LIKE ?', ['%event_24%']);
    console.log('\n📸 Toutes les photos avec "event_24" dans le filename:', photosWithEvent24Rows);

    // 6. Vérifier le club_id de l'événement 24
    if (event) {
      console.log('\n🏢 Club ID de l\'événement 24:', event.club_id);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

debugEvent24();