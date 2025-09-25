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

// Fonction pour créer les tables si elles n'existent pas
const createTablesIfNotExists = async () => {
  try {
    // Créer la table home_content
    await runQuery(`
      CREATE TABLE IF NOT EXISTS home_content (
        id INT PRIMARY KEY DEFAULT 1,
        title VARCHAR(255) NOT NULL DEFAULT 'Bienvenue au Club de Pétanque de Noveant',
        description TEXT,
        schedules TEXT,
        contact TEXT,
        practical_info TEXT,
        location TEXT,
        members TEXT,
        club_title VARCHAR(255) DEFAULT 'Découvrez notre club',
        club_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Créer la table home_carousel_images
    await runQuery(`
      CREATE TABLE IF NOT EXISTS home_carousel_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        home_content_id INT DEFAULT 1,
        image_url VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (home_content_id) REFERENCES home_content(id) ON DELETE CASCADE
      )
    `);
    
    // Insérer le contenu par défaut si la table est vide
    const existingContent = await getQuery('SELECT id FROM home_content WHERE id = 1');
    if (!existingContent) {
      await runQuery(`
        INSERT INTO home_content (id, title, description, schedules, contact, practical_info, location, members, club_title, club_description)
        VALUES (1, 'Bienvenue au Club de Pétanque de Noveant', 
                'Découvrez notre club convivial et nos activités.',
                'Ouvert tous les jours de 14h à 18h',
                'Téléphone: 03 87 XX XX XX\nEmail: contact@petanque-noveant.fr',
                'Parking gratuit disponible\nAccès handicapés',
                'Notre club est situé au cœur de Noveant-sur-Moselle, dans un cadre verdoyant et convivial.',
                'Notre club compte une cinquantaine de membres passionnés de pétanque, de tous âges et de tous niveaux.',
                'Découvrez notre club',
                'Un club dynamique qui propose de nombreuses activités tout au long de l\'année')
      `);
    }
    
    console.log('Tables home_content et home_carousel_images créées/vérifiées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    // Ne pas faire échouer l'initialisation si les tables existent déjà
  }
};

// Initialisation de la base de données
export const initDatabase = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test de connexion
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données MySQL établie.');
    connection.release();
    
    // Créer les tables si nécessaire
    await createTablesIfNotExists();
    
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
export const getMembers = async (clubId = 1) => {
  return await getAllQuery(`
    SELECT m.*, mt.nom as type_nom,
           CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as has_user_account
    FROM members m 
    LEFT JOIN member_types mt ON m.type_membre_id = mt.id 
    LEFT JOIN users u ON m.email = u.email AND u.statut = 'actif'
    WHERE m.club_id = ?
    ORDER BY m.nom, m.prenom
  `, [clubId]);
};

export const getMemberById = async (id, clubId = 1) => {
  return await getQuery('SELECT * FROM members WHERE id = ? AND club_id = ?', [id, clubId]);
};

export const createMember = async (memberData, clubId = 1) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'INSERT INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null, clubId]
  );
};

export const updateMember = async (id, memberData, clubId = 1) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return await runQuery(
    'UPDATE members SET nom = ?, prenom = ?, adresse = ?, telephone = ?, email = ?, numero_licence = ?, date_entree = ?, date_naissance = ?, type_membre_id = ?, photo_url = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [nom || null, prenom || null, adresse || null, telephone || null, email || null, numero_licence || null, date_entree || null, date_naissance || null, type_membre_id || null, photo_url || null, id, clubId]
  );
};

export const deleteMember = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM members WHERE id = ? AND club_id = ?', [id, clubId]);
};

// === FONCTIONS CRUD POUR LES TYPES DE MEMBRES ===
export const getMemberTypes = async (clubId = 1) => {
  return await getAllQuery('SELECT * FROM member_types WHERE club_id = ? ORDER BY nom', [clubId]);
};

export const createMemberType = async (typeData, clubId = 1) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'INSERT INTO member_types (nom, description, droits, club_id, updated_at) VALUES (?, ?, ?, ?, NOW())',
    [nom, description, JSON.stringify(droits), clubId]
  );
};

export const updateMemberType = async (id, typeData, clubId = 1) => {
  const { nom, description, droits } = typeData;
  return await runQuery(
    'UPDATE member_types SET nom = ?, description = ?, droits = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [nom, description, JSON.stringify(droits), id, clubId]
  );
};

export const deleteMemberType = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM member_types WHERE id = ? AND club_id = ?', [id, clubId]);
};

// === FONCTIONS CRUD POUR LES ÉVÉNEMENTS ===
export const getEvents = async (clubId = 1) => {
  const events = await getAllQuery('SELECT * FROM events WHERE club_id = ? ORDER BY date DESC', [clubId]);
  
  // Parser le champ photos JSON et mapper les champs pour le frontend
  return events.map(event => {
    let photos = [];
    if (event.photos) {
      try {
        photos = typeof event.photos === 'string' ? JSON.parse(event.photos) : event.photos;
      } catch (e) {
        console.error(`Erreur lors du parsing des photos pour l'événement ${event.id}:`, e);
        photos = [];
      }
    }
    
    // Mapper les champs de la base de données vers ceux attendus par le frontend
    return {
      id: event.id,
      titre: event.title,           // title -> titre
      title: event.title,           // Garder aussi title pour compatibilité
      description: event.description,
      date_debut: event.date,       // date -> date_debut
      date_fin: event.date,         // Utiliser la même date pour date_fin
      date: event.date,             // Garder aussi date pour compatibilité
      heure: event.heure,
      lieu: event.lieu,
      publicCible: event.publicCible,
      statut: 'public',             // Statut par défaut
      visibilite: 'public',         // Visibilité par défaut
      photos: photos,
      club_id: event.club_id,
      created_at: event.created_at,
      updated_at: event.updated_at
    };
  });
};

export const createEvent = async (eventData, clubId = 1) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'INSERT INTO events (title, description, date, heure, lieu, publicCible, photos, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || []), clubId]
  );
};

export const updateEvent = async (id, eventData, clubId = 1) => {
  const { title, description, date, heure, lieu, publicCible, photos } = eventData;
  return await runQuery(
    'UPDATE events SET title = ?, description = ?, date = ?, heure = ?, lieu = ?, publicCible = ?, photos = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [title, description, date, heure || '', lieu || '', publicCible || '', JSON.stringify(photos || []), id, clubId]
  );
};

export const deleteEvent = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM events WHERE id = ? AND club_id = ?', [id, clubId]);
};

// === FONCTIONS CRUD POUR LES PHOTOS D'ÉVÉNEMENTS ===
export const getEventPhotos = async (eventId, clubId = 1) => {
  const photos = await getAllQuery(`
    SELECT ep.* 
    FROM event_photos ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.event_id = ? AND e.club_id = ?
    ORDER BY ep.upload_date DESC
  `, [eventId, clubId]);
  
  // Construire les URLs complètes pour chaque photo avec la route API correcte
  const apiBaseUrl = import.meta?.env?.VITE_API_URL || 'http://localhost:3007';
  return photos.map(photo => ({
    ...photo,
    url: `${apiBaseUrl}/uploads/events/${photo.filename}`
  }));
};

export const getEventPhotoById = async (id, clubId = 1) => {
  return await getQuery(`
    SELECT ep.* 
    FROM event_photos ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.id = ? AND e.club_id = ?
  `, [id, clubId]);
};

export const createEventPhoto = async (photoData, clubId = 1) => {
  const { event_id, filename, original_name, file_path, file_size, mime_type } = photoData;
  
  // Vérifier que l'événement appartient au club
  const eventCheck = await getQuery('SELECT id, photos FROM events WHERE id = ? AND club_id = ?', [event_id, clubId]);
  if (!eventCheck) {
    throw new Error('L\'événement n\'appartient pas au club spécifié');
  }

  // Insérer la photo dans la table event_photos
  const result = await runQuery(
    'INSERT INTO event_photos (event_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [event_id, filename, original_name, file_path, file_size, mime_type]
  );

  // Mettre à jour le champ photos JSON dans la table events
  let currentPhotos = [];
  try {
    currentPhotos = eventCheck.photos ? JSON.parse(eventCheck.photos) : [];
  } catch (e) {
    currentPhotos = [];
  }

  // Ajouter la nouvelle photo au tableau
  currentPhotos.push({
    id: result.insertId,
    filename,
    original_name,
    file_path,
    file_size,
    mime_type
  });

  // Mettre à jour l'événement avec le nouveau tableau de photos
  await runQuery(
    'UPDATE events SET photos = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [JSON.stringify(currentPhotos), event_id, clubId]
  );

  return result;
};

