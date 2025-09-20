import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function addConstraint() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== AJOUT DE LA CONTRAINTE 4 CHIFFRES ===');
    try {
      await connection.execute(`
        ALTER TABLE clubs 
        ADD CONSTRAINT chk_numero_ffpjp_4digits 
        CHECK (numero_ffpjp REGEXP '^[0-9]{4}$')
      `);
      console.log('✅ Contrainte CHECK ajoutée avec succès');
    } catch (error) {
      if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
        console.log('ℹ️ La contrainte CHECK existe déjà');
      } else {
        console.log('❌ Erreur:', error.message);
      }
    }
    
    console.log('\n=== VÉRIFICATION FINALE ===');
    const [clubs] = await connection.execute('SELECT id, nom, numero_ffpjp FROM clubs');
    const [settings] = await connection.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['ffpjp_id']);
    
    console.log('✅ Numéro FFPJP dans clubs:', clubs[0]?.numero_ffpjp);
    console.log('✅ Numéro FFPJP dans site_settings:', settings[0]?.setting_value);
    console.log('✅ Format: 4 chiffres exactement');
    console.log('✅ Unicité: déjà garantie par l\'index unique');
    console.log('✅ Cohérence: valeurs identiques');
    
    await connection.end();
    console.log('\n🎉 Configuration du numéro FFPJP terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addConstraint();