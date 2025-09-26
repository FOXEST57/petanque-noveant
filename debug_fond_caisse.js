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

async function debugFondCaisse() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== DEBUG FOND DE CAISSE ===\n');
    
    // 1. Vérifier tous les clubs et leur fond de caisse
    const [clubRows] = await connection.execute(
      'SELECT id, nom, fond_caisse FROM clubs'
    );
    
    console.log('1. Tous les clubs et leur fond de caisse:');
    clubRows.forEach(club => {
      console.log(`   Club ${club.id} (${club.nom}): ${club.fond_caisse} €`);
    });
    
    // 2. Vérifier les opérations de type 'credit' dans caisse_historique
    const [creditRows] = await connection.execute(
      `SELECT club_id, type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE type_operation = 'credit'
       ORDER BY date_operation DESC`
    );
    
    console.log('\n2. Opérations de crédit dans caisse_historique:');
    if (creditRows.length === 0) {
      console.log('   Aucune opération de crédit trouvée');
    } else {
      creditRows.forEach(op => {
        console.log(`   Club ${op.club_id}: ${op.type_operation} - Encaissement: ${op.montant_encaissement} €, Retrait: ${op.montant_retrait} € - ${op.description}`);
      });
    }
    
    // 3. Vérifier les transferts bancaires vers la caisse
    const [transfertRows] = await connection.execute(
      `SELECT club_id, type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE type_operation = 'transfert_bancaire'
       ORDER BY date_operation DESC`
    );
    
    console.log('\n3. Transferts bancaires vers la caisse:');
    if (transfertRows.length === 0) {
      console.log('   Aucun transfert bancaire trouvé');
    } else {
      transfertRows.forEach(op => {
        console.log(`   Club ${op.club_id}: ${op.type_operation} - Encaissement: ${op.montant_encaissement} €, Retrait: ${op.montant_retrait} € - ${op.description}`);
      });
    }
    
    // 4. Calculer le solde selon la logique actuelle
    for (const club of clubRows) {
      const [operationsRows] = await connection.execute(
        `SELECT 
          COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
          COALESCE(SUM(montant_retrait), 0) as total_retraits
         FROM caisse_historique 
         WHERE club_id = ? AND type_operation != 'credit'`,
        [club.id]
      );
      
      const operations = operationsRows[0];
      const totalEncaissements = parseFloat(operations.total_encaissements || 0);
      const totalRetraits = parseFloat(operations.total_retraits || 0);
      const soldeCaisse = parseFloat(club.fond_caisse || 0) + totalEncaissements - totalRetraits;
      
      console.log(`\n4. Calcul du solde pour le club ${club.id} (${club.nom}):`);
      console.log(`   Fond de caisse: ${club.fond_caisse} €`);
      console.log(`   Total encaissements (hors crédit): ${totalEncaissements} €`);
      console.log(`   Total retraits: ${totalRetraits} €`);
      console.log(`   Solde calculé: ${soldeCaisse} €`);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

debugFondCaisse().catch(console.error);