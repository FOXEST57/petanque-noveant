// Service API pour communiquer avec le backend Express
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

// Fonction utilitaire pour les appels API
const apiCall = async (endpoint, options = {}) => {
  try {
    // Don't set Content-Type for FormData - let the browser set it automatically
    const headers = {};
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API des événements
export const eventsAPI = {
  // Récupérer tous les événements
  getAll: async () => {
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
    console.log('=== DEBUG API UPDATE ===');
    console.log('URL:', `${API_BASE_URL}/drinks/${id}`);
    console.log('Data to send:', drinkData);
    console.log('JSON stringified:', JSON.stringify(drinkData));
    
    const response = await fetch(`${API_BASE_URL}/drinks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(drinkData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Erreur lors de la mise à jour de la boisson');
    }
    
    const result = await response.json();
    console.log('Response result:', result);
    return result;
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
  // Récupérer toutes les équipes
  getAll: async () => {
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

// API générale pour les statistiques
export const statsAPI = {
  getAll: async () => {
    try {
      const [eventsCount, teamsCount] = await Promise.all([
        eventsAPI.getCount(),
        teamsAPI.getCount(),
        // membersAPI.getCount(),
      ]);

      return {
        events: eventsCount,
        users: 0, // TODO: Implémenter
        teams: teamsCount,
        albums: 0, // TODO: Implémenter
        drinks: 0, // TODO: Implémenter
        results: 0, // TODO: Implémenter
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        events: 0,
        users: 0,
        teams: 0,
        albums: 0,
        drinks: 0,
        results: 0,
      };
    }
  },
};

export default {
  events: eventsAPI,
  members: membersAPI,
  teams: teamsAPI,
  stats: statsAPI,
};