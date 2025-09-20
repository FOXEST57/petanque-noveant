import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function updateClubsConstraints() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== VÉRIFICATION DE LA TABLE CLUBS ===');
    
    // Vérifier les données actuelles
    const [clubsData] = await connection.execute('SELECT id, nom, numero_ffpjp FROM clubs');
    console.log('Données actuelles dans clubs:');
    console.table(clubsData);
    
    // Vérifier la valeur dans site_settings
    const [settings] = await connection.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['ffpjp_id']);
    console.log('\nValeur FFPJP dans site_settings:', settings[0]?.setting_value);
    
    // Ajouter une contrainte CHECK pour 4 chiffres exactement
    console.log('\n=== AJOUT DE LA CONTRAINTE 4 CHIFFRES ===');
    try {
      await connection.execute(`
        ALTER TABLE clubs 
        ADD CONSTRAINT chk_numero_ffpjp_4digits 
        CHECK (numero_ffpjp REGEXP '^[0-9]{4}$')
      `);
      console.log('✅ Contrainte CHECK ajoutée avec succès (4 chiffres exactement)');
    } catch (error) {
      if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
        console.log('ℹ️ La contrainte CHECK existe déjà');
      } else {
        console.log('❌ Erreur lors de l\'ajout de la contrainte CHECK:', error.message);
      }
    }
    
    // Vérifier que l'unicité existe déjà (d'après la structure vue précédemment)
    console.log('\n=== VÉRIFICATION DE L\'UNICITÉ ===');
    const [indexes] = await connection.execute('SHOW INDEX FROM clubs WHERE Column_name = ?', ['numero_ffpjp']);
    if (indexes.length > 0) {
      console.log('✅ Contrainte d\'unicité déjà présente sur numero_ffpjp');
      console.table(indexes);
    } else {
      console.log('❌ Aucune contrainte d\'unicité trouvée');
    }
    
    // Synchroniser les valeurs si nécessaire
    console.log('\n=== SYNCHRONISATION DES VALEURS ===');
    if (clubsData.length > 0 && settings.length > 0) {
      const clubFFPJP = clubsData[0].numero_ffpjp;
      const settingsFFPJP = settings[0].setting_value;
      
      if (clubFFPJP !== settingsFFPJP) {
        console.log(`⚠️ Incohérence détectée:`);
        console.log(`   - Table clubs: ${clubFFPJP}`);
        console.log(`   - Site settings: ${settingsFFPJP}`);
        
        // Mettre à jour site_settings avec la valeur de clubs (clubs fait autorité)
        await connection.execute(
          'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
          [clubFFPJP, 'ffpjp_id']
        );
        console.log('✅ Site_settings mis à jour avec la valeur de clubs');
      } else {
        console.log('✅ Les valeurs sont cohérentes entre clubs et site_settings');
      }
    }
    
    await connection.end();
    console.log('\n🎉 Traitement terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateClubsConstraints();