import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions
let pool = null;

// Initialisation de la base de données
export const initDatabase = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test de connexion
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données MySQL établie.');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('Erreur lors de la connexion à MySQL:', error);
    throw error;
  }
};

// Fermeture de la base de données
export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    console.log('Connexion à la base de données fermée.');
  }
};

// Fonction utilitaire pour exécuter une requête
const runQuery = async (sql, params = []) => {
  try {
    if (!pool) {
      throw new Error('Base de données non initialisée');
    }
    
    const [result] = await pool.execute(sql, params);
    return { 
      id: result.insertId, 
      changes: result.affectedRows,
      result 
    };
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
};

// Fonction utilitaire pour récupérer plusieurs lignes
const getAllQuery = async (sql, params = []) => {
  try {
    if (!pool) {
      throw new Error('Base de données non initialisée');
    }
    
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
};

// Fonction utilitaire pour récupérer une seule ligne
const getQuery = async (sql, params = []) => {
  try {
    if (!pool) {
      throw new Error('Base de données non initialisée');
    }
    
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la donnée:', error);
    throw error;
  }
};

// === FONCTIONS CRUD POUR LES MEMBRES ===
export const getMembers = async () => {
  return await getAllQuery(`
    SELECT m.*, mt.nom as type_nom 
    FROM members m 
    LEFT JOIN member_types mt ON m.type_membre_id = mt.id 
    ORDER BY m.nom, m.prenom
  `);
};

export const getMemberById = async (id) => {
  return await getQuery('SELECT * FROM members WHERE id = ?', [id]);
};

export const createMember = async (memberData) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'INSERT INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null]
  );
};

export const updateMember = async (id, memberData) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'UPDATE members SET nom = ?, prenom = ?, adresse = ?, telephone = ?, email = ?, numero_licence = ?, date_entree = ?, date_naissance = ?, type_membre_id = ?, photo_url = ?, updated_at = NOW() WHERE id = ?',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null, id]
  );
};

export const deleteMember = async (id) => {
  return await runQuery('DELETE FROM members WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES TYPES DE MEMBRES ===
export const getMemberTypes = async () => {
  return await getAllQuery('SELECT * FROM member_types ORDER BY nom');
};

export const createMemberType = async (typeData) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'INSERT INTO member_types (nom, description, droits, updated_at) VALUES (?, ?, ?, NOW())',
    [nom, description, JSON.stringify(droits)]
  );
};

export const updateMemberType = async (id, typeData) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'UPDATE member_types SET nom = ?, description = ?, droits = ?, updated_at = NOW() WHERE id = ?',
    [nom, description, JSON.stringify(droits), id]
  );
};

export const deleteMemberType = async (id) => {
  return await runQuery('DELETE FROM member_types WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES ÉVÉNEMENTS ===
export const getEvents = async () => {
  return await getAllQuery('SELECT * FROM events ORDER BY date DESC');
};

export const createEvent = async (eventData) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'INSERT INTO events (title, description, date, heure, lieu, publicCible, photos, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || [])]
  );
};

export const updateEvent = async (id, eventData) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'UPDATE events SET title = ?, description = ?, date = ?, heure = ?, lieu = ?, publicCible = ?, photos = ?, updated_at = NOW() WHERE id = ?',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || []), id]
  );
};

