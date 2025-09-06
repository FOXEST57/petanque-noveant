import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configuration de la base de données
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../../database/petanque.db');
const INIT_SQL_PATH = join(__dirname, '../../database/init.sql');

// Instance de la base de données
let db = null;

// Initialisation de la base de données
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err);
        reject(err);
        return;
      }
      
      console.log('Connexion à la base de données SQLite établie.');
      
      // Lire et exécuter le script d'initialisation
      const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
      
      db.exec(initSQL, (err) => {
        if (err) {
          console.error('Erreur lors de l\'initialisation de la base de données:', err);
          reject(err);
          return;
        }
        
        console.log('Base de données initialisée avec succès.');
        resolve(db);
      });
    });
  });
};

// Fermeture de la base de données
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Connexion à la base de données fermée.');
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Fonction utilitaire pour exécuter une requête
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de données non initialisée'));
      return;
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Fonction utilitaire pour récupérer plusieurs lignes
const getAllQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de données non initialisée'));
      return;
    }
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

// Fonction utilitaire pour récupérer une seule ligne
const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Base de données non initialisée'));
      return;
    }
    
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

// === FONCTIONS CRUD POUR LES MEMBRES ===
export const getMembers = () => {
  return getAllQuery(`
    SELECT m.*, mt.nom as type_nom 
    FROM members m 
    LEFT JOIN member_types mt ON m.type_membre_id = mt.id 
    ORDER BY m.nom, m.prenom
  `);
};

export const getMemberById = (id) => {
  return getQuery('SELECT * FROM members WHERE id = ?', [id]);
};

export const createMember = (memberData) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return runQuery(
    'INSERT INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url]
  );
};

export const updateMember = (id, memberData) => {
  const { nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url } = memberData;
  return runQuery(
    'UPDATE members SET nom = ?, prenom = ?, adresse = ?, telephone = ?, email = ?, numero_licence = ?, date_entree = ?, date_naissance = ?, type_membre_id = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id, photo_url, id]
  );
};

