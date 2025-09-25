import { useState, useEffect } from 'react';
import { apiCall } from '../utils/apiCall.js';
import { useAuth } from './useAuth';

interface HomeContent {
  title?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Hook personnalisé pour gérer le contenu de la page d'accueil
 * Responsable de la récupération et de la gestion de l'état du contenu
 */
export const useHomeContent = () => {
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser l'endpoint public si l'utilisateur n'est pas connecté
        const endpoint = user ? '/home-content' : '/home-content/public';
        const homeData = await apiCall(endpoint);
        
        // Extract data from API response structure
        if (homeData && homeData.success && homeData.data) {
          setHomeContent(homeData.data);
        } else if (homeData) {
          setHomeContent(homeData);
        } else {
          setHomeContent(null);
        }
      } catch (error) {
        console.warn('⚠️ Impossible de charger le contenu de la page d\'accueil:', error);
        setError('Erreur lors du chargement du contenu');
        setHomeContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, [user]);

  return {
    homeContent,
    loading,
    error
  };
};