import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function fixFondCaisse() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== CORRECTION DU FOND DE CAISSE ===\n');
    
    // 1. Afficher l'état actuel
    const [clubRows] = await connection.execute(
      'SELECT id, nom, fond_caisse FROM clubs WHERE fond_caisse != 0.00'
    );
    
    console.log('1. Clubs avec un fond de caisse non nul:');
    if (clubRows.length === 0) {
      console.log('   Aucun club avec un fond de caisse non nul');
      return;
    }
    
    clubRows.forEach(club => {
      console.log(`   Club ${club.id} (${club.nom}): ${club.fond_caisse} €`);
    });
    
    // 2. Corriger le fond de caisse pour le club Pétanque Novéantaise (ID 2)
    console.log('\n2. Correction du fond de caisse...');
    
    const [result] = await connection.execute(
      'UPDATE clubs SET fond_caisse = 0.00 WHERE id = 2',
      []
    );
    
    console.log(`   Nombre de lignes mises à jour: ${result.affectedRows}`);
    
    // 3. Vérifier la correction
    const [verificationRows] = await connection.execute(
      'SELECT id, nom, fond_caisse FROM clubs WHERE id = 2'
    );
    
    console.log('\n3. Vérification après correction:');
    verificationRows.forEach(club => {
      console.log(`   Club ${club.id} (${club.nom}): ${club.fond_caisse} €`);
    });
    
    console.log('\n✅ Correction terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await connection.end();
  }
}

fixFondCaisse().catch(console.error);