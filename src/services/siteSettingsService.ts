import { apiCall } from '../utils/apiCall.js';

export interface SiteSettings {
  primary_color?: string;
  favicon_url?: string;
  club_name?: string;
  [key: string]: any; // Pour d'autres propriétés potentielles
}

export interface SiteSettingsResponse {
  success: boolean;
  data?: SiteSettings;
  error?: string;
}

/**
 * Service pour la gestion des paramètres du site
 * Responsable uniquement de la récupération des données depuis l'API
 */
export class SiteSettingsService {
  /**
   * Récupère les paramètres publics du site depuis l'API
   * @returns Promise avec les paramètres du site ou null en cas d'erreur
   */
  static async fetchPublicSettings(): Promise<SiteSettingsResponse | null> {
    try {
      const result = await apiCall('/site-settings/public');
      
      if (result.success && result.data) {
        console.log('✅ Paramètres du site chargés:', result);
        return result;
      }
      
      console.warn('⚠️ Aucune donnée reçue pour les paramètres du site');
      return null;
    } catch (error) {
      console.warn('⚠️ Impossible de charger les paramètres du site:', error);
      // Ne pas faire planter l'application si les paramètres ne peuvent pas être chargés
      // L'application peut fonctionner sans ces paramètres
      return null;
    }
  }
}