export const deleteEventPhoto = async (id, clubId = 1) => {
  // Récupérer les informations de la photo avant suppression
  const photoInfo = await getQuery(`
    SELECT ep.*, e.photos 
    FROM event_photos ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.id = ? AND e.club_id = ?
  `, [id, clubId]);

  if (!photoInfo) {
    throw new Error('La photo n\'appartient pas à un événement du club spécifié');
  }

  // Supprimer la photo de la table event_photos
  const result = await runQuery('DELETE FROM event_photos WHERE id = ?', [id]);

  // Mettre à jour le champ photos JSON dans la table events
  let currentPhotos = [];
  try {
    currentPhotos = photoInfo.photos ? JSON.parse(photoInfo.photos) : [];
  } catch (e) {
    currentPhotos = [];
  }

  // Retirer la photo supprimée du tableau
  currentPhotos = currentPhotos.filter(photo => photo.id !== id);

  // Mettre à jour l'événement avec le nouveau tableau de photos
  await runQuery(
    'UPDATE events SET photos = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [JSON.stringify(currentPhotos), photoInfo.event_id, clubId]
  );

  return result;
};

// === FONCTIONS CRUD POUR LES BOISSONS ===
export const getDrinks = async (clubId = 1) => {
  return await getAllQuery('SELECT * FROM drinks WHERE club_id = ? ORDER BY name', [clubId]);
};

export const createDrink = async (drinkData, clubId = 1) => {
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
};

export const updateDrink = async (id, drinkData, clubId = 1) => {
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
  
  const query = `UPDATE drinks SET ${fields.join(', ')} WHERE id = ? AND club_id = ?`;
  return await runQuery(query, values);
};

export const deleteDrink = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM drinks WHERE id = ? AND club_id = ?', [id, clubId]);
};

// === FONCTIONS POUR LES STATISTIQUES ===
export const getStats = async (clubId = 1) => {
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
};

// === FONCTIONS CRUD POUR LES ÉQUIPES ===
export const getTeams = async (clubId = 1) => {
  return await getAllQuery(`
    SELECT t.*, 
           COUNT(tm.member_id) as member_count
    FROM teams t 
    LEFT JOIN team_members tm ON t.id = tm.team_id 
    WHERE t.club_id = ?
    GROUP BY t.id 
    ORDER BY t.name
  `, [clubId]);
};

export const getTeamById = async (id, clubId = 1) => {
  return await getQuery('SELECT * FROM teams WHERE id = ? AND club_id = ?', [id, clubId]);
};

export const createTeam = async (teamData, clubId = 1) => {
  const { name, category, description, photo_url, competition } = teamData;
  return await runQuery(
    'INSERT INTO teams (name, category, description, photo_url, competition, club_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [name, category || '', description || '', photo_url || '', competition || '', clubId]
  );
};

export const updateTeam = async (id, teamData, clubId = 1) => {
  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  
  if (teamData.name !== undefined && teamData.name !== null) {
    fields.push('name = ?');
    values.push(teamData.name);
  }
  if (teamData.category !== undefined && teamData.category !== null) {
    fields.push('category = ?');
    values.push(teamData.category || '');
  }
  if (teamData.description !== undefined && teamData.description !== null) {
    fields.push('description = ?');
    values.push(teamData.description || '');
  }
  if (teamData.photo_url !== undefined && teamData.photo_url !== null) {
    fields.push('photo_url = ?');
    values.push(teamData.photo_url || '');
  }
  if (teamData.competition !== undefined && teamData.competition !== null) {
    fields.push('competition = ?');
    values.push(teamData.competition || '');
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = NOW()');
  values.push(id, clubId);
  
  const query = `UPDATE teams SET ${fields.join(', ')} WHERE id = ? AND club_id = ?`;
  return await runQuery(query, values);
};

export const deleteTeam = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM teams WHERE id = ? AND club_id = ?', [id, clubId]);
};

// === FONCTIONS CRUD POUR LES MEMBRES D'ÉQUIPES ===
export const getTeamMembers = async (teamId, clubId = 1) => {
  return await getAllQuery(`
    SELECT tm.*, m.nom, m.prenom, m.photo_url as member_photo
    FROM team_members tm
    JOIN members m ON tm.member_id = m.id
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.team_id = ? AND t.club_id = ? AND m.club_id = ?
    ORDER BY tm.role DESC, m.nom, m.prenom
  `, [teamId, clubId, clubId]);
};

