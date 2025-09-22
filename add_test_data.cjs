const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('=== AJOUT DE DONNÉES DE TEST ===');
    
    // Ajouter quelques événements de test
    const eventsToAdd = [
      {
        title: 'Tournoi de Printemps',
        description: 'Grand tournoi annuel de pétanque pour tous les niveaux',
        date: '2025-04-15',
        heure: '14:00',
        lieu: 'Terrain principal',
        publicCible: 'Tous',
        club_id: 2
      },
      {
        title: 'Concours des Débutants',
        description: 'Concours spécialement organisé pour les nouveaux membres',
        date: '2025-03-20',
        heure: '10:00',
        lieu: 'Terrain d\'entraînement',
        publicCible: 'Débutants',
        club_id: 2
      },
      {
        title: 'Championnat Inter-clubs',
        description: 'Rencontre avec les clubs voisins',
        date: '2025-05-10',
        heure: '09:00',
        lieu: 'Complexe sportif',
        publicCible: 'Équipes',
        club_id: 2
      }
    ];
    
    for (const event of eventsToAdd) {
      try {
        await connection.execute(
          'INSERT INTO events (title, description, date, heure, lieu, publicCible, club_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [event.title, event.description, event.date, event.heure, event.lieu, event.publicCible, event.club_id]
        );
        console.log(`✅ Événement ajouté: ${event.title}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Événement déjà existant: ${event.title}`);
        } else {
          console.error(`❌ Erreur pour ${event.title}:`, err.message);
        }
      }
    }
    
    // Vérifier le nombre d'événements
    const [eventsCount] = await connection.execute('SELECT COUNT(*) as count FROM events WHERE club_id = 2');
    console.log(`\n📊 Total événements pour le club 2: ${eventsCount[0].count}`);
    
    // Vérifier le nombre d'équipes
    const [teamsCount] = await connection.execute('SELECT COUNT(*) as count FROM teams WHERE club_id = 2');
    console.log(`📊 Total équipes pour le club 2: ${teamsCount[0].count}`);
    
    await connection.end();
    console.log('\n✅ Script terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();