// Configuration des environnements
const config = {
  development: {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3007'
  },
  production: {
    // En production, utilise la variable d'environnement ou une URL par défaut
    API_URL: import.meta.env.VITE_API_URL || 'https://votre-domaine-production.com'
  }
}

// Détecte automatiquement l'environnement
const environment = import.meta.env.MODE || 'development'

export const ENV_CONFIG = config[environment]
export default ENV_CONFIG