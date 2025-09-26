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
    console.log('🏛️ Utilisation du club par défaut pour le développement (banque):', club);
  }
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Ajouter le paramètre club si présent et si l'endpoint ne l'a pas déjà
  if (club && !endpoint.includes('club=')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}club=${encodeURIComponent(club)}`;
  }
  
  console.log('🔍 Banque API Call URL:', url);
  
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

// API pour la gestion des banques
export const banqueAPI = {
  // Récupérer toutes les banques
  getBanques: () => apiCall('/api/banque'),
  
  // Récupérer la banque principale
  getBanquePrincipale: () => apiCall('/api/banque/principale'),
  
  // Récupérer une banque par ID
  getBanqueById: (id) => apiCall(`/api/banque/${id}`),
  
  // Créer une nouvelle banque
  createBanque: (banqueData) => apiCall('/api/banque', {
    method: 'POST',
    body: JSON.stringify(banqueData),
  }),
  
  // Mettre à jour une banque
  updateBanque: (id, banqueData) => apiCall(`/api/banque/${id}`, {
    method: 'PUT',
    body: JSON.stringify(banqueData),
  }),
  
  // Supprimer une banque
  deleteBanque: (id) => apiCall(`/api/banque/${id}`, {
    method: 'DELETE',
  }),
};

export default banqueAPI;