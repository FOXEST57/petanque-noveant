import mysql from 'mysql2/promise';

async function checkDatabaseStructure() {
  let connection;
  try {
    console.log('🔄 Vérification de la structure de la base de données...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    // Lister toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables disponibles:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Vérifier la structure de la table events
    console.log('\n🏆 Structure de la table events:');
    const [eventsStructure] = await connection.execute('DESCRIBE events');
    eventsStructure.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Vérifier si la table clubs existe
    try {
      console.log('\n🏆 Structure de la table clubs:');
      const [clubsStructure] = await connection.execute('DESCRIBE clubs');
      clubsStructure.forEach(field => {
        console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } catch (error) {
      console.log('❌ La table clubs n\'existe pas ou n\'est pas accessible');
    }
    
    // Récupérer tous les événements sans jointure
    console.log('\n📋 Tous les événements:');
    const [events] = await connection.execute(`
      SELECT id, title, club_id, date, photos
      FROM events
      ORDER BY id
    `);
    
    console.log(`Nombre total d'événements: ${events.length}`);
    events.forEach(event => {
      console.log(`  ID: ${event.id}, Titre: "${event.title}", Club: ${event.club_id}, Date: ${event.date}`);
      
      // Chercher l'événement "fete de la biere"
      if (event.title && event.title.toLowerCase().includes('fete')) {
        console.log(`  🍺 TROUVÉ: Événement "fête de la bière" ID ${event.id} dans le club ${event.club_id}!`);
        console.log(`     Photos: ${event.photos}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabaseStructure();