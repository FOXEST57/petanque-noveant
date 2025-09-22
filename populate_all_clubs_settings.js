import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

// Paramètres de base pour tous les clubs
const baseSettings = [
  { key: 'site_name', value: 'Club de Pétanque', type: 'string' },
  { key: 'primary_color', value: '#425e9b', type: 'string' },
  { key: 'phone_visible', value: 'true', type: 'boolean' },
  { key: 'logo_url', value: '', type: 'string' },
  { key: 'favicon_url', value: '', type: 'string' },
  { key: 'facebook_url', value: '', type: 'string' },
  { key: 'instagram_url', value: '', type: 'string' },
  { key: 'whatsapp_url', value: '', type: 'string' },
  { key: 'tiktok_url', value: '', type: 'string' }
];

// Paramètres spécifiques par club
const clubSpecificSettings = {
  1: {
    site_subtitle: 'Noveant sur moselle',
    club_name: 'Club de Pétanque de Noveant',
    club_description: 'Club convivial de pétanque à Noveant-sur-Moselle. Venez découvrir notre passion !',
    club_address: 'Noveant-sur-Moselle, France',
    club_phone: '03.87.XX.XX.XX',
    club_email: 'contact@petanque-noveant.fr',
    ffpjp_id: '5701'
  },
  2: {
    site_subtitle: 'Lyon',
    club_name: 'Pétanque Club Lyonnais',
    club_description: 'Club de pétanque lyonnais fondé en 1968. Tradition et convivialité au cœur de Lyon !',
    club_address: '15 Rue de la République, 69002 Lyon',
    club_phone: '04.78.XX.XX.XX',
    club_email: 'contact@petanque-lyon.fr',
    ffpjp_id: '6901'
  },
  3: {
    site_subtitle: 'Marseille',
    club_name: 'Boule Marseillaise',
    club_description: 'Le plus ancien club de pétanque de Marseille. Venez jouer sous le soleil provençal !',
    club_address: '42 La Canebière, 13001 Marseille',
    club_phone: '04.91.XX.XX.XX',
    club_email: 'secretariat@boule-marseille.fr',
    ffpjp_id: '1301'
  },
  4: {
    site_subtitle: 'Toulouse',
    club_name: 'AS Pétanque Toulousaine',
    club_description: 'Association sportive de pétanque toulousaine. Venez découvrir la convivialité du Sud-Ouest !',
    club_address: '88 Boulevard de Strasbourg, 31000 Toulouse',
    club_phone: '05.61.XX.XX.XX',
    club_email: 'contact@petanque-toulouse.fr',
    ffpjp_id: '3104'
  },
  5: {
    site_subtitle: 'Nice',
    club_name: 'Club Bouliste Niçois',
    club_description: 'Club de pétanque niçois avec vue sur la Méditerranée. Cadre exceptionnel pour jouer !',
    club_address: '25 Promenade des Anglais, 06000 Nice',
    club_phone: '04.93.XX.XX.XX',
    club_email: 'secretariat@bouliste-nice.fr',
    ffpjp_id: '0605'
  }
};

async function populateAllClubsSettings() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== POPULATION DES PARAMÈTRES POUR TOUS LES CLUBS ===\n');
    
    // Récupérer tous les clubs
    const [clubs] = await connection.execute('SELECT id, nom FROM clubs ORDER BY id');
    console.log(`Clubs trouvés: ${clubs.length}`);
    console.table(clubs);
    
    for (const club of clubs) {
      const clubId = club.id;
      console.log(`\n--- Traitement du club ${clubId}: ${club.nom} ---`);
      
      // Paramètres de base pour tous les clubs
      for (const setting of baseSettings) {
        await connection.execute(
          `INSERT INTO site_settings (club_id, setting_key, setting_value, setting_type) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value),
           setting_type = VALUES(setting_type),
           updated_at = CURRENT_TIMESTAMP`,
          [clubId, setting.key, setting.value, setting.type]
        );
        console.log(`  ✅ ${setting.key} = "${setting.value}"`);
      }
      
      // Paramètres spécifiques au club
      const specificSettings = clubSpecificSettings[clubId];
      if (specificSettings) {
        for (const [key, value] of Object.entries(specificSettings)) {
          await connection.execute(
            `INSERT INTO site_settings (club_id, setting_key, setting_value, setting_type) 
             VALUES (?, ?, ?, 'string') 
             ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value),
             updated_at = CURRENT_TIMESTAMP`,
            [clubId, key, value]
          );
          console.log(`  ✅ ${key} = "${value}"`);
        }
      } else {
        // Utiliser des valeurs génériques pour les clubs sans paramètres spécifiques
        const genericSettings = {
          site_subtitle: club.nom,
          club_name: club.nom,
          club_description: `Bienvenue au ${club.nom}. Rejoignez-nous pour partager notre passion de la pétanque !`,
          club_address: '',
          club_phone: '',
          club_email: '',
          ffpjp_id: ''
        };
        
        for (const [key, value] of Object.entries(genericSettings)) {
          await connection.execute(
            `INSERT INTO site_settings (club_id, setting_key, setting_value, setting_type) 
             VALUES (?, ?, ?, 'string') 
             ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value),
             updated_at = CURRENT_TIMESTAMP`,
            [clubId, key, value]
          );
          console.log(`  ✅ ${key} = "${value}"`);
        }
      }
    }
    
    console.log('\n=== VÉRIFICATION FINALE ===\n');
    
    // Vérifier les paramètres pour chaque club
    for (const club of clubs) {
      const [settings] = await connection.execute(
        'SELECT COUNT(*) as count FROM site_settings WHERE club_id = ?',
        [club.id]
      );
      console.log(`Club ${club.id} (${club.nom}): ${settings[0].count} paramètres`);
    }
    
    await connection.end();
    console.log('\n✅ Population terminée avec succès!');
    console.log('\n🔄 Vous pouvez maintenant tester la sélection de club.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

populateAllClubsSettings();