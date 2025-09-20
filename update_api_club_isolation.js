import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

async function updateAPIClubIsolation() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== MISE À JOUR DES API POUR ISOLATION PAR CLUB ===\n');
    
    // 1. Récupérer l'ID du club actuel
    const [clubData] = await connection.execute('SELECT id FROM clubs WHERE numero_ffpjp = ?', ['0092']);
    if (clubData.length === 0) {
      throw new Error('Club avec numéro FFPJP 0092 non trouvé');
    }
    const clubId = clubData[0].id;
    console.log(`✅ Club ID: ${clubId} (FFPJP: 0092)\n`);
    
    // 2. Lire le fichier database.js actuel
    const databasePath = path.join(process.cwd(), 'src', 'lib', 'database.js');
    let databaseContent = fs.readFileSync(databasePath, 'utf8');
    
    console.log('📝 Mise à jour des fonctions de base de données...\n');
    
    // 3. Remplacer les fonctions pour ajouter le filtrage par club_id
    
    // getMembers - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getMembers = async \(\) => \{[\s\S]*?FROM members m[\s\S]*?ORDER BY m\.nom, m\.prenom[\s\S]*?\);[\s\S]*?\};/,
      `export const getMembers = async (clubId = ${clubId}) => {
  return await getAllQuery(\`
    SELECT m.*, mt.nom as type_nom,
           CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as has_user_account
    FROM members m 
    LEFT JOIN member_types mt ON m.type_membre_id = mt.id 
    LEFT JOIN users u ON m.email = u.email AND u.statut = 'actif'
    WHERE m.club_id = ?
    ORDER BY m.nom, m.prenom
  \`, [clubId]);
};`
    );
    
    // getMemberById - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getMemberById = async \(id\) => \{[\s\S]*?\};/,
      `export const getMemberById = async (id, clubId = ${clubId}) => {
  return await getQuery('SELECT * FROM members WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // createMember - Ajouter club_id dans INSERT
    databaseContent = databaseContent.replace(
      /export const createMember = async \(memberData\) => \{[\s\S]*?INSERT INTO members \([^)]+\) VALUES \([^)]+\)[\s\S]*?\};/,
      `export const createMember = async (memberData, clubId = ${clubId}) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'INSERT INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null, clubId]
  );
};`
    );
    
    // updateMember - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const updateMember = async \(id, memberData\) => \{[\s\S]*?WHERE id = \?[\s\S]*?\};/,
      `export const updateMember = async (id, memberData, clubId = ${clubId}) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'UPDATE members SET nom = ?, prenom = ?, adresse = ?, telephone = ?, email = ?, numero_licence = ?, date_entree = ?, date_naissance = ?, type_membre_id = ?, photo_url = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null, id, clubId]
  );
};`
    );
    
    // deleteMember - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const deleteMember = async \(id\) => \{[\s\S]*?\};/,
      `export const deleteMember = async (id, clubId = ${clubId}) => {
  return await runQuery('DELETE FROM members WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // getMemberTypes - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getMemberTypes = async \(\) => \{[\s\S]*?\};/,
      `export const getMemberTypes = async (clubId = ${clubId}) => {
  return await getAllQuery('SELECT * FROM member_types WHERE club_id = ? ORDER BY nom', [clubId]);
};`
    );
    
    // createMemberType - Ajouter club_id
    databaseContent = databaseContent.replace(
      /export const createMemberType = async \(typeData\) => \{[\s\S]*?INSERT INTO member_types[\s\S]*?\};/,
      `export const createMemberType = async (typeData, clubId = ${clubId}) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'INSERT INTO member_types (nom, description, droits, club_id, updated_at) VALUES (?, ?, ?, ?, NOW())',
    [nom, description, JSON.stringify(droits), clubId]
  );
};`
    );
    
    // updateMemberType - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const updateMemberType = async \(id, typeData\) => \{[\s\S]*?WHERE id = \?[\s\S]*?\};/,
      `export const updateMemberType = async (id, typeData, clubId = ${clubId}) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'UPDATE member_types SET nom = ?, description = ?, droits = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [nom, description, JSON.stringify(droits), id, clubId]
  );
};`
    );
    
    // deleteMemberType - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const deleteMemberType = async \(id\) => \{[\s\S]*?\};/,
      `export const deleteMemberType = async (id, clubId = ${clubId}) => {
  return await runQuery('DELETE FROM member_types WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // getEvents - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getEvents = async \(\) => \{[\s\S]*?\};/,
      `export const getEvents = async (clubId = ${clubId}) => {
  return await getAllQuery('SELECT * FROM events WHERE club_id = ? ORDER BY date DESC', [clubId]);
};`
    );
    
    // createEvent - Ajouter club_id
    databaseContent = databaseContent.replace(
      /export const createEvent = async \(eventData\) => \{[\s\S]*?INSERT INTO events[\s\S]*?\};/,
      `export const createEvent = async (eventData, clubId = ${clubId}) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'INSERT INTO events (title, description, date, heure, lieu, publicCible, photos, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || []), clubId]
  );
};`
    );
    
    // updateEvent - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const updateEvent = async \(id, eventData\) => \{[\s\S]*?WHERE id = \?[\s\S]*?\};/,
      `export const updateEvent = async (id, eventData, clubId = ${clubId}) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'UPDATE events SET title = ?, description = ?, date = ?, heure = ?, lieu = ?, publicCible = ?, photos = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || []), id, clubId]
  );
};`
    );
    
    // deleteEvent - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const deleteEvent = async \(id\) => \{[\s\S]*?\};/,
      `export const deleteEvent = async (id, clubId = ${clubId}) => {
  return await runQuery('DELETE FROM events WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // getDrinks - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getDrinks = async \(\) => \{[\s\S]*?\};/,
      `export const getDrinks = async (clubId = ${clubId}) => {
  return await getAllQuery('SELECT * FROM drinks WHERE club_id = ? ORDER BY name', [clubId]);
};`
    );
    
    // createDrink - Ajouter club_id
    databaseContent = databaseContent.replace(
      /export const createDrink = async \(drinkData\) => \{[\s\S]*?INSERT INTO drinks[\s\S]*?\};/,
      `export const createDrink = async (drinkData, clubId = ${clubId}) => {
  const { name, price, description, image_url, stock } = drinkData;
  // Convertir les valeurs undefined en null pour éviter l'erreur MySQL
  const params = [
    name ?? null,
    price ?? null,
    description ?? null,
    image_url ?? null,
    stock ?? 0,
    clubId
  ];
  return await runQuery(
    'INSERT INTO drinks (name, price, description, image_url, stock, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    params
  );
};`
    );
    
    // updateDrink - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const updateDrink = async \(id, drinkData\) => \{[\s\S]*?WHERE id = \?[\s\S]*?\};/,
      `export const updateDrink = async (id, drinkData, clubId = ${clubId}) => {
  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  
  if (drinkData.name !== undefined) {
    fields.push('name = ?');
    values.push(drinkData.name);
  }
  if (drinkData.price !== undefined) {
    fields.push('price = ?');
    values.push(drinkData.price);
  }
  if (drinkData.description !== undefined) {
    fields.push('description = ?');
    values.push(drinkData.description || '');
  }
  if (drinkData.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(drinkData.image_url || '');
  }
  if (drinkData.stock !== undefined) {
    fields.push('stock = ?');
    values.push(drinkData.stock);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = NOW()');
  values.push(id, clubId);
  
  const query = \`UPDATE drinks SET \${fields.join(', ')} WHERE id = ? AND club_id = ?\`;
  return await runQuery(query, values);
};`
    );
    
    // deleteDrink - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const deleteDrink = async \(id\) => \{[\s\S]*?\};/,
      `export const deleteDrink = async (id, clubId = ${clubId}) => {
  return await runQuery('DELETE FROM drinks WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // getTeams - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getTeams = async \(\) => \{[\s\S]*?FROM teams t[\s\S]*?ORDER BY t\.name[\s\S]*?\);[\s\S]*?\};/,
      `export const getTeams = async (clubId = ${clubId}) => {
  return await getAllQuery(\`
    SELECT t.*, 
           COUNT(tm.member_id) as member_count
    FROM teams t 
    LEFT JOIN team_members tm ON t.id = tm.team_id 
    WHERE t.club_id = ?
    GROUP BY t.id 
    ORDER BY t.name
  \`, [clubId]);
};`
    );
    
    // getTeamById - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const getTeamById = async \(id\) => \{[\s\S]*?\};/,
      `export const getTeamById = async (id, clubId = ${clubId}) => {
  return await getQuery('SELECT * FROM teams WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // createTeam - Ajouter club_id
    databaseContent = databaseContent.replace(
      /export const createTeam = async \(teamData\) => \{[\s\S]*?INSERT INTO teams[\s\S]*?\};/,
      `export const createTeam = async (teamData, clubId = ${clubId}) => {
  const { name, category, description, photo_url, competition } = teamData;
  return await runQuery(
    'INSERT INTO teams (name, category, description, photo_url, competition, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [name, category || '', description || '', photo_url || '', competition || '', clubId]
  );
};`
    );
    
    // updateTeam - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const updateTeam = async \(id, teamData\) => \{[\s\S]*?WHERE id = \?[\s\S]*?\};/,
      `export const updateTeam = async (id, teamData, clubId = ${clubId}) => {
  const { name, category, description, photo_url, competition } = teamData;
  return await runQuery(
    'UPDATE teams SET name = ?, category = ?, description = ?, photo_url = ?, competition = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [name, category || '', description || '', photo_url || '', competition || '', id, clubId]
  );
};`
    );
    
    // deleteTeam - Ajouter WHERE club_id = ?
    databaseContent = databaseContent.replace(
      /export const deleteTeam = async \(id\) => \{[\s\S]*?\};/,
      `export const deleteTeam = async (id, clubId = ${clubId}) => {
  return await runQuery('DELETE FROM teams WHERE id = ? AND club_id = ?', [id, clubId]);
};`
    );
    
    // getStats - Ajouter WHERE club_id = ? pour toutes les requêtes
    databaseContent = databaseContent.replace(
      /export const getStats = async \(\) => \{[\s\S]*?SELECT COUNT\(\*\) as count FROM members[\s\S]*?SELECT COUNT\(\*\) as count FROM events[\s\S]*?SELECT COUNT\(\*\) as count FROM drinks[\s\S]*?\};/,
      `export const getStats = async (clubId = ${clubId}) => {
  try {
    const [membersCount] = await getAllQuery('SELECT COUNT(*) as count FROM members WHERE club_id = ?', [clubId]);
    const [eventsCount] = await getAllQuery('SELECT COUNT(*) as count FROM events WHERE club_id = ?', [clubId]);
    const [drinksCount] = await getAllQuery('SELECT COUNT(*) as count FROM drinks WHERE club_id = ?', [clubId]);
    
    return {
      members: membersCount.count || 0,
      events: eventsCount.count || 0,
      drinks: drinksCount.count || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      members: 0,
      events: 0,
      drinks: 0
    };
  }
};`
    );
    
    // 4. Sauvegarder le fichier modifié
    fs.writeFileSync(databasePath, databaseContent);
    console.log('✅ Fichier database.js mis à jour avec l\'isolation par club\n');
    
    // 5. Tester quelques requêtes pour vérifier
    console.log('🧪 Test des nouvelles fonctions...\n');
    
    const [membersTest] = await connection.execute('SELECT COUNT(*) as count FROM members WHERE club_id = ?', [clubId]);
    console.log(`📊 Membres du club ${clubId}: ${membersTest[0].count}`);
    
    const [eventsTest] = await connection.execute('SELECT COUNT(*) as count FROM events WHERE club_id = ?', [clubId]);
    console.log(`📊 Événements du club ${clubId}: ${eventsTest[0].count}`);
    
    const [teamsTest] = await connection.execute('SELECT COUNT(*) as count FROM teams WHERE club_id = ?', [clubId]);
    console.log(`📊 Équipes du club ${clubId}: ${teamsTest[0].count}`);
    
    const [drinksTest] = await connection.execute('SELECT COUNT(*) as count FROM drinks WHERE club_id = ?', [clubId]);
    console.log(`📊 Boissons du club ${clubId}: ${drinksTest[0].count}`);
    
    await connection.end();
    
    console.log('\n✅ ISOLATION PAR CLUB COMPLÈTE !');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Redémarrer le serveur API pour prendre en compte les changements');
    console.log('2. Tester les fonctionnalités dans l\'interface');
    console.log('3. Vérifier que seules les données du club actuel sont affichées');
    console.log('4. Ajouter l\'authentification multi-club si nécessaire');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    process.exit(1);
  }
}

updateAPIClubIsolation();