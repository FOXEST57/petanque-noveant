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

async function checkEvent4() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Vérifier l'événement 4
    const [events] = await connection.execute('SELECT id, title, club_id FROM events WHERE id = 4');
    console.log('Événement 4:', events);
    
    // Vérifier les photos de l'événement 4
    const [photos] = await connection.execute('SELECT * FROM event_photos WHERE event_id = 4');
    console.log('Photos de l\'événement 4:', photos);
    
    // Vérifier avec JOIN
    const [joinResult] = await connection.execute(`
      SELECT ep.*, e.club_id as event_club_id
      FROM event_photos ep
      JOIN events e ON ep.event_id = e.id
      WHERE ep.event_id = 4
    `);
    console.log('Résultat avec JOIN:', joinResult);
    
  } finally {
    await connection.end();
  }
}

checkEvent4().catch(console.error);