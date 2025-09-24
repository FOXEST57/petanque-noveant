/**
 * Utilitaires pour la manipulation des couleurs
 * Responsable des calculs de couleurs et de leur application
 */

/**
 * Éclaircit une couleur hexadécimale d'un pourcentage donné
 * @param color - Couleur hexadécimale (ex: "#FF0000")
 * @param percent - Pourcentage d'éclaircissement (0-100)
 * @returns Couleur éclaircie en hexadécimal
 */
export const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

/**
 * Assombrit une couleur hexadécimale d'un pourcentage donné
 * @param color - Couleur hexadécimale (ex: "#FF0000")
 * @param percent - Pourcentage d'assombrissement (0-100)
 * @returns Couleur assombrie en hexadécimal
 */
export const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
};

/**
 * Génère les variantes d'une couleur principale (claire et foncée)
 * @param primaryColor - Couleur principale en hexadécimal
 * @returns Objet contenant les variantes de couleur
 */
export const generateColorVariants = (primaryColor: string) => {
  return {
    primary: primaryColor,
    light: lightenColor(primaryColor, 20),
    dark: darkenColor(primaryColor, 15)
  };
};

/**
 * Applique les couleurs du thème aux variables CSS
 * @param primaryColor - Couleur principale en hexadécimal
 */
export const applyThemeColors = (primaryColor: string): void => {
  const root = document.documentElement;
  const colors = generateColorVariants(primaryColor);
  
  // Mettre à jour les variables CSS
  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--primary-light', colors.light);
  root.style.setProperty('--primary-dark', colors.dark);
};