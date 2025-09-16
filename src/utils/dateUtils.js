// Fonctions utilitaires pour la gestion des dates

/**
 * Formate une date ISO en format français (jj/mm/aaaa)
 * @param {string} isoDate - Date au format ISO (aaaa-mm-jj)
 * @returns {string} Date au format français ou chaîne vide si invalide
 */
export const formatDateToFrench = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Formate une date française en format ISO (aaaa-mm-jj)
 * @param {string} frenchDate - Date au format français (jj/mm/aaaa)
 * @returns {string} Date au format ISO ou chaîne vide si invalide
 */
export const formatDateToISO = (frenchDate) => {
    if (!frenchDate) return "";
    const parts = frenchDate.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Valide une date au format français (jj/mm/aaaa)
 * @param {string} dateString - Date à valider
 * @returns {Object} Objet avec isValid (boolean) et error (string)
 */
export const validateFrenchDate = (dateString) => {
    if (!dateString) return { isValid: false, error: "" };

    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
        return {
            isValid: false,
            error: "Format invalide. Utilisez jj/mm/aaaa",
        };
    }

    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
        return { isValid: false, error: "Mois invalide (1-12)" };
    }

    if (dayNum < 1 || dayNum > 31) {
        return { isValid: false, error: "Jour invalide (1-31)" };
    }

    // Vérification plus précise des jours selon le mois
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum > daysInMonth) {
        return {
            isValid: false,
            error: `Ce mois n'a que ${daysInMonth} jours`,
        };
    }

    // Vérification que la date n'est pas dans le futur (pour les dates de naissance)
    const inputDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();

    if (isNaN(inputDate.getTime())) {
        return { isValid: false, error: "Date invalide" };
    }

    return { isValid: true, error: "" };
};