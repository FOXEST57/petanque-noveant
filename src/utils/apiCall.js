// Fonction utilitaire pour faire des appels API
export const apiCall = async (endpoint, options = {}) => {
  // Récupérer le paramètre club depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  let club = urlParams.get('club');
  
  // Si aucun club n'est spécifié, utiliser 'noveant' par défaut pour le développement
  if (!club && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    club = 'noveant';
    console.log('🏛️ Utilisation du club par défaut pour le développement:', club);
  }
  
  // Utiliser l'URL absolue du serveur API
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";
  let url = endpoint.startsWith('/api') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/api${endpoint}`;
  
  // Ajouter le paramètre club si présent et si l'endpoint ne l'a pas déjà
  if (club && !endpoint.includes('club=')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}club=${encodeURIComponent(club)}`;
  }
  
  console.log('🔍 API Call URL:', url);
  
  // Récupérer le token d'authentification
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  // Ajouter le token d'authentification si disponible
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

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

export default apiCall;