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
  
  console.log('🔍 Events API Call URL:', url);
  
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

// API pour les événements
export const eventsAPI = {
  getAll: async () => {
    console.log('🔍 eventsAPI.getAll - Appel API /events/public');
    const result = await apiCall('/api/events/public');
    console.log('🔍 eventsAPI.getAll - Résultat:', result);
    return result;
  },
  getAllAuth: async () => {
    console.log('🔍 eventsAPI.getAllAuth - Appel API /events');
    const result = await apiCall('/api/events');
    console.log('🔍 eventsAPI.getAllAuth - Résultat:', result);
    return result;
  },
  getById: (id) => apiCall(`/api/events/${id}`),
  getCount: () => apiCall('/api/events/count'),
  getPhotos: (id) => apiCall(`/api/events/${id}/photos`),
  create: (eventData) => apiCall('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  update: (id, eventData) => apiCall(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),
  delete: (id) => apiCall(`/api/events/${id}`, {
    method: 'DELETE',
  }),
};

export default eventsAPI;