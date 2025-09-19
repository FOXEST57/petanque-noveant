import { createContext, useContext, useEffect, useState } from "react";

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext);
    if (!context) {
        throw new Error(
            "useSiteSettings must be used within a SiteSettingsProvider"
        );
    }
    return context;
};

export const SiteSettingsProvider = ({ children }) => {
    const [siteSettings, setSiteSettings] = useState({
        siteName: "Club Pétanque",
        siteSubtitle: "Noveant-sur-Moselle",
        clubName: "Kreacode",
        primaryColor: "#425e9b",
        ffpjpId: "",
        address: "",
        phone: "",
        phoneVisible: true,
        email: "",
        facebookUrl: "",
        instagramUrl: "",
        logoUrl: "",
        faviconUrl: "",
        clubDescription: "",
    });

    const [loading, setLoading] = useState(true);

    // Charger les paramètres du site au démarrage
    useEffect(() => {
        loadSiteSettings();
    }, []);

    const loadSiteSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/site-settings");
            const result = await response.json();

            if (result.success) {
                const mappedSettings = {
                    siteName: result.data.site_name || "Club Pétanque",
                    siteSubtitle:
                        result.data.site_subtitle || "Noveant-sur-Moselle",
                    clubName: result.data.club_name || "Kreacode",
                    primaryColor: result.data.primary_color || "#425e9b",
                    ffpjpId: result.data.ffpjp_id || "",
                    address: result.data.club_address || "",
                    phone: result.data.club_phone || "",
                    phoneVisible:
                        result.data.phone_visible !== undefined
                            ? result.data.phone_visible
                            : true,
                    email: result.data.club_email || '',
                    facebookUrl: result.data.facebook_url || '',
                    instagramUrl: result.data.instagram_url || '',
                    whatsappUrl: result.data.whatsapp_url || '',
                    tiktokUrl: result.data.tiktok_url || '',
                    logoUrl: result.data.logo_url || '',
                    faviconUrl: result.data.favicon_url || '',
                    clubDescription: result.data.club_description || '',
                };
                setSiteSettings(mappedSettings);

                // Appliquer la couleur principale
                updateCSSVariables(mappedSettings.primaryColor);
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement des paramètres du site:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const updateSiteSettings = (newSettings) => {
        setSiteSettings((prev) => ({ ...prev, ...newSettings }));

        // Si la couleur principale a changé, mettre à jour les variables CSS
        if (newSettings.primaryColor) {
            updateCSSVariables(newSettings.primaryColor);
        }
    };

    const updateCSSVariables = (primaryColor) => {
        const root = document.documentElement;

        // Calculer les variantes de couleur
        const lightColor = lightenColor(primaryColor, 20);
        const darkColor = darkenColor(primaryColor, 15);

        // Mettre à jour les variables CSS
        root.style.setProperty("--primary-color", primaryColor);
        root.style.setProperty("--primary-light", lightColor);
        root.style.setProperty("--primary-dark", darkColor);
    };

    // Fonction pour éclaircir une couleur
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = ((num >> 8) & 0x00ff) + amt;
        const B = (num & 0x0000ff) + amt;
        return (
            "#" +
            (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            )
                .toString(16)
                .slice(1)
        );
    };

    // Fonction pour assombrir une couleur
    const darkenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = ((num >> 8) & 0x00ff) - amt;
        const B = (num & 0x0000ff) - amt;
        return (
            "#" +
            (
                0x1000000 +
                (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
                (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
                (B > 255 ? 255 : B < 0 ? 0 : B)
            )
                .toString(16)
                .slice(1)
        );
    };

    const value = {
        siteSettings,
        loading,
        updateSiteSettings,
        loadSiteSettings,
    };

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
};