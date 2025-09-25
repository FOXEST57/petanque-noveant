/**
 * Fonction utilitaire pour les appels API avec gestion automatique du paramètre club
 */

/**
 * Effectue un appel API en ajoutant automatiquement le paramètre club si nécessaire
 * @param {string} endpoint - L'endpoint de l'API (ex: '/site-settings/public')
 * @param {object} options - Options pour fetch (method, headers, body, etc.)
 * @returns {Promise<Response>} - La réponse de l'API
 */
export const apiCall = async (endpoint, options = {}) => {
    // Récupérer le paramètre club depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    let club = urlParams.get('club');
    
    // Si aucun club n'est spécifié, utiliser 'noveant' par défaut pour le développement
    if (!club && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        club = 'noveant';
        console.log('🏛️ Utilisation du club par défaut pour le développement (api):', club);
    }
    
    // Définir l'URL de base de l'API
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3007";
    
    // Construire l'URL complète avec l'URL de base
    let url = `${API_BASE_URL}/api${endpoint}`;
    
    // Ajouter le paramètre club si présent et si l'endpoint ne l'a pas déjà
    if (club && !endpoint.includes('club=')) {
        const separator = endpoint.includes('?') ? '&' : '?';
        url = `${url}${separator}club=${encodeURIComponent(club)}`;
    }
    
    console.log('🔍 API Call URL:', url);
    
    // Effectuer l'appel API
    const response = await fetch(url, options);
    
    return response;
};

/**
 * Fonction helper pour les appels API qui retournent du JSON
 * @param {string} endpoint - L'endpoint de l'API
 * @param {object} options - Options pour fetch
 * @returns {Promise<object>} - Les données JSON de la réponse
 */
export const apiCallJson = async (endpoint, options = {}) => {
    const response = await apiCall(endpoint, options);
    return response.json();
};