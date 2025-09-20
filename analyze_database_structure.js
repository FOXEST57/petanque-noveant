import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function analyzeDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== ANALYSE DE LA STRUCTURE ACTUELLE ===\n');
    
    // 1. Vérifier la structure de la table clubs
    console.log('📋 STRUCTURE DE LA TABLE CLUBS:');
    const [clubsStructure] = await connection.execute('DESCRIBE clubs');
    console.table(clubsStructure);
    
    // 2. Récupérer toutes les tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log('\n📊 TABLES EXISTANTES:');
    console.log(tableNames.join(', '));
    
    console.log('\n=== ANALYSE DES RÉFÉRENCES AU CLUB ===\n');
    
    // 3. Analyser chaque table pour voir si elle a besoin d'une référence au club
    const tablesNeedingClubRef = [];
    
    for (const tableName of tableNames) {
      if (tableName === 'clubs') continue; // Skip la table clubs elle-même
      
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        const hasClubId = columns.some(col => col.Field === 'club_id');
        const hasFFPJP = columns.some(col => col.Field === 'numero_ffpjp');
        
        console.log(`📋 Table: ${tableName}`);
        console.log(`   - club_id: ${hasClubId ? '✅ PRÉSENT' : '❌ MANQUANT'}`);
        console.log(`   - numero_ffpjp: ${hasFFPJP ? '⚠️ PRÉSENT (à remplacer)' : '✅ ABSENT'}`);
        
        // Déterminer si cette table a besoin d'une référence au club
        const needsClubRef = shouldTableHaveClubReference(tableName, columns);
        console.log(`   - Besoin référence club: ${needsClubRef ? '✅ OUI' : '❌ NON'}`);
        
        if (needsClubRef && !hasClubId) {
          tablesNeedingClubRef.push(tableName);
        }
        
        console.log('');
      } catch (error) {
        console.log(`❌ Erreur sur ${tableName}: ${error.message}\n`);
      }
    }
    
    console.log('\n=== RECOMMANDATIONS DE SÉCURITÉ ===\n');
    
    console.log('🔐 ARCHITECTURE RECOMMANDÉE:');
    console.log('1. Table clubs: id (PK auto-increment) + numero_ffpjp (UNIQUE)');
    console.log('2. Autres tables: club_id (FK vers clubs.id)');
    console.log('3. Avantages:');
    console.log('   - Performance: JOIN sur entiers plus rapide');
    console.log('   - Sécurité: Pas d\'exposition du numéro FFPJP');
    console.log('   - Intégrité: Contraintes FK automatiques');
    console.log('   - Flexibilité: Changement de numéro FFPJP sans impact');
    
    if (tablesNeedingClubRef.length > 0) {
      console.log('\n📝 TABLES À MODIFIER:');
      tablesNeedingClubRef.forEach(table => {
        console.log(`   - ${table}: Ajouter club_id (FK vers clubs.id)`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

function shouldTableHaveClubReference(tableName, columns) {
  // Tables qui ont besoin d'une référence au club
  const tablesNeedingClub = [
    'members', 'membership_requests', 'events', 'teams', 
    'drinks', 'carousel_images', 'home_content'
  ];
  
  // Tables système qui n'ont pas besoin de référence club
  const systemTables = [
    'site_settings', 'users', 'sessions'
  ];
  
  if (systemTables.includes(tableName)) return false;
  if (tablesNeedingClub.includes(tableName)) return true;
  
  // Heuristique: si la table a des données métier, elle a probablement besoin d'une référence club
  const hasBusinessData = columns.some(col => 
    ['nom', 'prenom', 'email', 'titre', 'description', 'date'].includes(col.Field)
  );
  
  return hasBusinessData;
}

analyzeDatabase();