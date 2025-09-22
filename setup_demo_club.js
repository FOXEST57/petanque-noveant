import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
});

console.log('🎯 Configuration du Club de Démonstration (ID: 1)');
console.log('================================================\n');

try {
  // 1. Mettre à jour les informations de base du club
  console.log('📝 Mise à jour des informations de base...');
  await connection.execute(`
    UPDATE clubs 
    SET nom = 'Club de Pétanque Démonstration',
        ville = '',
        description = 'Site de démonstration présentant toutes les fonctionnalités de la plateforme de gestion de clubs de pétanque',
        subdomain = 'demo'
    WHERE id = 1
  `);
  console.log('✅ Informations de base mises à jour\n');

  // 2. Mettre à jour le contenu de la page d'accueil
  console.log('🏠 Configuration du contenu de la page d\'accueil...');
  await connection.execute(`
    INSERT INTO home_content (
      club_id, title, description, schedules, contact, practical_info, location, members,
      club_title, club_description, teams_content, animations_content, tournaments_content
    ) VALUES (
      1,
      'Bienvenue au Club de Pétanque Démonstration',
      'Découvrez toutes les fonctionnalités de notre plateforme de gestion de clubs',
      'Ouvert tous les jours de 9h à 18h',
      'Téléphone: 01 23 45 67 89\\nEmail: demo@petanque-club.fr',
      'Parking gratuit disponible\\nAccès handicapés\\nBuvette sur place',
      'Place de la Pétanque\\n12345 Ville Démonstration',
      'Notre club compte plus de 100 membres actifs de tous âges',
      'Un club moderne et convivial',
      'Notre club de démonstration vous présente toutes les possibilités offertes par cette plateforme : gestion des membres, organisation d événements, boutique du bar, et bien plus encore !',
      'Nos équipes participent à de nombreuses compétitions locales et régionales',
      'Animations hebdomadaires : concours, initiations, soirées thématiques',
      'Tournois mensuels ouverts à tous les niveaux'
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      description = VALUES(description),
      schedules = VALUES(schedules),
      contact = VALUES(contact),
      practical_info = VALUES(practical_info),
      location = VALUES(location),
      members = VALUES(members),
      club_title = VALUES(club_title),
      club_description = VALUES(club_description),
      teams_content = VALUES(teams_content),
      animations_content = VALUES(animations_content),
      tournaments_content = VALUES(tournaments_content)
  `);
  console.log('✅ Contenu de la page d\'accueil configuré\n');

  // 3. Ajouter des images de carrousel
  console.log('🖼️ Ajout des images de carrousel...');
  
  const carouselImages = [
    {
      url: '/image/BOULES TIR 1920X1080.jpg',
      title: 'Terrain de pétanque'
    },
    {
      url: '/image/partie de petanque.jpeg',
      title: 'Partie en cours'
    },
    {
      url: '/image/joueur de petanque.jpeg',
      title: 'Nos joueurs'
    },
    {
      url: '/image/boules et cochonet.jpeg',
      title: 'Équipement'
    }
  ];

  // Supprimer les anciennes images du carrousel pour le club 1
  await connection.execute('DELETE FROM home_carousel_images WHERE club_id = 1');

  for (const [index, image] of carouselImages.entries()) {
        await connection.execute(`
            INSERT INTO home_carousel_images (club_id, image_url, title, display_order)
            VALUES (1, ?, ?, ?)
        `, [image.url, image.title, index + 1]);
    }
  console.log(`✅ ${carouselImages.length} images de carrousel ajoutées\n`);

  // 4. Créer des événements de démonstration
  console.log('📅 Création d\'événements de démonstration...');
  
  const events = [
    {
      title: 'Tournoi de Printemps',
      description: 'Grand tournoi annuel ouvert à tous les licenciés. Inscription obligatoire avant le 15 mars.',
      date: '2025-03-20',
      heure: '09:00',
      lieu: 'Terrain principal',
      publicCible: 'Tous niveaux',
      photos: ['/image/des joueurs de petanque avec des boules au sol.jpeg']
    },
    {
      title: 'Initiation Pétanque',
      description: 'Séance d\'initiation gratuite pour les débutants. Matériel fourni par le club.',
      date: '2025-02-15',
      heure: '14:00',
      lieu: 'Terrain d\'entraînement',
      publicCible: 'Débutants',
      photos: ['/image/joueuse de petanque.jpeg']
    },
    {
      title: 'Concours Nocturne',
      description: 'Concours en soirée avec éclairage. Ambiance garantie !',
      date: '2025-02-28',
      heure: '19:00',
      lieu: 'Terrain éclairé',
      publicCible: 'Membres du club',
      photos: ['/image/boule au sol en fin de journee.jpeg']
    }
  ];

  // Supprimer les anciens événements du club 1
  await connection.execute('DELETE FROM events WHERE club_id = 1');

  for (const event of events) {
    await connection.execute(`
      INSERT INTO events (club_id, title, description, date, heure, lieu, publicCible, photos)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `, [event.title, event.description, event.date, event.heure, event.lieu, event.publicCible, JSON.stringify(event.photos)]);
  }
  console.log(`✅ ${events.length} événements créés\n`);

  // 5. Créer des équipes de démonstration
  console.log('👥 Création d\'équipes de démonstration...');
  
  const teams = [
    {
      name: 'Les Champions',
      category: 'Vétérans',
      description: 'Équipe expérimentée participant aux championnats régionaux',
      photo_url: '/image/des joueurs de petanque avec des boules au sol.jpeg',
      competition: 'Championnat Régional'
    },
    {
      name: 'Les Débutants',
      category: 'Loisir',
      description: 'Équipe conviviale pour les nouveaux membres',
      photo_url: '/image/joueuse de petanque.jpeg',
      competition: 'Tournois locaux'
    },
    {
      name: 'Les Jeunes Pousses',
      category: 'Jeunes',
      description: 'Équipe des moins de 18 ans, l\'avenir du club !',
      photo_url: '/image/joueur de petanque.jpeg',
      competition: 'Championnat Jeunes'
    }
  ];

  // Supprimer les anciennes équipes du club 1
  await connection.execute('DELETE FROM teams WHERE club_id = 1');

  for (const team of teams) {
    await connection.execute(`
      INSERT INTO teams (club_id, name, category, description, photo_url, competition)
      VALUES (1, ?, ?, ?, ?, ?)
    `, [team.name, team.category, team.description, team.photo_url, team.competition]);
  }
  console.log(`✅ ${teams.length} équipes créées\n`);

  // 6. Ajouter des boissons au bar
  console.log('🍺 Configuration du bar...');
  
  const drinks = [
    {
      name: 'Bière Pression',
      price: 2.50,
      description: 'Bière fraîche à la pression',
      image_url: '/image/bierre pression.jpg',
      stock: 50
    },
    {
      name: 'Bière Bouteille',
      price: 2.00,
      description: 'Bière en bouteille 33cl',
      image_url: '/image/bierre bouteille.jpg',
      stock: 30
    },
    {
      name: 'Vin Rouge',
      price: 3.00,
      description: 'Verre de vin rouge du pays',
      image_url: '/image/verre de vin.jpg',
      stock: 20
    },
    {
      name: 'Ricard',
      price: 2.50,
      description: 'Pastis traditionnel',
      image_url: '/image/ricard.jpg',
      stock: 15
    },
    {
      name: 'Café',
      price: 1.50,
      description: 'Café expresso',
      image_url: '/image/cafe.jpg',
      stock: 100
    },
    {
      name: 'Soda',
      price: 2.00,
      description: 'Boisson gazeuse fraîche',
      image_url: '/image/soda.jpg',
      stock: 25
    }
  ];

  // Supprimer les anciennes boissons du club 1
  await connection.execute('DELETE FROM drinks WHERE club_id = 1');

  for (const drink of drinks) {
    await connection.execute(`
      INSERT INTO drinks (club_id, name, price, description, image_url, stock)
      VALUES (1, ?, ?, ?, ?, ?)
    `, [drink.name, drink.price, drink.description, drink.image_url, drink.stock]);
  }
  console.log(`✅ ${drinks.length} boissons ajoutées au bar\n`);

  console.log('🎉 Configuration terminée avec succès !');
  console.log('Le club de démonstration est maintenant prêt.');
  console.log('Accédez-y via : http://demo.localhost:5174/');

} catch (error) {
  console.error('❌ Erreur lors de la configuration:', error);
} finally {
  await connection.end();
}