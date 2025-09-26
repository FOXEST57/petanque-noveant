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

async function verifierStructureClubs() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== STRUCTURE DE LA TABLE CLUBS ===\n');
    
    // 1. Décrire la structure de la table clubs
    console.log('1. Structure de la table clubs:');
    const [columns] = await connection.execute('DESCRIBE clubs');
    
    console.log('   Colonnes de la table clubs:');
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${col.Default || 'NULL'}`);
    });
    
    // 2. Vérifier spécifiquement la colonne fond_caisse
    console.log('\n2. Vérification de la colonne fond_caisse:');
    const fondCaisseColumn = columns.find(col => col.Field === 'fond_caisse');
    
    if (fondCaisseColumn) {
      console.log('   ✅ La colonne fond_caisse existe');
      console.log(`   - Type: ${fondCaisseColumn.Type}`);
      console.log(`   - NULL autorisé: ${fondCaisseColumn.Null}`);
      console.log(`   - Valeur par défaut: ${fondCaisseColumn.Default || 'NULL'}`);
      console.log(`   - Extra: ${fondCaisseColumn.Extra || 'Aucun'}`);
    } else {
      console.log('   ❌ La colonne fond_caisse n\'existe PAS');
      console.log('   🔧 Il faut l\'ajouter avec la commande:');
      console.log('   ALTER TABLE clubs ADD COLUMN fond_caisse DECIMAL(10,2) DEFAULT 0.00;');
    }
    
    // 3. Afficher les données actuelles des clubs
    console.log('\n3. Données actuelles des clubs:');
    const [clubs] = await connection.execute('SELECT id, nom, fond_caisse FROM clubs');
    
    if (clubs.length > 0) {
      clubs.forEach((club, index) => {
        console.log(`   ${index + 1}. Club ${club.id} (${club.nom}): fond_caisse = ${club.fond_caisse || 'NULL'} €`);
      });
    } else {
      console.log('   Aucun club trouvé dans la base de données');
    }
    
    // 4. Vérifier si la colonne existe mais est vide
    if (fondCaisseColumn) {
      const [clubsAvecFond] = await connection.execute(
        'SELECT COUNT(*) as nb_clubs_avec_fond FROM clubs WHERE fond_caisse IS NOT NULL AND fond_caisse > 0'
      );
      
      const [clubsTotal] = await connection.execute('SELECT COUNT(*) as nb_clubs_total FROM clubs');
      
      console.log('\n4. Statistiques fond_caisse:');
      console.log(`   - Nombre total de clubs: ${clubsTotal[0].nb_clubs_total}`);
      console.log(`   - Clubs avec fond_caisse > 0: ${clubsAvecFond[0].nb_clubs_avec_fond}`);
      
      if (clubsAvecFond[0].nb_clubs_avec_fond === 0 && clubsTotal[0].nb_clubs_total > 0) {
        console.log('   ⚠️  Tous les clubs ont un fond_caisse à 0 ou NULL');
      }
    }
    
    console.log('\n=== VÉRIFICATION TERMINÉE ===');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await connection.end();
  }
}

verifierStructureClubs().catch(console.error);