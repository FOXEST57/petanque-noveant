import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

async function debugSolde() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== DEBUG SOLDE ===\n');
    
    // 1. Récupérer le membre test
    const [memberRows] = await connection.execute(
      'SELECT id, nom, prenom, solde FROM members WHERE id = 39'
    );
    
    const membre = memberRows[0];
    console.log('1. Membre récupéré:');
    console.log('   - ID:', membre.id);
    console.log('   - Nom:', membre.nom);
    console.log('   - Solde:', membre.solde);
    console.log('   - Type de solde:', typeof membre.solde);
    console.log('   - parseFloat(solde):', parseFloat(membre.solde || 0));
    
    // 2. Tester le calcul
    const montant = 25.5;
    console.log('\n2. Test de calcul:');
    console.log('   - Montant:', montant);
    console.log('   - Type de montant:', typeof montant);
    
    const nouveauSolde1 = membre.solde + montant;
    const nouveauSolde2 = parseFloat(membre.solde || 0) + montant;
    
    console.log('   - membre.solde + montant:', nouveauSolde1);
    console.log('   - parseFloat(membre.solde) + montant:', nouveauSolde2);
    
    // 3. Récupérer le fond de caisse
    const [clubRows] = await connection.execute(
      'SELECT fond_caisse FROM clubs WHERE id = 2'
    );
    
    const club = clubRows[0];
    console.log('\n3. Fond de caisse:');
    console.log('   - Fond actuel:', club.fond_caisse);
    console.log('   - Type de fond:', typeof club.fond_caisse);
    console.log('   - parseFloat(fond):', parseFloat(club.fond_caisse || 0));
    
    const nouveauFond1 = club.fond_caisse + montant;
    const nouveauFond2 = parseFloat(club.fond_caisse || 0) + montant;
    
    console.log('   - fond + montant:', nouveauFond1);
    console.log('   - parseFloat(fond) + montant:', nouveauFond2);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

debugSolde();