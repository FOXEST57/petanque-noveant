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

async function testTransfertReel() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== DIAGNOSTIC TRANSFERT BANCAIRE RÉEL ===\n');
    
    const clubId = 2; // Club Pétanque Novéantaise
    
    // 1. État actuel de la base
    console.log('1. État actuel de la base:');
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = ?',
      [clubId]
    );
    
    const fondCaisse = clubRows[0]?.fond_caisse || 0;
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    
    // 2. Vérifier les opérations récentes
    console.log('\n2. Opérations récentes (toutes):');
    const [historiqueRows] = await connection.execute(
      `SELECT id, type_operation, montant_encaissement, montant_retrait, description, date_operation
       FROM caisse_historique 
       WHERE club_id = ? 
       ORDER BY date_operation DESC 
       LIMIT 10`,
      [clubId]
    );
    
    if (historiqueRows.length === 0) {
      console.log('   Aucune opération trouvée');
    } else {
      historiqueRows.forEach((op, index) => {
        console.log(`   ${index + 1}. [ID:${op.id}] ${op.type_operation}: +${op.montant_encaissement}€, -${op.montant_retrait}€`);
        console.log(`      Description: ${op.description}`);
        console.log(`      Date: ${op.date_operation}`);
        console.log('');
      });
    }
    
    // 3. Calcul du solde avec la nouvelle logique (incluant tous les crédits)
    console.log('3. Calcul du solde avec la NOUVELLE logique (incluant tous les crédits):');
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const totalEncaissements = parseFloat(operationsRows[0].total_encaissements || 0);
    const totalRetraits = parseFloat(operationsRows[0].total_retraits || 0);
    const soldeCalcule = parseFloat(fondCaisse) + totalEncaissements - totalRetraits;
    
    console.log(`   Fond de caisse: ${fondCaisse} €`);
    console.log(`   Total encaissements: ${totalEncaissements} €`);
    console.log(`   Total retraits: ${totalRetraits} €`);
    console.log(`   Solde calculé: ${soldeCalcule} €`);
    
    // 4. Test de l'API corrigée
    console.log('\n4. Test de l\'API corrigée:');
    
    try {
      const response = await fetch('http://localhost:3007/api/caisse/solde', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json',
          'X-Club-Subdomain': 'noveant'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API Response:`);
        console.log(`      Fond de caisse: ${data.fondCaisse} €`);
        console.log(`      Solde de caisse: ${data.soldeCaisse} €`);
        console.log(`      Recettes: ${data.recettes} €`);
        
        // Vérifier si l'API retourne le bon solde
        if (Math.abs(data.soldeCaisse - soldeCalcule) < 0.01) {
          console.log(`   ✅ L'API retourne le bon solde!`);
        } else {
          console.log(`   ❌ PROBLÈME: L'API retourne ${data.soldeCaisse}€ au lieu de ${soldeCalcule}€`);
        }
        
        // Analyser le problème spécifique
        if (data.soldeCaisse === 0.01 && totalEncaissements > 0) {
          console.log(`   🔍 DIAGNOSTIC: Le transfert de 500€ n'est pas pris en compte`);
          console.log(`   🔍 Vérifiez que le serveur API a bien été redémarré après les modifications`);
        }
        
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Erreur API: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur lors de l'appel API: ${error.message}`);
    }
    
    // 5. Vérifier les types d'opérations
    console.log('\n5. Analyse des types d\'opérations:');
    const [typesRows] = await connection.execute(
      `SELECT type_operation, COUNT(*) as nb_operations, 
              COALESCE(SUM(montant_encaissement), 0) as total_encaissements
       FROM caisse_historique 
       WHERE club_id = ?
       GROUP BY type_operation
       ORDER BY type_operation`,
      [clubId]
    );
    
    if (typesRows.length === 0) {
      console.log('   Aucune opération par type trouvée');
    } else {
      typesRows.forEach(type => {
        console.log(`   ${type.type_operation}: ${type.nb_operations} opération(s), ${type.total_encaissements}€`);
      });
    }
    
    console.log('\n=== DIAGNOSTIC TERMINÉ ===');
    
    if (soldeCalcule > 0.01 && historiqueRows.length > 0) {
      console.log('✅ Les données en base semblent correctes');
      console.log('🔧 Le problème vient probablement du serveur API qui n\'a pas pris les modifications');
      console.log('💡 Vérifiez que le serveur API a bien été redémarré');
    } else if (historiqueRows.length === 0) {
      console.log('❌ Aucune opération trouvée - le transfert n\'a peut-être pas été enregistré');
    } else {
      console.log('🔍 Analyse des données nécessaire pour identifier le problème');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

testTransfertReel().catch(console.error);