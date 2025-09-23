import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function checkEvent() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si l'événement 29 existe
    const [events] = await connection.execute(
      'SELECT id, title, club_id FROM events WHERE id = 29'
    );
    
    if (events.length === 0) {
      console.log('❌ Événement 29 non trouvé');
    } else {
      console.log('✅ Événement trouvé:', events[0]);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkEvent();