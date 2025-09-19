const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'petanque_noveant'
};

async function addSocialMediaFields() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Add WhatsApp URL field
        await connection.execute(`
            INSERT INTO site_settings (setting_key, setting_value) 
            VALUES ('whatsapp_url', '') 
            ON DUPLICATE KEY UPDATE setting_value = setting_value
        `);
        
        // Add TikTok URL field
        await connection.execute(`
            INSERT INTO site_settings (setting_key, setting_value) 
            VALUES ('tiktok_url', '') 
            ON DUPLICATE KEY UPDATE setting_value = setting_value
        `);
        
        console.log('✅ WhatsApp and TikTok URL fields added to database successfully');
        
        // Verify the fields were added
        const [results] = await connection.execute(`
            SELECT setting_key, setting_value 
            FROM site_settings 
            WHERE setting_key IN ('whatsapp_url', 'tiktok_url')
        `);
        
        console.log('📋 New social media fields:');
        results.forEach(row => {
            console.log(`  ${row.setting_key}: '${row.setting_value}'`);
        });
        
    } catch (error) {
        console.error('❌ Error adding social media fields:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addSocialMediaFields();