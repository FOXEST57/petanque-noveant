// Service API pour communiquer avec le backend Express
const API_BASE_URL = 'http://localhost:3007/api';

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Fonction utilitaire pour récupérer le club depuis l'URL
const getClubFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clubParam = urlParams.get('club');
  
  if (clubParam) {
    return clubParam;
  }
  
  // Vérifier le sous-domaine
  const hostname = window.location.hostname;
  if (hostname.includes('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0];
    }
  } else if (hostname.includes('.petanque-club.fr')) {
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }
  }
  
  return null;
};

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint, options = {}) => {
  try {
    // Don't set Content-Type for FormData - let the browser set it automatically
    const headers = {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Ajouter automatiquement le token d'authentification si disponible
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ajouter automatiquement le paramètre club si disponible
    let finalEndpoint = endpoint;
    const club = getClubFromUrl();
    if (club && !endpoint.includes('club=')) {
      const separator = endpoint.includes('?') ? '&' : '?';
      finalEndpoint = `${endpoint}${separator}club=${club}`;
    }
    
    console.log('🔄 API Call:', `${API_BASE_URL}${finalEndpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${finalEndpoint}`, {
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    console.log('📥 API Response:', response.status, response.statusText);

    if (!response.ok) {
      // Si erreur 401, le token est probablement expiré
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        // Rediriger vers la page de connexion si nécessaire
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Data:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// API des événements
export const eventsAPI = {
  // Récupérer tous les événements (version publique)
  getAll: async () => {
    const response = await apiCall('/events/public');
    return response.data;
  },

  // Récupérer tous les événements (version authentifiée pour l'administration)
  getAllAuth: async () => {
    const response = await apiCall('/events');
    return response.data;
  },

  // Récupérer le nombre d'événements
  getCount: async () => {
    const response = await apiCall('/events/count');
    return response.data.count;
  },

  // Créer un nouvel événement
  create: async (eventData) => {
    const response = await apiCall('/events', {
      method: 'POST',
      body: JSON.stringify({
        name: eventData.titre,
        description: eventData.description,
        date: eventData.date,
        location: eventData.lieu,
        maxParticipants: eventData.publicCible
      }),
    });
    return response.data;
  },

  // Mettre à jour un événement
  update: async (id, eventData) => {
    const response = await apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: eventData.titre,
        description: eventData.description,
        date: eventData.date,
        heure: eventData.heure,
        lieu: eventData.lieu,
        publicCible: eventData.publicCible,
        photos: JSON.stringify(eventData.photos || [])
      }),
    });
    return response.data;
  },

  // Supprimer un événement
  delete: async (id) => {
    const response = await apiCall(`/events/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// API des membres (pour plus tard)
export const membersAPI = {
  getAll: async () => {
    // TODO: Implémenter quand les routes membres seront créées
    return [];
  },
  getCount: async () => {
    // TODO: Implémenter quand les routes membres seront créées
    return 0;
  },
};

// API des boissons
export const drinksAPI = {
  getAll: async () => {
    const response = await apiCall('/drinks');
    return response.data;
  },
  create: async (drinkData) => {
    const response = await apiCall('/drinks', {
      method: 'POST',
      body: JSON.stringify(drinkData)
    });
    return response.data;
  },
  update: async (id, drinkData) => {
    const response = await apiCall(`/drinks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(drinkData)
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await apiCall(`/drinks/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }
};

// API des équipes
export const teamsAPI = {
  // Récupérer toutes les équipes (version publique)
  getAll: async () => {
    const response = await apiCall('/teams/public');
    return response.data;
  },

  // Récupérer toutes les équipes (version authentifiée pour l'administration)
  getAllAuth: async () => {
    const response = await apiCall('/teams');
    return response.data;
  },

  // Récupérer le nombre d'équipes
  getCount: async () => {
    const teams = await teamsAPI.getAll();
    return teams.length;
  },

  // Récupérer une équipe par ID
  getById: async (id) => {
    const response = await apiCall(`/teams/${id}`);
    return response.data;
  },

  // Créer une nouvelle équipe
  create: async (teamData) => {
    const response = await apiCall('/teams', {
      method: 'POST',
      body: teamData, // FormData should not be stringified
    });
    return response.data;
  },

  // Mettre à jour une équipe
  update: async (id, teamData) => {
    const response = await apiCall(`/teams/${id}`, {
      method: 'PUT',
      body: teamData, // FormData should not be stringified
    });
    return response.data;
  },

  // Supprimer une équipe
  delete: async (id) => {
    const response = await apiCall(`/teams/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Récupérer les membres d'une équipe
  getMembers: async (teamId) => {
    const response = await apiCall(`/teams/${teamId}/members`);
    return response.data;
  },

  // Ajouter un membre à une équipe
  addMember: async (teamId, memberId, role = 'membre') => {
    const response = await apiCall(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberId, role }),
    });
    return response.data;
  },

  // Retirer un membre d'une équipe
  removeMember: async (teamId, memberId) => {
    const response = await apiCall(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Mettre à jour le rôle d'un membre
  updateMemberRole: async (teamId, memberId, role) => {
    const response = await apiCall(`/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return response.data;
  },
};

export { apiCall };