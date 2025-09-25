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

async function checkEvents() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [events] = await connection.execute('SELECT id, title, photos, club_id FROM events WHERE club_id = 1');
    console.log('Événements existants:', JSON.stringify(events, null, 2));
    
    const [photos] = await connection.execute('SELECT * FROM event_photos WHERE event_id IN (SELECT id FROM events WHERE club_id = 1)');
    console.log('Photos d\'événements:', JSON.stringify(photos, null, 2));
  } finally {
    await connection.end();
  }
}

checkEvents().catch(console.error);