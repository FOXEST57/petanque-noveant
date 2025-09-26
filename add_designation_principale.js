import mysql from 'mysql2/promise';

async function addDesignationPrincipale() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'petanque_noveant'
  });

  try {
    console.log('Connexion à la base de données établie');
    
    // Vérifier si la colonne existe déjà
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'petanque_noveant' 
      AND TABLE_NAME = 'caisse_historique' 
      AND COLUMN_NAME = 'designation_principale'
    `);
    
    if (columns.length > 0) {
      console.log('⚠️ La colonne designation_principale existe déjà');
    } else {
      // Ajouter la colonne designation_principale
      await connection.execute(`
        ALTER TABLE caisse_historique 
        ADD COLUMN designation_principale VARCHAR(100) NULL 
        AFTER description
      `);
      console.log('✅ Colonne designation_principale ajoutée');
    }
    
    // Mettre à jour les enregistrements existants
    const [result] = await connection.execute(`
      UPDATE caisse_historique 
      SET designation_principale = CASE 
          WHEN type_operation = 'credit' THEN 'Crédit membre'
          WHEN type_operation = 'ajout_especes' THEN 'Ajout espèces'
          WHEN type_operation = 'retrait_especes' THEN 'Retrait espèces'
          WHEN type_operation = 'transfert' THEN 'Transfert'
          WHEN type_operation = 'fond' THEN 'Fond de caisse'
          WHEN type_operation = 'depense' THEN 'Dépense'
          WHEN type_operation = 'transfert_bancaire' THEN 'Transfert bancaire'
          ELSE 'Opération'
      END
      WHERE designation_principale IS NULL
    `);
    
    console.log(`✅ ${result.affectedRows} enregistrements mis à jour`);
    
    // Vérifier les résultats
    const [stats] = await connection.execute(`
      SELECT designation_principale, COUNT(*) as count
      FROM caisse_historique 
      GROUP BY designation_principale
      ORDER BY count DESC
    `);
    
    console.log('\n📊 Répartition des désignations principales:');
    console.table(stats);
    
    await connection.end();
    console.log('\n🎉 Script terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addDesignationPrincipale();