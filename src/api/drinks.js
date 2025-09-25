const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Fonction utilitaire pour faire des appels API
const apiCall = async (endpoint, options = {}) => {
  // Récupérer le paramètre club depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  let club = urlParams.get('club');
  
  // Si aucun club n'est spécifié, utiliser 'noveant' par défaut pour le développement
  if (!club && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    club = 'noveant';
    console.log('🏛️ Utilisation du club par défaut pour le développement (drinks):', club);
  }
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Ajouter le paramètre club si présent et si l'endpoint ne l'a pas déjà
  if (club && !endpoint.includes('club=')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}club=${encodeURIComponent(club)}`;
  }
  
  console.log('🔍 Drinks API Call URL:', url);
  
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

// API pour les boissons
export const drinksAPI = {
  getAll: () => apiCall('/api/drinks'),
  getById: (id) => apiCall(`/api/drinks/${id}`),
  create: (drinkData) => apiCall('/api/drinks', {
    method: 'POST',
    body: JSON.stringify(drinkData),
  }),
  update: (id, drinkData) => apiCall(`/api/drinks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(drinkData),
  }),
  delete: (id) => apiCall(`/api/drinks/${id}`, {
    method: 'DELETE',
  }),
};

export default drinksAPI;