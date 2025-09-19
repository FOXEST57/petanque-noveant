import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const execAsync = promisify(exec);

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

// Fonction pour créer un timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
};

// Fonction pour vérifier si mysqldump est disponible
const checkMysqldump = async () => {
  try {
    await execAsync('mysqldump --version');
    return true;
  } catch (error) {
    return false;
  }
};

// Fonction pour obtenir la liste des tables
const getTables = async (connection) => {
  try {
    const [rows] = await connection.execute('SHOW TABLES');
    return rows.map(row => Object.values(row)[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des tables:', error);
    throw error;
  }
};

// Fonction pour sauvegarder avec mysqldump
const backupWithMysqldump = async (outputFile) => {
  try {
    console.log('🔄 Utilisation de mysqldump pour la sauvegarde...');
    
    const { host, port, user, password, database } = dbConfig;
    
    // Construction de la commande mysqldump
    let command = `mysqldump -h ${host} -P ${port} -u ${user}`;
    
    if (password) {
      command += ` -p${password}`;
    }
    
    // Options pour inclure structure et données
    command += ` --routines --triggers --single-transaction --lock-tables=false --add-drop-table --create-options --disable-keys --extended-insert --quick --set-charset`;
    
    command += ` ${database}`;
    
    console.log('📝 Exécution de la sauvegarde...');
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`Erreur mysqldump: ${stderr}`);
    }
    
    // Écrire le résultat dans le fichier
    fs.writeFileSync(outputFile, stdout);
    
    return true;
  } catch (error) {
    console.error('Erreur avec mysqldump:', error.message);
    return false;
  }
};

// Fonction de sauvegarde manuelle (fallback)
async function backupManually() {
  console.log('Démarrage de la sauvegarde manuelle...');
  
  try {
    // Créer la connexion MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Obtenir la liste des tables
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",
      [dbConfig.database]
    );

    let sqlContent = '-- Sauvegarde de la base de données MariaDB/MySQL\n';
    sqlContent += `-- Date: ${new Date().toISOString()}\n\n`;

    // Pour chaque table, exporter la structure et les données
    for (const table of tables) {
      console.log(`Sauvegarde de la table: ${table.name}`);
      
      // Obtenir la structure de la table
      const [createTableResult] = await connection.execute(`SHOW CREATE TABLE ${table.name}`);
      
      if (createTableResult && createTableResult.length > 0) {
        sqlContent += `-- Structure de la table ${table.name}\n`;
        sqlContent += `DROP TABLE IF EXISTS ${table.name};\n`;
        sqlContent += `${createTableResult[0]['Create Table']};\n\n`;
      }

      // Obtenir les données de la table
      const [rows] = await connection.execute(`SELECT * FROM ${table.name}`);
      
      if (rows.length > 0) {
        sqlContent += `-- Données de la table ${table.name}\n`;
        
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return value;
          });
          
          sqlContent += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlContent += '\n';
      }
    }

    await connection.end();
    return sqlContent;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde manuelle:', error);
    throw error;
  }
}

// Fonction principale de sauvegarde
const backupDatabase = async () => {
  try {
    console.log('🚀 Début de la sauvegarde de la base de données');
    console.log(`📊 Base de données: ${dbConfig.database}`);
    console.log(`🖥️  Serveur: ${dbConfig.host}:${dbConfig.port}`);
    
    // Créer le nom du fichier de sauvegarde
    const timestamp = getTimestamp();
    const filename = `backup_database_${timestamp}.sql`;
    const outputFile = path.join(process.cwd(), filename);
    
    console.log(`📁 Fichier de sauvegarde: ${filename}`);
    
    // Vérifier si mysqldump est disponible
    const hasMysqldump = await checkMysqldump();
    
    let success = false;
    
    if (hasMysqldump) {
      success = await backupWithMysqldump(outputFile);
    }
    
    // Si mysqldump échoue ou n'est pas disponible, utiliser la méthode manuelle
    if (!success) {
      console.log('🔄 Basculement vers la sauvegarde manuelle...');
      success = await backupManually(outputFile);
    }
    
    if (success) {
      const stats = fs.statSync(outputFile);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log('\n✅ Sauvegarde terminée avec succès!');
      console.log(`📁 Fichier: ${outputFile}`);
      console.log(`📏 Taille: ${fileSizeKB} KB`);
      console.log(`⏰ Terminé à: ${new Date().toLocaleString()}`);
      
      return outputFile;
    } else {
      throw new Error('Échec de la sauvegarde');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la sauvegarde:', error.message);
    process.exit(1);
  }
};

// Exécuter la sauvegarde si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase();
}

export { backupDatabase };