/**
 * Utilitaires pour la manipulation du DOM
 * Responsable des modifications du DOM (favicon, titre, etc.)
 */

/**
 * Met à jour le favicon de la page
 * @param faviconUrl - URL du nouveau favicon
 */
export const updateFavicon = (faviconUrl: string): void => {
  let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  
  faviconLink.href = `/${faviconUrl}`;
};

/**
 * Met à jour le titre de la page
 * @param title - Nouveau titre de la page
 */
export const updatePageTitle = (title: string): void => {
  document.title = title;
};

/**
 * Met à jour les métadonnées de base de la page
 * @param options - Options pour les métadonnées
 */
export const updatePageMetadata = (options: {
  title?: string;
  faviconUrl?: string;
}): void => {
  if (options.title) {
    updatePageTitle(options.title);
  }
  
  if (options.faviconUrl) {
    updateFavicon(options.faviconUrl);
  }
};