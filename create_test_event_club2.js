import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function createTestEvent() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Créer un événement pour le club 2
    const [result] = await connection.execute(
      'INSERT INTO events (title, description, date, lieu, club_id) VALUES (?, ?, ?, ?, ?)',
      ['Test Upload Photos', 'Événement de test pour upload photos', '2025-02-01', 'Test Location', 2]
    );
    
    console.log('✅ Événement créé avec ID:', result.insertId);
    
    await connection.end();
    return result.insertId;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestEvent();