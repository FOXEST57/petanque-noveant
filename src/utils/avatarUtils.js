// Fonctions utilitaires pour la génération d'avatars

/**
 * Génère un avatar avec les initiales et une couleur de fond basée sur le prénom et nom
 * @param {string} prenom - Le prénom de la personne
 * @param {string} nom - Le nom de la personne
 * @returns {Object} Objet contenant les initiales et la couleur de fond
 */
export const generateAvatar = (prenom, nom) => {
    const initials = `${prenom?.charAt(0) || ""}${
        nom?.charAt(0) || ""
    }`.toUpperCase();
    const colors = [
        "#425e9b",
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#f39c12",
        "#9b59b6",
        "#1abc9c",
        "#34495e",
        "#e67e22",
        "#95a5a6",
    ];
    const colorIndex =
        (prenom?.charCodeAt(0) || 0 + nom?.charCodeAt(0) || 0) % colors.length;
    const backgroundColor = colors[colorIndex];

    return {
        initials,
        backgroundColor,
    };
};