export const deleteMember = (id) => {
  return runQuery('DELETE FROM members WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES TYPES DE MEMBRES ===
export const getMemberTypes = () => {
  return getAllQuery('SELECT * FROM member_types ORDER BY nom');
};

export const createMemberType = (typeData) => {
  const { nom, description, droits } = typeData;
  return runQuery(
    'INSERT INTO member_types (nom, description, droits, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [nom, description, JSON.stringify(droits)]
  );
};

export const updateMemberType = (id, typeData) => {
  const { nom, description, droits } = typeData;
  return runQuery(
    'UPDATE member_types SET nom = ?, description = ?, droits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nom, description, JSON.stringify(droits), id]
  );
};

export const deleteMemberType = (id) => {
  return runQuery('DELETE FROM member_types WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES ÉVÉNEMENTS ===
export const getEvents = () => {
  return getAllQuery('SELECT * FROM events ORDER BY date DESC');
};

export const createEvent = (eventData) => {
  const { title, description, date, photos } = eventData;
  return runQuery(
    'INSERT INTO events (title, description, date, photos, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [title, description, date, JSON.stringify(photos || [])]
  );
};

export const updateEvent = (id, eventData) => {
  const { title, description, date, photos } = eventData;
  return runQuery(
    'UPDATE events SET title = ?, description = ?, date = ?, photos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description, date, JSON.stringify(photos || []), id]
  );
};

export const deleteEvent = (id) => {
  return runQuery('DELETE FROM events WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES PHOTOS D'ÉVÉNEMENTS ===
export const getEventPhotos = (eventId) => {
  return getAllQuery('SELECT * FROM event_photos WHERE event_id = ? ORDER BY upload_date DESC', [eventId]);
};

export const createEventPhoto = (photoData) => {
  const { event_id, filename, original_name, file_path, file_size, mime_type } = photoData;
  return runQuery(
    'INSERT INTO event_photos (event_id, filename, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
    [event_id, filename, original_name, file_path, file_size, mime_type]
  );
};

export const deleteEventPhoto = (id) => {
  return runQuery('DELETE FROM event_photos WHERE id = ?', [id]);
};

export const getEventPhotoById = (id) => {
  return getQuery('SELECT * FROM event_photos WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES CONCOURS ===
export const getConcours = () => {
  return getAllQuery('SELECT * FROM concours ORDER BY date DESC');
};

export const createConcours = (concoursData) => {
  const { nom, date, description, prix_inscription, prix_a_gagner, statut } = concoursData;
  return runQuery(
    'INSERT INTO concours (nom, date, description, prix_inscription, prix_a_gagner, statut, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [nom, date, description, prix_inscription, prix_a_gagner, statut || 'planifie']
  );
};

export const updateConcours = (id, concoursData) => {
  const { nom, date, description, prix_inscription, prix_a_gagner, statut } = concoursData;
  return runQuery(
    'UPDATE concours SET nom = ?, date = ?, description = ?, prix_inscription = ?, prix_a_gagner = ?, statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nom, date, description, prix_inscription, prix_a_gagner, statut, id]
  );
};

export const deleteConcours = (id) => {
  return runQuery('DELETE FROM concours WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES LOTOS ===
export const getLotos = () => {
  return getAllQuery('SELECT * FROM lotos ORDER BY date DESC');
};

export const createLoto = (lotoData) => {
  const { nom, date, description, prix_carton, lots_a_gagner, statut } = lotoData;
  return runQuery(
    'INSERT INTO lotos (nom, date, description, prix_carton, lots_a_gagner, statut, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [nom, date, description, prix_carton, lots_a_gagner, statut || 'planifie']
  );
};

export const updateLoto = (id, lotoData) => {
  const { nom, date, description, prix_carton, lots_a_gagner, statut } = lotoData;
  return runQuery(
    'UPDATE lotos SET nom = ?, date = ?, description = ?, prix_carton = ?, lots_a_gagner = ?, statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [nom, date, description, prix_carton, lots_a_gagner, statut, id]
  );
};

export const deleteLoto = (id) => {
  return runQuery('DELETE FROM lotos WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES BOISSONS ===
export const getDrinks = () => {
  return getAllQuery('SELECT * FROM drinks ORDER BY name');
};

export const createDrink = (drinkData) => {
  const { name, price, description, image_url, stock } = drinkData;
  return runQuery(
    'INSERT INTO drinks (name, price, description, image_url, stock, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [name, price, description, image_url, stock || 0]
  );
};

export const updateDrink = (id, drinkData) => {
  const { name, price, description, image_url, stock } = drinkData;
  return runQuery(
    'UPDATE drinks SET name = ?, price = ?, description = ?, image_url = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, price, description, image_url, stock, id]
  );
};

export const deleteDrink = (id) => {
  return runQuery('DELETE FROM drinks WHERE id = ?', [id]);
};

// === FONCTIONS CRUD POUR LES ÉQUIPES ===
export const getTeams = () => {
  return getAllQuery('SELECT * FROM teams ORDER BY name');
};

export const createTeam = (teamData) => {
  const { name, description } = teamData;
  return runQuery(
    'INSERT INTO teams (name, description, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [name, description]
  );
};

export const updateTeam = (id, teamData) => {
  const { name, description } = teamData;
  return runQuery(
    'UPDATE teams SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, id]
  );
};

export const deleteTeam = (id) => {
  return runQuery('DELETE FROM teams WHERE id = ?', [id]);
};

// Initialiser la base de données au démarrage
initDatabase().catch(console.error);

export default {
  initDatabase,
  closeDatabase,
  // Membres
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  // Types de membres
  getMemberTypes,
  createMemberType,
  updateMemberType,
  deleteMemberType,
  // Événements
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  // Concours
  getConcours,
  createConcours,
  updateConcours,
  deleteConcours,
  // Lotos
  getLotos,
  createLoto,
  updateLoto,
  deleteLoto,
  // Boissons
  getDrinks,
  createDrink,
  updateDrink,
  deleteDrink,
  // Équipes
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  // Photos d'événements
  getEventPhotos,
  createEventPhoto,
  deleteEventPhoto,
  getEventPhotoById
};