import { useEffect } from 'react';
import { SiteSettingsService, type SiteSettings } from '../services/siteSettingsService';
import { applyThemeColors } from '../utils/colorUtils';
import { updatePageMetadata } from '../utils/domUtils';

/**
 * Hook personnalisé pour gérer les paramètres du site
 * Charge les paramètres et applique les modifications visuelles (couleurs, favicon, titre)
 */
export const useSiteSettings = (clubSubdomain: string | null, isMainDomain: boolean) => {
  useEffect(() => {
    const loadAndApplySettings = async () => {
      // Ne charger les paramètres que si on a un club détecté (pas sur le domaine principal)
      if (isMainDomain || !clubSubdomain) {
        return;
      }

      console.log('🔧 Chargement des paramètres pour le club:', clubSubdomain);
      
      try {
        const result = await SiteSettingsService.fetchPublicSettings();
        
        if (result?.success && result.data) {
          const settings: SiteSettings = result.data;
          
          // Appliquer la couleur principale si elle existe
          if (settings.primary_color) {
            applyThemeColors(settings.primary_color);
          }

          // Mettre à jour les métadonnées de la page
          updatePageMetadata({
            title: settings.club_name,
            faviconUrl: settings.favicon_url
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
      }
    };

    loadAndApplySettings();
  }, [clubSubdomain, isMainDomain]);
};