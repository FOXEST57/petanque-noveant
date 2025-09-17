// API client pour les membres
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3002/api';

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
    const response = await fetch(`${API_BASE_URL}/members`);
    return handleResponse(response);
  },

  // Créer un nouveau membre
  create: async (memberData) => {
    const isFormData = memberData instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: isFormData ? {} : {
        'Content-Type': 'application/json',
      },
      body: isFormData ? memberData : JSON.stringify(memberData),
    });
    return handleResponse(response);
  },

  // Mettre à jour un membre
  update: async (id, memberData) => {
    const isFormData = memberData instanceof FormData;
    
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: isFormData ? {} : {
        'Content-Type': 'application/json',
      },
      body: isFormData ? memberData : JSON.stringify(memberData),
    });
    return handleResponse(response);
  },

  // Supprimer un membre
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Récupérer le nombre total de membres
  getCount: async () => {
    const response = await fetch(`${API_BASE_URL}/members/count`);
    const data = await handleResponse(response);
    return data.count;
  },

  // Récupérer les types de membres
  getTypes: async () => {
    const response = await fetch(`${API_BASE_URL}/members/types`);
    return handleResponse(response);
  },

  // Créer un nouveau type de membre
  createType: async (typeData) => {
    const response = await fetch(`${API_BASE_URL}/members/types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeData),
    });
    return handleResponse(response);
  },

  // Mettre à jour un type de membre
  updateType: async (id, typeData) => {
    const response = await fetch(`${API_BASE_URL}/members/types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(typeData),
    });
    return handleResponse(response);
  },

  // Supprimer un type de membre
  deleteType: async (id) => {
    const response = await fetch(`${API_BASE_URL}/members/types/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};

export default membersAPI;