export const addTeamMember = async (teamId, memberId, role = 'Joueur', clubId = 1) => {
  // Vérifier que l'équipe et le membre appartiennent au même club
  const teamCheck = await getQuery('SELECT id FROM teams WHERE id = ? AND club_id = ?', [teamId, clubId]);
  const memberCheck = await getQuery('SELECT id FROM members WHERE id = ? AND club_id = ?', [memberId, clubId]);
  
  if (!teamCheck || !memberCheck) {
    throw new Error('L\'équipe ou le membre n\'appartient pas au club spécifié');
  }
  
  return await runQuery(
    'INSERT INTO team_members (team_id, member_id, role) VALUES (?, ?, ?)',
    [teamId, memberId, role]
  );
};

export const removeTeamMember = async (teamId, memberId, clubId = 1) => {
  // Vérifier que l'équipe appartient au club
  const teamCheck = await getQuery('SELECT id FROM teams WHERE id = ? AND club_id = ?', [teamId, clubId]);
  if (!teamCheck) {
    throw new Error('L\'équipe n\'appartient pas au club spécifié');
  }
  
  return await runQuery(
    'DELETE FROM team_members WHERE team_id = ? AND member_id = ?',
    [teamId, memberId]
  );
};

export const updateTeamMemberRole = async (teamId, memberId, role, clubId = 1) => {
  // Vérifier que l'équipe appartient au club
  const teamCheck = await getQuery('SELECT id FROM teams WHERE id = ? AND club_id = ?', [teamId, clubId]);
  if (!teamCheck) {
    throw new Error('L\'équipe n\'appartient pas au club spécifié');
  }
  
  return await runQuery(
    'UPDATE team_members SET role = ? WHERE team_id = ? AND member_id = ?',
    [role, teamId, memberId]
  );
};

export const getTeamWithMembers = async (teamId, clubId = 1) => {
  const team = await getTeamById(teamId, clubId);
  if (team) {
    team.members = await getTeamMembers(teamId, clubId);
  }
  return team;
};

// === FONCTIONS CRUD POUR LES IMAGES DU CARROUSEL ===
export const getCarouselImages = async (clubId = 1) => {
  return await getAllQuery('SELECT * FROM carousel_images WHERE is_active = TRUE AND club_id = ? ORDER BY display_order ASC, created_at DESC', [clubId]);
};

export const getAllCarouselImages = async (clubId = 1) => {
  return await getAllQuery('SELECT * FROM carousel_images WHERE club_id = ? ORDER BY display_order ASC, created_at DESC', [clubId]);
};

export const getCarouselImageById = async (id, clubId = 1) => {
  return await getQuery('SELECT * FROM carousel_images WHERE id = ? AND club_id = ?', [id, clubId]);
};

export const addCarouselImage = async (imageData, clubId = 1) => {
  const { title, image_url, display_order, is_active } = imageData;
  
  // Si display_order n'est pas fourni, calculer la prochaine position disponible pour ce club
  let finalDisplayOrder = display_order;
  if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
    const maxOrderResult = await getQuery('SELECT MAX(display_order) as max_order FROM carousel_images WHERE club_id = ?', [clubId]);
    finalDisplayOrder = (maxOrderResult?.max_order || 0) + 1;
  }
  
  return await runQuery(
    'INSERT INTO carousel_images (title, image_url, display_order, is_active, club_id, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [title || '', image_url, finalDisplayOrder, is_active !== undefined ? is_active : true, clubId]
  );
};

