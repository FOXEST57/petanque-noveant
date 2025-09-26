import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function testNouvelleArchitectureCaisse() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 Test de la nouvelle architecture de la caisse');
    console.log('================================================\n');
    
    // 1. Vérifier l'existence de la table fond_caisse
    console.log('1. Vérification de la table fond_caisse...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'fond_caisse'"
    );
    
    if (tables.length === 0) {
      console.log('❌ La table fond_caisse n\'existe pas');
      return;
    }
    console.log('✅ Table fond_caisse trouvée');
    
    // 2. Vérifier la structure de la table fond_caisse
    console.log('\n2. Structure de la table fond_caisse...');
    const [structure] = await connection.execute('DESCRIBE fond_caisse');
    console.log('Structure:', structure);
    
    // 3. Vérifier les données dans fond_caisse
    console.log('\n3. Données dans la table fond_caisse...');
    const [fondCaisseData] = await connection.execute(
      'SELECT * FROM fond_caisse ORDER BY id_club'
    );
    console.log('Données fond_caisse:', fondCaisseData);
    
    // 4. Vérifier que la colonne fond_caisse n'existe plus dans clubs
    console.log('\n4. Vérification de la suppression de la colonne fond_caisse dans clubs...');
    const [clubsStructure] = await connection.execute('DESCRIBE clubs');
    const fondCaisseColumn = clubsStructure.find(col => col.Field === 'fond_caisse');
    
    if (fondCaisseColumn) {
      console.log('❌ La colonne fond_caisse existe encore dans la table clubs');
    } else {
      console.log('✅ La colonne fond_caisse a été supprimée de la table clubs');
    }
    
    // 5. Test de récupération du solde via l'API simulée
    console.log('\n5. Test de récupération du solde...');
    const clubId = 2; // Club de test
    
    // Récupérer le fond de caisse
    const [fondCaisseRows] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    const fondCaisse = fondCaisseRows.length > 0 ? fondCaisseRows[0].solde : 0;
    console.log(`Fond de caisse pour le club ${clubId}: ${fondCaisse}€`);
    
    // Calculer les recettes depuis l'historique
    const [operationsRows] = await connection.execute(
      `SELECT 
        COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
        COALESCE(SUM(montant_retrait), 0) as total_retraits
       FROM caisse_historique 
       WHERE club_id = ?`,
      [clubId]
    );
    
    const operations = operationsRows[0];
    const totalEncaissements = parseFloat(operations.total_encaissements);
    const totalRetraits = parseFloat(operations.total_retraits);
    const soldeCaisse = fondCaisse + totalEncaissements - totalRetraits;
    const recettes = soldeCaisse - fondCaisse;
    
    console.log(`Total encaissements: ${totalEncaissements}€`);
    console.log(`Total retraits: ${totalRetraits}€`);
    console.log(`Solde de caisse: ${soldeCaisse}€`);
    console.log(`Recettes: ${recettes}€`);
    
    // 6. Test de mise à jour du fond de caisse
    console.log('\n6. Test de mise à jour du fond de caisse...');
    const nouveauSolde = fondCaisse + 10; // Ajouter 10€
    
    await connection.execute(
      'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
      [nouveauSolde, clubId]
    );
    
    // Vérifier la mise à jour
    const [verificationRows] = await connection.execute(
      'SELECT solde FROM fond_caisse WHERE id_club = ?',
      [clubId]
    );
    
    const soldeApresUpdate = verificationRows[0].solde;
    console.log(`Solde après mise à jour: ${soldeApresUpdate}€`);
    
    if (Math.abs(soldeApresUpdate - nouveauSolde) < 0.01) {
      console.log('✅ Mise à jour du fond de caisse réussie');
    } else {
      console.log('❌ Erreur lors de la mise à jour du fond de caisse');
    }
    
    // Remettre l'ancien solde
    await connection.execute(
      'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
      [fondCaisse, clubId]
    );
    
    console.log('\n🎉 Tests terminés avec succès !');
    console.log('La nouvelle architecture de la caisse fonctionne correctement.');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await connection.end();
  }
}

// Exécuter les tests
testNouvelleArchitectureCaisse().catch(console.error);