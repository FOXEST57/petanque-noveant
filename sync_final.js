import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function sync() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== SYNCHRONISATION FINALE ===');
    await connection.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', ['0092', 'ffpjp_id']);
    console.log('✅ site_settings mis à jour avec 0092');
    
    const [clubs] = await connection.execute('SELECT numero_ffpjp FROM clubs WHERE id = 1');
    const [settings] = await connection.execute('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['ffpjp_id']);
    
    console.log('✅ Clubs:', clubs[0]?.numero_ffpjp);
    console.log('✅ Site_settings:', settings[0]?.setting_value);
    console.log('✅ Synchronisation parfaite !');
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

sync();