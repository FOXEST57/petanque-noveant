import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function populateSiteSettings() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== AJOUT DE DONNÉES DE TEST POUR LES PARAMÈTRES DU SITE ===\n');
    
    // Données de test pour les champs manquants
    const siteSettingsData = [
      { key: 'club_address', value: '123 Rue de la Pétanque, 57680 Noveant-sur-Moselle' },
      { key: 'ffpjp_id', value: '57123456' },
      { key: 'club_phone', value: '03 87 12 34 56' },
      { key: 'club_email', value: 'contact@petanque-noveant.fr' },
      { key: 'club_description', value: 'Club de pétanque convivial situé à Noveant-sur-Moselle. Nous accueillons tous les joueurs, débutants comme confirmés, dans une ambiance chaleureuse et sportive.' },
      { key: 'facebook_url', value: 'https://facebook.com/petanque-noveant' },
      { key: 'instagram_url', value: 'https://instagram.com/petanque_noveant' }
    ];
    
    console.log('Insertion des données de test...');
    
    for (const setting of siteSettingsData) {
      // Vérifier si le paramètre existe déjà
      const [existing] = await connection.execute(
        'SELECT id FROM site_settings WHERE club_id = 1 AND setting_key = ?',
        [setting.key]
      );
      
      if (existing.length > 0) {
        // Mettre à jour la valeur existante
        await connection.execute(
          'UPDATE site_settings SET setting_value = ? WHERE club_id = 1 AND setting_key = ?',
          [setting.value, setting.key]
        );
        console.log(`✅ Mis à jour: ${setting.key} = "${setting.value}"`);
      } else {
        // Insérer une nouvelle entrée
        await connection.execute(
          'INSERT INTO site_settings (club_id, setting_key, setting_value) VALUES (1, ?, ?)',
          [setting.key, setting.value]
        );
        console.log(`✅ Ajouté: ${setting.key} = "${setting.value}"`);
      }
    }
    
    console.log('\n=== VÉRIFICATION DES DONNÉES APRÈS INSERTION ===\n');
    
    // Vérifier que les données ont été correctement insérées
    const [allSettings] = await connection.execute(
      'SELECT setting_key, setting_value FROM site_settings WHERE club_id = 1 ORDER BY setting_key'
    );
    
    console.table(allSettings);
    
    await connection.end();
    console.log('\n✅ Données de test ajoutées avec succès!');
    console.log('\n🔄 Vous pouvez maintenant recharger la page admin pour voir les données.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

populateSiteSettings();