export const updateCarouselImage = async (id, imageData, clubId = 1) => {
  // Vérifier que l'image appartient au club
  const imageCheck = await getQuery('SELECT id FROM carousel_images WHERE id = ? AND club_id = ?', [id, clubId]);
  if (!imageCheck) {
    throw new Error('L\'image du carousel n\'appartient pas au club spécifié');
  }

  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  
  if (imageData.title !== undefined) {
    fields.push('title = ?');
    values.push(imageData.title || '');
  }
  if (imageData.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(imageData.image_url);
  }
  if (imageData.display_order !== undefined) {
    fields.push('display_order = ?');
    values.push(imageData.display_order);
  }
  if (imageData.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(imageData.is_active);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('updated_at = NOW()');
  values.push(id);
  
  const query = `UPDATE carousel_images SET ${fields.join(', ')} WHERE id = ? AND club_id = ?`;
  values.push(clubId);
  return await runQuery(query, values);
};

export const deleteCarouselImage = async (id, clubId = 1) => {
  // Vérifier que l'image appartient au club
  const imageCheck = await getQuery('SELECT id FROM carousel_images WHERE id = ? AND club_id = ?', [id, clubId]);
  if (!imageCheck) {
    throw new Error('L\'image du carousel n\'appartient pas au club spécifié');
  }
  
  return await runQuery('DELETE FROM carousel_images WHERE id = ? AND club_id = ?', [id, clubId]);
};

export const updateCarouselImageOrder = async (imageId, newOrder, clubId = 1) => {
  // Vérifier que l'image appartient au club
  const imageCheck = await getQuery('SELECT id FROM carousel_images WHERE id = ? AND club_id = ?', [imageId, clubId]);
  if (!imageCheck) {
    throw new Error('L\'image du carousel n\'appartient pas au club spécifié');
  }
  
  return await runQuery(
    'UPDATE carousel_images SET display_order = ?, updated_at = NOW() WHERE id = ? AND club_id = ?',
    [newOrder, imageId, clubId]
  );
};

// === FONCTIONS CRUD POUR LE CONTENU DE LA PAGE D'ACCUEIL ===
export const getHomeContent = async (clubId = 1) => {
  const content = await getQuery('SELECT * FROM home_content WHERE club_id = ?', [clubId]);
  if (!content) {
    // Retourner un contenu par défaut si aucun n'existe
    return {
      club_id: clubId,
      title: 'Bienvenue au Club de Pétanque',
      description: 'Découvrez notre club convivial et nos activités.',
      schedules: 'Ouvert tous les jours de 14h à 18h',
      contact: 'Téléphone: XX XX XX XX XX\nEmail: contact@club-petanque.fr',
      practical_info: 'Parking gratuit disponible\nAccès handicapés',
      location: 'Notre club est situé dans un cadre verdoyant et convivial.',
      members: 'Notre club compte des membres passionnés de pétanque, de tous âges et de tous niveaux.',
      club_title: 'Découvrez notre club',
      club_description: 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année',
      teams_content: 'Nos équipes évoluent dans différents championnats départementaux et régionaux. Que vous soyez débutant ou confirmé, vous trouverez votre place dans nos équipes compétitives.',
      animations_content: 'Tout au long de l\'année, nous organisons des animations conviviales : concours amicaux, soirées à thème, barbecues et événements festifs pour rassembler tous les membres.',
      tournaments_content: 'Participez à nos tournois réguliers ! Nous organisons des compétitions internes mensuelles et participons aux grands tournois de la région pour tous les niveaux.',
      carousel_images: []
    };
  }
  
  // Récupérer les images du carrousel associées
  const carouselImages = await getAllQuery(
    'SELECT * FROM home_carousel_images WHERE home_content_id = ? ORDER BY display_order ASC',
    [content.id]
  );
  
  return {
    ...content,
    carousel_images: carouselImages
  };
};

export const updateHomeContent = async (contentData, clubId = 1) => {
  // Vérifier si un enregistrement existe
  const existing = await getQuery('SELECT * FROM home_content WHERE club_id = ?', [clubId]);
  
  if (existing) {
    // Construire la requête de mise à jour dynamiquement
    const fields = [];
    const values = [];
    
    if (contentData.title !== undefined) {
      fields.push('title = ?');
      values.push(contentData.title === '' ? null : contentData.title);
    }
    if (contentData.description !== undefined) {
      fields.push('description = ?');
      values.push(contentData.description === '' ? null : contentData.description);
    }
    if (contentData.schedules !== undefined) {
      fields.push('schedules = ?');
      values.push(contentData.schedules === '' ? null : contentData.schedules);
    }
    if (contentData.contact !== undefined) {
      fields.push('contact = ?');
      values.push(contentData.contact === '' ? null : contentData.contact);
    }
    if (contentData.practical_info !== undefined) {
      fields.push('practical_info = ?');
      values.push(contentData.practical_info === '' ? null : contentData.practical_info);
    }
    if (contentData.location !== undefined) {
      fields.push('location = ?');
      values.push(contentData.location === '' ? null : contentData.location);
    }
    if (contentData.members !== undefined) {
      fields.push('members = ?');
      values.push(contentData.members === '' ? null : contentData.members);
    }
    if (contentData.club_title !== undefined) {
      fields.push('club_title = ?');
      values.push(contentData.club_title === '' ? null : contentData.club_title);
    }
    if (contentData.club_description !== undefined) {
      fields.push('club_description = ?');
      values.push(contentData.club_description === '' ? null : contentData.club_description);
    }
    if (contentData.teams_content !== undefined) {
      fields.push('teams_content = ?');
      values.push(contentData.teams_content === '' ? null : contentData.teams_content);
    }
    if (contentData.animations_content !== undefined) {
      fields.push('animations_content = ?');
      values.push(contentData.animations_content === '' ? null : contentData.animations_content);
    }
    if (contentData.tournaments_content !== undefined) {
      fields.push('tournaments_content = ?');
      values.push(contentData.tournaments_content === '' ? null : contentData.tournaments_content);
    }
    
    if (fields.length === 0) {
      console.log('Aucun champ à mettre à jour');
      return existing;
    }
    
    fields.push('updated_at = NOW()');
    values.push(clubId);
    const query = `UPDATE home_content SET ${fields.join(', ')} WHERE club_id = ?`;
    
    await runQuery(query, values);
    return await getQuery('SELECT * FROM home_content WHERE club_id = ?', [clubId]);
  } else {
    // Créer un nouvel enregistrement avec des valeurs par défaut
    const title = contentData.title || 'Bienvenue au Club de Pétanque';
    const description = contentData.description || 'Découvrez notre club convivial et nos activités.';
    const schedules = contentData.schedules || 'Ouvert tous les jours de 14h à 18h';
    const contact = contentData.contact || 'Téléphone: XX XX XX XX XX\nEmail: contact@club-petanque.fr';
    const practical_info = contentData.practical_info || 'Parking gratuit disponible\nAccès handicapés';
    const location = contentData.location || 'Notre club est situé dans un cadre verdoyant et convivial.';
    const members = contentData.members || 'Notre club compte des membres passionnés de pétanque, de tous âges et de tous niveaux.';
    const club_title = contentData.club_title || 'Découvrez notre club';
    const club_description = contentData.club_description || 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année';
    const teams_content = contentData.teams_content || 'Nos équipes évoluent dans différents championnats départementaux et régionaux. Que vous soyez débutant ou confirmé, vous trouverez votre place dans nos équipes compétitives.';
    const animations_content = contentData.animations_content || 'Tout au long de l\'année, nous organisons des animations conviviales : concours amicaux, soirées à thème, barbecues et événements festifs pour rassembler tous les membres.';
    const tournaments_content = contentData.tournaments_content || 'Participez à nos tournois réguliers ! Nous organisons des compétitions internes mensuelles et participons aux grands tournois de la région pour tous les niveaux.';
    
    await runQuery(
      'INSERT INTO home_content (club_id, title, description, schedules, contact, practical_info, location, members, club_title, club_description, teams_content, animations_content, tournaments_content, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [clubId, title || null, description || null, schedules || null, contact || null, practical_info || null, location || null, members || null, club_title || null, club_description || null, teams_content || null, animations_content || null, tournaments_content || null]
    );
    return await getQuery('SELECT * FROM home_content WHERE club_id = ?', [clubId]);
  }
};

// === FONCTIONS CRUD POUR LES IMAGES DU CARROUSEL DE LA PAGE D'ACCUEIL ===
export const getHomeCarouselImages = async (clubId = 1) => {
  return await getAllQuery(
    'SELECT * FROM home_carousel_images WHERE club_id = ? ORDER BY display_order ASC',
    [clubId]
  );
};

export const addHomeCarouselImage = async (imageData, clubId = 1) => {
  const { image_url, display_order } = imageData;
  
  // Si display_order n'est pas fourni, calculer la prochaine position disponible
  let finalDisplayOrder = display_order;
  if (finalDisplayOrder === undefined || finalDisplayOrder === null) {
    const maxOrderResult = await getQuery('SELECT MAX(display_order) as max_order FROM home_carousel_images WHERE club_id = ?', [clubId]);
    finalDisplayOrder = (maxOrderResult?.max_order || 0) + 1;
  }
  
  return await runQuery(
    'INSERT INTO home_carousel_images (club_id, image_url, display_order, created_at) VALUES (?, ?, ?, NOW())',
    [clubId, image_url, finalDisplayOrder]
  );
};

export const deleteHomeCarouselImage = async (id, clubId = 1) => {
  return await runQuery('DELETE FROM home_carousel_images WHERE id = ? AND club_id = ?', [id, clubId]);
};

export const updateHomeCarouselImageOrder = async (imageId, newOrder, clubId = 1) => {
  return await runQuery(
    'UPDATE home_carousel_images SET display_order = ? WHERE id = ? AND club_id = ?',
    [newOrder, imageId, clubId]
  );
};

export const updateHomeCarouselImageTitle = async (imageId, title, clubId = 1) => {
  return await runQuery(
    'UPDATE home_carousel_images SET title = ? WHERE id = ? AND club_id = ?',
    [title, imageId, clubId]
  );
};

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);