import mysql from 'mysql2/promise';

async function checkAllClubsEvents() {
  let connection;
  try {
    console.log('🔄 Vérification des événements dans tous les clubs...');
    
    // Connexion à la base de données avec les bons paramètres
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Mot de passe vide selon la configuration
      database: 'petanque_noveant'
    });
    
    // Récupérer tous les événements avec leur club
    const [events] = await connection.execute(`
      SELECT e.id, e.title, e.club_id, c.name as club_name, e.date
      FROM events e
      LEFT JOIN clubs c ON e.club_id = c.id
      ORDER BY e.club_id, e.id
    `);
    
    console.log(`📋 Nombre total d'événements: ${events.length}`);
    
    // Grouper par club
    const eventsByClub = {};
    events.forEach(event => {
      if (!eventsByClub[event.club_id]) {
        eventsByClub[event.club_id] = [];
      }
      eventsByClub[event.club_id].push(event);
    });
    
    // Afficher par club
    Object.keys(eventsByClub).forEach(clubId => {
      const clubEvents = eventsByClub[clubId];
      const clubName = clubEvents[0].club_name || 'Club inconnu';
      console.log(`\n🏆 Club ${clubId} (${clubName}) - ${clubEvents.length} événements:`);
      
      clubEvents.forEach(event => {
        console.log(`  ID: ${event.id}, Titre: ${event.title}, Date: ${event.date}`);
        
        // Chercher spécifiquement l'événement "fete de la biere"
        if (event.title && event.title.toLowerCase().includes('fete')) {
          console.log(`  🍺 TROUVÉ: Événement "fête de la bière" dans le club ${clubId}!`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAllClubsEvents();