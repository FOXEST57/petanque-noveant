import { useState, useEffect } from 'react';

interface ClubDetectionResult {
  isMainDomain: boolean;
  clubSubdomain: string | null;
}

/**
 * Hook personnalisé pour détecter le sous-domaine du club
 * Gère la détection en mode développement (localhost) et production
 * Supporte aussi la détection via paramètre URL ?club=nom
 */
export const useClubDetection = (): ClubDetectionResult => {
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [clubSubdomain, setClubSubdomain] = useState<string | null>(null);
  const [urlKey, setUrlKey] = useState(0); // Pour forcer la re-détection

  useEffect(() => {
    const detectClub = () => {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
      
      // Vérifier si on a un paramètre club dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const clubParam = urlParams.get('club');
      
      console.log('🔍 Détection du club - hostname:', hostname, 'clubParam:', clubParam);
      
      let detectedClub: string | null = null;
      let isMain = false;
      
      if (clubParam) {
        // Si on a un paramètre club, on simule un sous-domaine
        detectedClub = clubParam;
        isMain = false;
        console.log('🏠 Mode développement - Club détecté via paramètre:', clubParam);
      } else if (isLocalhost) {
        // Development mode: check for subdomain in localhost
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'www' && parts[1] === 'localhost') {
          // We have a subdomain like "toulouse.localhost"
          detectedClub = parts[0];
          isMain = false;
          console.log('🏠 Mode développement - Sous-domaine détecté:', parts[0]);
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // We're on the main localhost domain
          isMain = true;
          console.log('🏠 Mode développement - Domaine principal');
        }
      } else {
        // Production mode: check for subdomain in petanque-club.fr
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www') {
          detectedClub = parts[0];
          isMain = false;
          console.log('🌐 Mode production - Sous-domaine détecté:', parts[0]);
        } else {
          isMain = true;
          console.log('🌐 Mode production - Domaine principal');
        }
      }

      // Mettre à jour les états
      setClubSubdomain(detectedClub);
      setIsMainDomain(isMain);
    };

    detectClub();
  }, [urlKey]);

  // Écouter les changements d'URL pour re-détecter le club
  useEffect(() => {
    const handlePopState = () => {
      setUrlKey(prev => prev + 1); // Forcer la re-détection
    };

    window.addEventListener('popstate', handlePopState);
    
    // Écouter aussi les changements de hash et de search
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setUrlKey(prev => prev + 1);
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setUrlKey(prev => prev + 1);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return {
    isMainDomain,
    clubSubdomain
  };
};