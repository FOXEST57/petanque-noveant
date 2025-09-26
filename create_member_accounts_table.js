import mysql from 'mysql2/promise';

async function createMemberAccountsTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    console.log('Connexion à la base de données établie');
    
    console.log('Création de la table des comptes membres...');
    
    // Créer la table membre_comptes_historique
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS membre_comptes_historique (
        id INT PRIMARY KEY AUTO_INCREMENT,
        club_id INT NOT NULL,
        membre_id INT NOT NULL,
        user_id INT NOT NULL COMMENT 'Utilisateur qui a effectué l opération',
        type_operation ENUM('credit', 'debit', 'transfert_caisse_vers_compte', 'transfert_compte_vers_caisse') NOT NULL,
        montant DECIMAL(10,2) NOT NULL COMMENT 'Montant positif pour crédit, négatif pour débit',
        solde_avant DECIMAL(10,2) NOT NULL COMMENT 'Solde avant l opération',
        solde_apres DECIMAL(10,2) NOT NULL COMMENT 'Solde après l opération',
        description TEXT,
        reference_caisse_historique_id INT NULL COMMENT 'Référence vers l opération correspondante dans caisse_historique',
        date_operation DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_club_membre_date (club_id, membre_id, date_operation),
        INDEX idx_type_operation (type_operation),
        INDEX idx_date_operation (date_operation),
        
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
        FOREIGN KEY (reference_caisse_historique_id) REFERENCES caisse_historique(id) ON DELETE SET NULL
      )
    `);
    
    console.log('✅ Table membre_comptes_historique créée');
    
    // Créer la vue des soldes membres
    await connection.execute(`
      CREATE OR REPLACE VIEW vue_soldes_membres AS
      SELECT
        m.id as membre_id,
        m.club_id,
        m.nom,
        m.prenom,
        m.email,
        COALESCE(m.solde, 0.00) as solde_actuel,
        (
          SELECT COUNT(*)
          FROM membre_comptes_historique mch
          WHERE mch.membre_id = m.id
        ) as nombre_transactions,
        (
          SELECT MAX(mch.date_operation)
          FROM membre_comptes_historique mch
          WHERE mch.membre_id = m.id
        ) as derniere_transaction
      FROM members m
      WHERE m.club_id IS NOT NULL
    `);
    
    console.log('✅ Vue vue_soldes_membres créée');
    
    // Migrer les données existantes
    console.log('Migration des données existantes...');
    const [result] = await connection.execute(`
      INSERT INTO membre_comptes_historique (
        club_id, 
        membre_id, 
        user_id, 
        type_operation, 
        montant, 
        solde_avant, 
        solde_apres, 
        description, 
        reference_caisse_historique_id, 
        date_operation
      )
      SELECT 
        ch.club_id,
        ch.membre_id,
        ch.user_id,
        CASE 
          WHEN ch.type_operation = 'credit' THEN 'credit'
          WHEN ch.type_operation = 'transfert' AND ch.montant_encaissement > 0 THEN 'transfert_caisse_vers_compte'
          WHEN ch.type_operation = 'transfert' AND ch.montant_retrait > 0 THEN 'transfert_compte_vers_caisse'
          ELSE 'credit'
        END as type_operation,
        CASE 
          WHEN ch.montant_encaissement > 0 THEN ch.montant_encaissement
          WHEN ch.montant_retrait > 0 THEN -ch.montant_retrait
          ELSE ch.montant
        END as montant,
        0.00 as solde_avant,
        0.00 as solde_apres,
        ch.description,
        ch.id as reference_caisse_historique_id,
        ch.date_operation
      FROM caisse_historique ch
      WHERE ch.membre_id IS NOT NULL 
      AND ch.type_operation IN ('credit', 'transfert')
      AND NOT EXISTS (
        SELECT 1 FROM membre_comptes_historique mch 
        WHERE mch.reference_caisse_historique_id = ch.id
      )
    `);
    
    console.log(`✅ Migration terminée: ${result.affectedRows} enregistrements migrés`);
    
    // Recalculer les soldes
    console.log('Recalcul des soldes...');
    
    // Récupérer tous les enregistrements triés par membre et date
    const [records] = await connection.execute(`
      SELECT id, membre_id, montant, date_operation
      FROM membre_comptes_historique
      ORDER BY membre_id, date_operation, id
    `);
    
    let currentMemberId = null;
    let runningBalance = 0;
    
    for (const record of records) {
      if (record.membre_id !== currentMemberId) {
        currentMemberId = record.membre_id;
        runningBalance = 0;
      }
      
      const soldeAvant = runningBalance;
      runningBalance += parseFloat(record.montant);
      const soldeApres = runningBalance;
      
      await connection.execute(`
        UPDATE membre_comptes_historique 
        SET solde_avant = ?, solde_apres = ?
        WHERE id = ?
      `, [soldeAvant, soldeApres, record.id]);
    }
    
    console.log('✅ Soldes recalculés');
    
    // Vérifier la structure de la nouvelle table
    const [structure] = await connection.execute('DESCRIBE membre_comptes_historique');
    console.log('\nStructure de la table membre_comptes_historique:');
    console.table(structure);
    
    // Vérifier le nombre d'enregistrements migrés
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM membre_comptes_historique');
    console.log(`\n📊 Nombre d'enregistrements dans la table: ${count[0].total}`);
    
    // Vérifier les soldes des membres
    const [soldes] = await connection.execute(`
      SELECT 
        m.nom, 
        m.prenom, 
        m.solde as solde_table_members,
        COALESCE(SUM(mch.montant), 0.00) as solde_calcule
      FROM members m
      LEFT JOIN membre_comptes_historique mch ON m.id = mch.membre_id
      WHERE m.club_id IS NOT NULL
      GROUP BY m.id, m.nom, m.prenom, m.solde
      HAVING m.solde != 0 OR solde_calcule != 0
      ORDER BY m.nom, m.prenom
    `);
    
    if (soldes.length > 0) {
      console.log('\n💰 Soldes des membres:');
      console.table(soldes);
    }
    
    await connection.end();
    console.log('\n🎉 Script terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
}

createMemberAccountsTable();