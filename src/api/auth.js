const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";

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
  
  console.log('🔍 Auth API Call URL:', url);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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

// API pour l'authentification
export const authAPI = {
  login: (credentials) => apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiCall('/api/auth/logout', {
    method: 'POST',
  }),
  getCurrentUser: () => apiCall('/api/auth/me'),
  refreshToken: () => apiCall('/api/auth/refresh', {
    method: 'POST',
  }),
};

export default authAPI;