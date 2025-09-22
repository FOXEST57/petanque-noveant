const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('=== STRUCTURE TABLE EVENTS ===');
    const [eventsDesc] = await connection.execute('DESCRIBE events');
    console.table(eventsDesc);
    
    console.log('\n=== STRUCTURE TABLE TEAMS ===');
    const [teamsDesc] = await connection.execute('DESCRIBE teams');
    console.table(teamsDesc);
    
    console.log('\n=== NOMBRE D\'ENREGISTREMENTS ===');
    const [eventsCount] = await connection.execute('SELECT COUNT(*) as count FROM events');
    const [teamsCount] = await connection.execute('SELECT COUNT(*) as count FROM teams');
    console.log('Events:', eventsCount[0].count);
    console.log('Teams:', teamsCount[0].count);
    
    // Vérifier quelques enregistrements d'exemple
    console.log('\n=== EXEMPLES D\'EVENTS ===');
    const [events] = await connection.execute('SELECT * FROM events LIMIT 3');
    console.table(events);
    
    console.log('\n=== EXEMPLES DE TEAMS ===');
    const [teams] = await connection.execute('SELECT * FROM teams LIMIT 3');
    console.table(teams);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error);
  }
})();