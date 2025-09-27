import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

async function addVolumeColumn() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'drinks' AND COLUMN_NAME = 'volume'",
      [dbConfig.database]
    );
    
    if (columns.length > 0) {
      console.log('✅ La colonne volume existe déjà dans la table drinks');
      return;
    }
    
    // Ajouter la colonne volume
    await connection.execute('ALTER TABLE drinks ADD COLUMN volume VARCHAR(50) DEFAULT NULL AFTER description');
    console.log('✅ Colonne volume ajoutée à la table drinks');
    
    // Mettre à jour quelques boissons existantes avec des volumes par défaut
    const updates = [
      { condition: "name LIKE '%Bière%' OR name LIKE '%biere%'", volume: '25 cl' },
      { condition: "name LIKE '%Picon%'", volume: '15 cl' },
      { condition: "name LIKE '%Vin%' AND name LIKE '%Verre%'", volume: '12 cl' },
      { condition: "name LIKE '%Bouteille%' AND name LIKE '%Vin%'", volume: '75 cl' },
      { condition: "name LIKE '%Eau%'", volume: '50 cl' },
      { condition: "name LIKE '%Café%'", volume: '5 cl' },
      { condition: "name LIKE '%Pastis%'", volume: '4 cl' }
    ];
    
    for (const update of updates) {
      await connection.execute(`UPDATE drinks SET volume = ? WHERE ${update.condition}`, [update.volume]);
      console.log(`✅ Volumes mis à jour pour: ${update.condition}`);
    }
    
    // Afficher la structure de la table
    const [structure] = await connection.execute('DESCRIBE drinks');
    console.log('\n📋 Structure de la table drinks:');
    structure.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addVolumeColumn();