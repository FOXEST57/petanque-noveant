/**
 * Script de migration pour séparer les colonnes montant en montant_encaissement et montant_retrait
 * Usage: node run_migration_caisse.js
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuration ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connexion établie');
    
    // Vérifier si les nouvelles colonnes existent déjà
    console.log('🔍 Vérification de l\'état actuel de la table...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'caisse_historique'
    `, [dbConfig.database]);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    const hasNewColumns = columnNames.includes('montant_encaissement') && columnNames.includes('montant_retrait');
    
    if (hasNewColumns) {
      console.log('⚠️  Les nouvelles colonnes existent déjà. Migration déjà effectuée ?');
      
      // Vérifier les données
      const [data] = await connection.execute(`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN montant_encaissement > 0 THEN 1 ELSE 0 END) as encaissements,
               SUM(CASE WHEN montant_retrait > 0 THEN 1 ELSE 0 END) as retraits
        FROM caisse_historique
      `);
      
      console.log('📊 État actuel des données:');
      console.log(`   Total d'enregistrements: ${data[0].total}`);
      console.log(`   Encaissements: ${data[0].encaissements}`);
      console.log(`   Retraits: ${data[0].retraits}`);
      
      return;
    }
    
    console.log('🚀 Début de la migration...');
    
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, 'migration_caisse_colonnes_separees.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Exécuter seulement les étapes 1 et 2 (ajout des colonnes et migration des données)
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    await connection.beginTransaction();
    
    try {
      // Étape 1: Ajouter les nouvelles colonnes
      console.log('📝 Ajout des nouvelles colonnes...');
      await connection.execute(`
        ALTER TABLE caisse_historique 
        ADD COLUMN montant_encaissement DECIMAL(10,2) DEFAULT 0.00,
        ADD COLUMN montant_retrait DECIMAL(10,2) DEFAULT 0.00
      `);
      
      // Étape 2: Migrer les données existantes
      console.log('🔄 Migration des données existantes...');
      
      // Montants positifs -> encaissements
      const [result1] = await connection.execute(`
        UPDATE caisse_historique 
        SET montant_encaissement = montant 
        WHERE montant > 0
      `);
      console.log(`   ✅ ${result1.affectedRows} encaissements migrés`);
      
      // Montants négatifs -> retraits (en valeur absolue)
      const [result2] = await connection.execute(`
        UPDATE caisse_historique 
        SET montant_retrait = ABS(montant) 
        WHERE montant < 0
      `);
      console.log(`   ✅ ${result2.affectedRows} retraits migrés`);
      
      await connection.commit();
      console.log('✅ Migration terminée avec succès !');
      
      // Vérification des données migrées
      console.log('🔍 Vérification des données migrées...');
      const [verification] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN montant_encaissement > 0 THEN 1 ELSE 0 END) as encaissements,
          SUM(CASE WHEN montant_retrait > 0 THEN 1 ELSE 0 END) as retraits,
          SUM(montant_encaissement) as total_encaissements,
          SUM(montant_retrait) as total_retraits
        FROM caisse_historique
      `);
      
      console.log('📊 Résultats de la migration:');
      console.log(`   Total d'enregistrements: ${verification[0].total}`);
      console.log(`   Encaissements: ${verification[0].encaissements} (${verification[0].total_encaissements}€)`);
      console.log(`   Retraits: ${verification[0].retraits} (${verification[0].total_retraits}€)`);
      
      console.log('\n⚠️  IMPORTANT: Vérifiez que les données sont correctes avant de supprimer l\'ancienne colonne "montant"');
      console.log('   Pour supprimer l\'ancienne colonne, exécutez: ALTER TABLE caisse_historique DROP COLUMN montant;');
      
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration
runMigration();