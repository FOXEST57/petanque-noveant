// API client pour les membres
import { apiCall } from '../utils/apiCall.js';

// Fonction utilitaire pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Fonction utilitaire pour créer les headers avec authentification
const getAuthHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Fonction utilitaire pour gérer les réponses API
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.success ? data.data : data;
};

// API des membres
export const membersAPI = {
  // Récupérer tous les membres
  getAll: async () => {
    return await apiCall('/members');
  },

  // Créer un nouveau membre
  create: async (memberData) => {
    const isFormData = memberData instanceof FormData;
    
    return await apiCall('/members', {
      method: 'POST',
      headers: isFormData ? { 'Authorization': `Bearer ${getAuthToken()}` } : getAuthHeaders(),
      body: isFormData ? memberData : JSON.stringify(memberData),
    });
  },

  // Mettre à jour un membre
  update: async (id, memberData) => {
    const isFormData = memberData instanceof FormData;
    
    return await apiCall(`/members/${id}`, {
      method: 'PUT',
      headers: isFormData ? { 'Authorization': `Bearer ${getAuthToken()}` } : getAuthHeaders(),
      body: isFormData ? memberData : JSON.stringify(memberData),
    });
  },

  // Supprimer un membre
  delete: async (id) => {
    return await apiCall(`/members/${id}`, {
      method: 'DELETE',
    });
  },

  // Récupérer le nombre total de membres
  getCount: async () => {
    const data = await apiCall('/members/count');
    return data.count;
  },

  // Récupérer les types de membres
  getTypes: async () => {
    return await apiCall('/members/types');
  },

  // Créer un nouveau type de membre
  createType: async (typeData) => {
    return await apiCall('/members/types', {
      method: 'POST',
      body: JSON.stringify(typeData),
    });
  },

  // Mettre à jour un type de membre
  updateType: async (id, typeData) => {
    return await apiCall(`/members/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeData),
    });
  },

  // Supprimer un type de membre
  deleteType: async (id) => {
    return await apiCall(`/members/types/${id}`, {
      method: 'DELETE',
    });
  }
};

export default membersAPI;