// Mock de la base de données pour le frontend
// Simule les fonctions de database.js avec des données en localStorage

// Clés pour localStorage
const STORAGE_KEYS = {
  members: 'petanque_members',
  memberTypes: 'petanque_member_types',
  events: 'petanque_events'
};

// Données par défaut
const DEFAULT_MEMBER_TYPES = [
  { id: 1, nom: 'Membre actif', description: 'Membre participant régulièrement', droits: ['participer_concours', 'voter'] },
  { id: 2, nom: 'Membre honoraire', description: 'Ancien membre avec statut honorifique', droits: ['participer_concours'] },
  { id: 3, nom: 'Membre bureau', description: 'Membre du bureau directeur', droits: ['participer_concours', 'voter', 'administrer'] }
];

// Utilitaires localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Erreur lecture localStorage:', error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur sauvegarde localStorage:', error);
  }
};

// Initialisation des données par défaut
const initDefaultData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.memberTypes)) {
    saveToStorage(STORAGE_KEYS.memberTypes, DEFAULT_MEMBER_TYPES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.members)) {
    saveToStorage(STORAGE_KEYS.members, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.events)) {
    saveToStorage(STORAGE_KEYS.events, []);
  }
};

// Initialiser au chargement
initDefaultData();

// Générateur d'ID unique
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// === FONCTIONS CRUD POUR LES MEMBRES ===
export const getMembers = async () => {
  const members = getFromStorage(STORAGE_KEYS.members);
  const memberTypes = getFromStorage(STORAGE_KEYS.memberTypes);
  
  // Ajouter le nom du type à chaque membre
  return members.map(member => {
    const type = memberTypes.find(t => t.id === member.type_membre_id);
    return {
      ...member,
      type_nom: type ? type.nom : 'Non défini'
    };
  });
};

export const getMemberById = async (id) => {
  const members = getFromStorage(STORAGE_KEYS.members);
  return members.find(m => m.id === id) || null;
};

export const createMember = async (memberData) => {
  const members = getFromStorage(STORAGE_KEYS.members);
  const newMember = {
    ...memberData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  members.push(newMember);
  saveToStorage(STORAGE_KEYS.members, members);
  
  return { id: newMember.id, changes: 1 };
};

export const updateMember = async (id, memberData) => {
  const members = getFromStorage(STORAGE_KEYS.members);
  const index = members.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Membre non trouvé');
  }
  
  members[index] = {
    ...members[index],
    ...memberData,
    updated_at: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.members, members);
  return { id, changes: 1 };
};

export const deleteMember = async (id) => {
  const members = getFromStorage(STORAGE_KEYS.members);
  const filteredMembers = members.filter(m => m.id !== id);
  
  if (filteredMembers.length === members.length) {
    throw new Error('Membre non trouvé');
  }
  
  saveToStorage(STORAGE_KEYS.members, filteredMembers);
  return { changes: 1 };
};

// === FONCTIONS CRUD POUR LES TYPES DE MEMBRES ===
export const getMemberTypes = async () => {
  return getFromStorage(STORAGE_KEYS.memberTypes, DEFAULT_MEMBER_TYPES);
};

export const createMemberType = async (typeData) => {
  const memberTypes = getFromStorage(STORAGE_KEYS.memberTypes);
  const newType = {
    ...typeData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  memberTypes.push(newType);
  saveToStorage(STORAGE_KEYS.memberTypes, memberTypes);
  
  return { id: newType.id, changes: 1 };
};

export const updateMemberType = async (id, typeData) => {
  const memberTypes = getFromStorage(STORAGE_KEYS.memberTypes);
  const index = memberTypes.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error('Type de membre non trouvé');
  }
  
  memberTypes[index] = {
    ...memberTypes[index],
    ...typeData,
    updated_at: new Date().toISOString()
  };
  
  saveToStorage(STORAGE_KEYS.memberTypes, memberTypes);
  return { id, changes: 1 };
};

export const deleteMemberType = async (id) => {
  const memberTypes = getFromStorage(STORAGE_KEYS.memberTypes);
  const filteredTypes = memberTypes.filter(t => t.id !== id);
  
  if (filteredTypes.length === memberTypes.length) {
    throw new Error('Type de membre non trouvé');
  }
  
  saveToStorage(STORAGE_KEYS.memberTypes, filteredTypes);
  return true;
};