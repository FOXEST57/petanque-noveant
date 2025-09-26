import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'petanque_noveant',
  multipleStatements: true
};

async function createComptesClientsTable() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('=== CRÉATION DE LA TABLE COMPTES_CLIENTS ===\n');
    
    // 1. Créer la table comptes_clients
    console.log('1. Création de la table comptes_clients...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comptes_clients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          membre_id INT NOT NULL,
          club_id INT NOT NULL,
          
          -- Colonnes pour les mouvements
          debit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant débité du compte',
          credit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant crédité au compte',
          solde DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Solde actuel du compte',
          
          -- Informations sur la transaction
          type_operation ENUM('credit', 'debit', 'ajustement', 'transfert') NOT NULL,
          description TEXT COMMENT 'Description de l\\'opération',
          reference VARCHAR(100) COMMENT 'Référence de la transaction (facture, etc.)',
          
          -- Métadonnées
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by INT COMMENT 'ID de l\\'utilisateur qui a créé l\\'opération',
          
          -- Clés étrangères (sans contraintes pour éviter les erreurs)
          -- FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE,
          -- FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
          -- FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          
          -- Index pour les performances
          INDEX idx_membre_club (membre_id, club_id),
          INDEX idx_club_date (club_id, created_at),
          INDEX idx_type_operation (type_operation),
          INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table comptes_clients créée avec succès');
    
    // 2. Créer la vue pour les soldes
    console.log('\n2. Création de la vue vue_soldes_membres...');
    await connection.execute(`
      CREATE OR REPLACE VIEW vue_soldes_membres AS
      SELECT 
          m.id as membre_id,
          m.nom,
          m.prenom,
          m.email,
          m.club_id,
          COALESCE(SUM(cc.credit), 0) as total_credits,
          COALESCE(SUM(cc.debit), 0) as total_debits,
          COALESCE(SUM(cc.credit) - SUM(cc.debit), 0) as solde_calcule,
          m.solde as solde_membre_table,
          COUNT(cc.id) as nombre_operations,
          MAX(cc.updated_at) as derniere_operation
      FROM members m
      LEFT JOIN comptes_clients cc ON m.id = cc.membre_id
      GROUP BY m.id, m.nom, m.prenom, m.email, m.club_id, m.solde
    `);
    console.log('✅ Vue vue_soldes_membres créée avec succès');
    
    // 3. Vérifier la structure de la table
    console.log('\n3. Vérification de la structure de la table...');
    const [columns] = await connection.execute('DESCRIBE comptes_clients');
    console.log('Colonnes de la table comptes_clients:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // 4. Insérer quelques données de test
    console.log('\n4. Insertion de données de test...');
    
    // Créer une opération de crédit pour le membre test
    await connection.execute(`
      INSERT INTO comptes_clients (
        membre_id, club_id, credit, solde, type_operation, 
        description, created_by
      ) VALUES (
        39, 2, 101.00, 101.00, 'credit',
        'Crédit initial de test via table comptes_clients', 1
      )
    `);
    console.log('✅ Opération de crédit de test ajoutée');
    
    // 5. Tester la vue
    console.log('\n5. Test de la vue vue_soldes_membres...');
    const [soldes] = await connection.execute(`
      SELECT * FROM vue_soldes_membres 
      WHERE club_id = 2 AND membre_id = 39
    `);
    
    if (soldes.length > 0) {
      const solde = soldes[0];
      console.log('Résultat de la vue:');
      console.log(`   - Membre: ${solde.prenom} ${solde.nom}`);
      console.log(`   - Total crédits: ${solde.total_credits}€`);
      console.log(`   - Total débits: ${solde.total_debits}€`);
      console.log(`   - Solde calculé: ${solde.solde_calcule}€`);
      console.log(`   - Solde table members: ${solde.solde_membre_table}€`);
      console.log(`   - Nombre d'opérations: ${solde.nombre_operations}`);
    }
    
    console.log('\n=== CRÉATION TERMINÉE AVEC SUCCÈS ===');
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

createComptesClientsTable();