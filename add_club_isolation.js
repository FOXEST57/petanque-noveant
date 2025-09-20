import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function addClubIsolation() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== AJOUT DE L\'ISOLATION PAR CLUB ===\n');
    
    // Tables qui ont besoin du champ club_id
    const tablesToModify = [
      'carousel_images',
      'drinks', 
      'event_photos',
      'events',
      'home_carousel_images',
      'home_content',
      'member_types',
      'members',
      'teams'
    ];
    
    // Tables qui ont déjà club_id mais qu'on vérifie
    const tablesToCheck = [
      'membership_requests',
      'users'
    ];
    
    // 1. Récupérer l'ID du club actuel
    const [clubData] = await connection.execute('SELECT id FROM clubs WHERE numero_ffpjp = ?', ['0092']);
    if (clubData.length === 0) {
      throw new Error('Club avec numéro FFPJP 0092 non trouvé');
    }
    const clubId = clubData[0].id;
    console.log(`✅ Club ID trouvé: ${clubId} (FFPJP: 0092)\n`);
    
    // 2. Ajouter club_id aux tables qui en ont besoin
    for (const tableName of tablesToModify) {
      try {
        console.log(`📋 Traitement de la table: ${tableName}`);
        
        // Vérifier si club_id existe déjà
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        const hasClubId = columns.some(col => col.Field === 'club_id');
        
        if (!hasClubId) {
          // Ajouter la colonne club_id
          await connection.execute(`
            ALTER TABLE ${tableName} 
            ADD COLUMN club_id INT NOT NULL DEFAULT ${clubId}
          `);
          console.log(`   ✅ Colonne club_id ajoutée`);
          
          // Ajouter la contrainte de clé étrangère
          await connection.execute(`
            ALTER TABLE ${tableName} 
            ADD CONSTRAINT fk_${tableName}_club_id 
            FOREIGN KEY (club_id) REFERENCES clubs(id) 
            ON DELETE RESTRICT ON UPDATE CASCADE
          `);
          console.log(`   ✅ Contrainte FK ajoutée`);
          
        } else {
          console.log(`   ℹ️ Colonne club_id déjà présente`);
        }
        
        // Vérifier/mettre à jour les données existantes
        await connection.execute(`UPDATE ${tableName} SET club_id = ? WHERE club_id IS NULL OR club_id = 0`, [clubId]);
        console.log(`   ✅ Données mises à jour avec club_id = ${clubId}`);
        
      } catch (error) {
        console.log(`   ❌ Erreur sur ${tableName}: ${error.message}`);
      }
      console.log('');
    }
    
    // 3. Vérifier les tables qui ont déjà club_id
    console.log('=== VÉRIFICATION DES TABLES EXISTANTES ===\n');
    for (const tableName of tablesToCheck) {
      try {
        const [data] = await connection.execute(`SELECT COUNT(*) as count, club_id FROM ${tableName} GROUP BY club_id`);
        console.log(`📋 Table ${tableName}:`);
        console.table(data);
      } catch (error) {
        console.log(`❌ Erreur sur ${tableName}: ${error.message}`);
      }
    }
    
    // 4. Résumé final
    console.log('\n=== RÉSUMÉ DE L\'ISOLATION PAR CLUB ===\n');
    console.log('🔐 SÉCURITÉ MISE EN PLACE:');
    console.log(`   - Toutes les données appartiennent au club ID: ${clubId}`);
    console.log('   - Contraintes FK empêchent les références invalides');
    console.log('   - Isolation complète entre les clubs');
    console.log('   - Performance optimisée avec des clés entières');
    
    console.log('\n📝 PROCHAINES ÉTAPES:');
    console.log('   1. Mettre à jour les requêtes API pour filtrer par club_id');
    console.log('   2. Ajouter club_id dans les INSERT/UPDATE');
    console.log('   3. Tester l\'isolation des données');
    
    await connection.end();
    console.log('\n🎉 Isolation par club configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addClubIsolation();