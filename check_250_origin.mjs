import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function checkOrigin() {
  console.log('🔍 Analyse de l\'origine du montant 250.02€');
  console.log('===========================================\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const clubId = 2;
    
    // 1. État actuel de fond_caisse
    console.log('1. État actuel de fond_caisse:');
    const [fondCaisse] = await connection.execute(
      'SELECT * FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    if (fondCaisse.length > 0) {
      const fond = fondCaisse[0];
      console.log(`   - Crédit: ${fond.credit}€`);
      console.log(`   - Débit: ${fond.debit}€`);
      console.log(`   - Solde: ${fond.solde}€`);
      console.log(`   - Date création: ${fond.date_creation}`);
      console.log(`   - Date modification: ${fond.date_modification}`);
    }
    
    // 2. Toutes les opérations de caisse_historique
    console.log('\n2. TOUTES les opérations dans caisse_historique:');
    const [historique] = await connection.execute(
      'SELECT * FROM caisse_historique WHERE club_id = ? ORDER BY date_operation ASC',
      [clubId]
    );
    
    console.log(`   Nombre d'opérations: ${historique.length}`);
    let totalEncaissements = 0;
    let totalRetraits = 0;
    
    historique.forEach((op, index) => {
      const enc = parseFloat(op.montant_encaissement || 0);
      const ret = parseFloat(op.montant_retrait || 0);
      totalEncaissements += enc;
      totalRetraits += ret;
      
      console.log(`   ${index + 1}. [${op.date_operation.toISOString().split('T')[0]}] ${op.type_operation}`);
      console.log(`      Encaissement: ${enc}€, Retrait: ${ret}€`);
      console.log(`      Description: ${op.description}`);
    });
    
    console.log(`\n   TOTAUX:`);
    console.log(`   - Encaissements: ${totalEncaissements}€`);
    console.log(`   - Retraits: ${totalRetraits}€`);
    console.log(`   - Recettes nettes: ${totalEncaissements - totalRetraits}€`);
    
    // 3. Analyse du problème
    console.log('\n3. ANALYSE:');
    if (fondCaisse.length > 0) {
      const creditInitial = parseFloat(fondCaisse[0].credit);
      console.log(`   - Votre transfert de 100€ est dans fond_caisse.credit: ${creditInitial}€`);
      console.log(`   - Mais fond_caisse_operations contient: 250.02€`);
      console.log(`   - Différence: ${250.02 - creditInitial}€`);
      
      if (totalEncaissements > 0) {
        console.log(`\n   💡 HYPOTHÈSE:`);
        console.log(`   Il semble que lors de la migration, le script ait additionné:`);
        console.log(`   - Le crédit de fond_caisse: ${creditInitial}€`);
        console.log(`   - Les recettes de caisse_historique: ${totalEncaissements - totalRetraits}€`);
        console.log(`   - Total: ${creditInitial + (totalEncaissements - totalRetraits)}€`);
        
        if (Math.abs((creditInitial + totalEncaissements - totalRetraits) - 250.02) < 0.01) {
          console.log(`   ✅ BINGO! C'est exactement 250.02€`);
          console.log(`\n   🚨 PROBLÈME IDENTIFIÉ:`);
          console.log(`   La migration a incorrectement mélangé:`);
          console.log(`   - Le fond de caisse (transferts bancaires): ${creditInitial}€`);
          console.log(`   - Les recettes de caisse (ventes, etc.): ${totalEncaissements - totalRetraits}€`);
          console.log(`\n   Ces deux montants doivent rester séparés!`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkOrigin().catch(console.error);