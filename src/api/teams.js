const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Fonction utilitaire pour faire des appels API
const apiCall = async (endpoint, options = {}) => {
  // Récupérer le paramètre club depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const club = urlParams.get('club');
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Ajouter le paramètre club si présent et si l'endpoint ne l'a pas déjà
  if (club && !endpoint.includes('club=')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}club=${encodeURIComponent(club)}`;
  }
  
  console.log('🔍 Teams API Call URL:', url);
  
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const defaultOptions = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API pour les équipes
export const teamsAPI = {
  getAll: () => apiCall('/api/teams'),
  getAllPublic: () => apiCall('/api/teams/public'),
  getById: (id) => apiCall(`/api/teams/${id}`),
  getCount: () => apiCall('/api/teams/count'),
  create: (teamData) => apiCall('/api/teams', {
    method: 'POST',
    body: JSON.stringify(teamData),
  }),
  update: (id, teamData) => apiCall(`/api/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teamData),
  }),
  delete: (id) => apiCall(`/api/teams/${id}`, {
    method: 'DELETE',
  }),
};

export default teamsAPI;