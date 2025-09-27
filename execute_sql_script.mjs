import mysql from 'mysql2/promise';
import fs from 'fs';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function executeSQLScript() {
  console.log('🔧 Exécution du script SQL pour créer la table fond_caisse_operations');
  console.log('====================================================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('create_fond_caisse_operations_table.sql', 'utf8');
    
    // Diviser en commandes individuelles (séparées par ;)
    const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`Exécution de ${commands.length} commandes SQL...\n`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        console.log(`${i + 1}. Exécution de la commande...`);
        console.log(`   ${command.substring(0, 50)}...`);
        
        try {
          await connection.execute(command);
          console.log('   ✅ Succès\n');
        } catch (error) {
          console.log(`   ❌ Erreur: ${error.message}\n`);
          // Continuer avec les autres commandes même en cas d'erreur
        }
      }
    }
    
    console.log('✅ Script SQL exécuté avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  } finally {
    await connection.end();
  }
}

executeSQLScript().catch(console.error);