export const deleteEvent = async (id) => {
  return await runQuery('DELETE FROM events WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES PHOTOS D'ÉVÉNEMENTS ===
export const getEventPhotos = async (eventId) => {
  return await getAllQuery('SELECT * FROM event_photos WHERE event_id = ? ORDER BY upload_date DESC', [eventId]);
};

export const getEventPhotoById = async (id) => {
  return await getQuery('SELECT * FROM event_photos WHERE id = ?', [id]);
};

export const createEventPhoto = async (photoData) => {
  const { event_id, filename, original_name, file_path, file_size, mime_type } = photoData;
  return await runQuery(
    'INSERT INTO event_photos (event_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [event_id, filename, original_name, file_path, file_size, mime_type]
  );
};

export const deleteEventPhoto = async (id) => {
  return await runQuery('DELETE FROM event_photos WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES BOISSONS ===
export const getDrinks = async () => {
  return await getAllQuery('SELECT * FROM drinks ORDER BY name');
};

export const createDrink = async (drinkData) => {
  const { name, price, description, image_url, stock } = drinkData;
  return await runQuery(
    'INSERT INTO drinks (name, price, description, image_url, stock, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [name, price, description, image_url, stock || 0]
  );
};

export const updateDrink = async (id, drinkData) => {
  const { name, price, description, image_url, stock } = drinkData;
  return await runQuery(
    'UPDATE drinks SET name = ?, price = ?, description = ?, image_url = ?, stock = ?, updated_at = NOW() WHERE id = ?',
    [name, price, description, image_url, stock, id]
  );
};

export const deleteDrink = async (id) => {
  return await runQuery('DELETE FROM drinks WHERE id = ?', [id]);
};

// === FONCTIONS POUR LES STATISTIQUES ===
export const getStats = async () => {
  try {
    const [membersCount] = await getAllQuery('SELECT COUNT(*) as count FROM members');
    const [eventsCount] = await getAllQuery('SELECT COUNT(*) as count FROM events');
    const [drinksCount] = await getAllQuery('SELECT COUNT(*) as count FROM drinks');
    
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
};

// === FONCTIONS CRUD POUR LES ÉQUIPES ===
export const getTeams = async () => {
  return await getAllQuery(`
    SELECT t.*, 
           COUNT(tm.member_id) as member_count
    FROM teams t 
    LEFT JOIN team_members tm ON t.id = tm.team_id 
    GROUP BY t.id 
    ORDER BY t.name
  `);
};

export const getTeamById = async (id) => {
  return await getQuery('SELECT * FROM teams WHERE id = ?', [id]);
};

export const createTeam = async (teamData) => {
  const { name, category, description, photo_url, competition } = teamData;
  return await runQuery(
    'INSERT INTO teams (name, category, description, photo_url, competition, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [name, category || '', description || '', photo_url || '', competition || '']
  );
};

export const updateTeam = async (id, teamData) => {
  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  
  if (teamData.name !== undefined) {
    fields.push('name = ?');
    values.push(teamData.name);
  }
  if (teamData.category !== undefined) {
    fields.push('category = ?');
    values.push(teamData.category || '');
  }
  if (teamData.description !== undefined) {
    fields.push('description = ?');
    values.push(teamData.description || '');
  }
  if (teamData.photo_url !== undefined) {
    fields.push('photo_url = ?');
    values.push(teamData.photo_url || '');
  }
  if (teamData.competition !== undefined) {
    fields.push('competition = ?');
    values.push(teamData.competition || '');
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = NOW()');
  values.push(id);
  
  const query = `UPDATE teams SET ${fields.join(', ')} WHERE id = ?`;
  return await runQuery(query, values);
};

export const deleteTeam = async (id) => {
  return await runQuery('DELETE FROM teams WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES MEMBRES D'ÉQUIPES ===
export const getTeamMembers = async (teamId) => {
  return await getAllQuery(`
    SELECT tm.*, m.nom, m.prenom, m.photo_url as member_photo
    FROM team_members tm
    JOIN members m ON tm.member_id = m.id
    WHERE tm.team_id = ?
    ORDER BY tm.role DESC, m.nom, m.prenom
  `, [teamId]);
};

export const addTeamMember = async (teamId, memberId, role = 'Joueur') => {
  return await runQuery(
    'INSERT INTO team_members (team_id, member_id, role) VALUES (?, ?, ?)',
    [teamId, memberId, role]
  );
};

export const removeTeamMember = async (teamId, memberId) => {
  return await runQuery(
    'DELETE FROM team_members WHERE team_id = ? AND member_id = ?',
    [teamId, memberId]
  );
};

export const updateTeamMemberRole = async (teamId, memberId, role) => {
  return await runQuery(
    'UPDATE team_members SET role = ? WHERE team_id = ? AND member_id = ?',
    [role, teamId, memberId]
  );
};

export const getTeamWithMembers = async (teamId) => {
  const team = await getTeamById(teamId);
  if (team) {
    team.members = await getTeamMembers(teamId);
  }
  return team;
};

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);