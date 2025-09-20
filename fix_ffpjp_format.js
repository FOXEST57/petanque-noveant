import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function fixFFPJPFormat() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== CORRECTION DU FORMAT FFPJP ===');
    
    // Récupérer la valeur correcte depuis site_settings
    const [settings] = await connection.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['ffpjp_id']);
    const correctFFPJP = settings[0]?.setting_value;
    
    console.log('Valeur correcte depuis site_settings:', correctFFPJP);
    
    // Mettre à jour la table clubs avec la bonne valeur
    await connection.execute('UPDATE clubs SET numero_ffpjp = ? WHERE id = 1', [correctFFPJP]);
    console.log('✅ Numéro FFPJP mis à jour dans la table clubs');
    
    // Vérifier la mise à jour
    const [clubsData] = await connection.execute('SELECT id, nom, numero_ffpjp FROM clubs');
    console.log('Données après mise à jour:');
    console.table(clubsData);
    
    // Maintenant ajouter la contrainte CHECK
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
    
    await connection.end();
    console.log('\n🎉 Correction terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixFFPJPFormat();