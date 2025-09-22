import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function checkSiteSettings() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== VÉRIFICATION DES PARAMÈTRES DU SITE ===\n');
    
    // Vérifier la structure de la table
    console.log('Structure de la table site_settings:');
    const [structure] = await connection.execute('DESCRIBE site_settings');
    console.table(structure);
    
    console.log('\n=== DONNÉES POUR LE CLUB ID = 1 ===\n');
    
    // Récupérer tous les paramètres pour le club 1
    const [rows] = await connection.execute(
      'SELECT setting_key, setting_value, setting_type FROM site_settings WHERE club_id = 1 ORDER BY setting_key'
    );
    
    if (rows.length === 0) {
      console.log('❌ Aucun paramètre trouvé pour le club_id = 1');
    } else {
      console.log(`✅ ${rows.length} paramètres trouvés:`);
      console.table(rows);
    }
    
    // Vérifier spécifiquement les champs manquants
    const expectedFields = [
      'club_address', 'ffpjp_id', 'club_phone', 'club_email', 
      'club_description', 'facebook_url', 'instagram_url', 
      'whatsapp_url', 'tiktok_url'
    ];
    
    console.log('\n=== VÉRIFICATION DES CHAMPS ATTENDUS ===\n');
    
    const existingKeys = rows.map(row => row.setting_key);
    
    expectedFields.forEach(field => {
      if (existingKeys.includes(field)) {
        const value = rows.find(row => row.setting_key === field)?.setting_value;
        console.log(`✅ ${field}: "${value}"`);
      } else {
        console.log(`❌ ${field}: MANQUANT`);
      }
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkSiteSettings();