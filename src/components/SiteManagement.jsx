import { Info, Palette, Save, X, Upload, Image } from "lucide-react";
import { useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { toast } from "sonner";
import { useSiteSettings } from "../contexts/SiteSettingsContext.jsx";

const SiteManagement = ({ isOpen, onClose }) => {
    const { siteSettings: globalSiteSettings, updateSiteSettings, loadSiteSettings } =
        useSiteSettings();
    const [siteSettings, setSiteSettings] = useState({
        primaryColor: "#425e9b",
        siteName: "Club de Pétanque",
        siteSubtitle: "Bienvenue dans notre club",
        clubName: "Club de Pétanque de Noveant",
        ffpjpId: "",
        address:
            "Veloroute Charles le téméraire\n57680 Novéant-sur-Moselle, France",
        phone: "06 45 20 66 XX",
        phoneVisible: true,
        email: "contact@petanque-noveant.fr",
        facebookUrl:
            "https://www.facebook.com/profile.php?id=61554702581873&locale=fr_FR",
        instagramUrl: "",
        whatsappUrl: "",
        tiktokUrl: "",
        logoUrl: "",
        faviconUrl: "",
        clubDescription: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    // Couleurs prédéfinies
    const predefinedColors = [
        "#425e9b", // Bleu original
        "#2563eb", // Bleu moderne
        "#dc2626", // Rouge
        "#059669", // Vert
        "#7c3aed", // Violet
        "#ea580c", // Orange
        "#0891b2", // Cyan
        "#4338ca", // Indigo
    ];

    // Charger les paramètres du site au montage du composant
    useEffect(() => {
        if (isOpen) {
            // Utiliser les paramètres globaux comme base
            setSiteSettings({
                primaryColor: globalSiteSettings.primaryColor || "#425e9b",
                siteName: globalSiteSettings.siteName || "Club de Pétanque",
                siteSubtitle:
                    globalSiteSettings.siteSubtitle ||
                    "Bienvenue dans notre club",
                clubName:
                    globalSiteSettings.clubName ||
                    "Club de Pétanque de Noveant",
                ffpjpId: globalSiteSettings.ffpjpId || "",
                address: globalSiteSettings.address || "",
                phone: globalSiteSettings.phone || "",
                phoneVisible:
                    globalSiteSettings.phoneVisible !== undefined
                        ? globalSiteSettings.phoneVisible
                        : true,
                email: globalSiteSettings.email || "",
                facebookUrl: globalSiteSettings.facebookUrl || "",
                instagramUrl: globalSiteSettings.instagramUrl || "",
                whatsappUrl: globalSiteSettings.whatsappUrl || "",
                tiktokUrl: globalSiteSettings.tiktokUrl || "",
                logoUrl: globalSiteSettings.logoUrl || "",
                faviconUrl: globalSiteSettings.faviconUrl || "",
                clubDescription: globalSiteSettings.clubDescription || "",
            });
            setLoadingSettings(false);
        }
    }, [isOpen, globalSiteSettings]);

    const handleColorChange = (color) => {
        setSiteSettings((prev) => ({ ...prev, primaryColor: color }));

        // Appliquer immédiatement la couleur pour prévisualisation
        updateCSSVariables(color);
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

    // Fonction pour gérer la sélection du logo
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                toast.error('Veuillez sélectionner un fichier image');
                return;
            }
            
            // Vérifier la taille du fichier (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Le fichier est trop volumineux (5MB maximum)');
                return;
            }
            
            setLogoFile(file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Fonction pour gérer la sélection du favicon
    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                toast.error('Veuillez sélectionner un fichier image');
                return;
            }
            
            // Vérifier la taille du fichier (2MB max pour favicon)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Le fichier est trop volumineux (2MB maximum pour le favicon)');
                return;
            }
            
            setFaviconFile(file);
            
            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setFaviconPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Créer un FormData pour gérer le fichier et les données
            const formData = new FormData();
            
            // Mapper les clés du composant vers les clés de la base de données
            const settingsToSave = {
                primary_color: siteSettings.primaryColor,
                site_name: siteSettings.siteName,
                site_subtitle: siteSettings.siteSubtitle,
                club_name: siteSettings.clubName,
                ffpjp_id: siteSettings.ffpjpId,
                club_address: siteSettings.address,
                club_phone: siteSettings.phone,
                phone_visible: siteSettings.phoneVisible,
                club_email: siteSettings.email,
                facebook_url: siteSettings.facebookUrl,
                instagram_url: siteSettings.instagramUrl,
                whatsapp_url: siteSettings.whatsappUrl,
                tiktok_url: siteSettings.tiktokUrl,
                logo_url: siteSettings.logoUrl,
                favicon_url: siteSettings.faviconUrl,
                club_description: siteSettings.clubDescription,
            };

            // Ajouter les paramètres au FormData
            Object.entries(settingsToSave).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Ajouter le fichier logo s'il y en a un
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            // Ajouter le fichier favicon s'il y en a un
            if (faviconFile) {
                formData.append('favicon', faviconFile);
            }

            // Récupérer le token d'authentification
            const token = localStorage.getItem('auth_token');
            const headers = {};
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch("/api/site-settings", {
                method: "PUT",
                headers,
                body: formData, // Utiliser FormData au lieu de JSON
            });

            const result = await response.json();

            if (result.success) {
                // Mettre à jour le contexte global avec les nouvelles valeurs
                updateSiteSettings(siteSettings);

                // Recharger les paramètres depuis la base de données pour s'assurer de la cohérence
                await loadSiteSettings();
                
                toast.success('Paramètres du site sauvegardés avec succès !');
                onClose();
            } else {
                throw new Error(
                    result.message || "Erreur lors de la sauvegarde"
                );
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde des paramètres");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Palette className="w-6 h-6 mr-2 text-var(--primary-color)" />
                        Gestion du Site
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {loadingSettings ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <span className="ml-3 text-gray-600">
                                Chargement des paramètres...
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* Section Logo et Favicon côte à côte */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Section Logo */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Image className="w-5 h-5 mr-2" />
                                        Logo du Site
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Aperçu du logo actuel */}
                                        {(logoPreview || siteSettings.logoUrl) && (
                                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-sm font-medium text-gray-700">
                                                    Logo actuel :
                                                </div>
                                                <img
                                                    src={logoPreview || (siteSettings.logoUrl ? `/${siteSettings.logoUrl}` : '')}
                                                    alt="Logo du site"
                                                    className="h-12 w-12 object-cover border border-gray-200 rounded-full"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Upload du logo */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Télécharger un nouveau logo :
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                                    <Upload className="w-4 h-4" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {logoFile && (
                                                    <span className="text-sm text-gray-600">
                                                        {logoFile.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Formats acceptés : JPG, PNG, SVG. Taille maximale : 5MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Favicon */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                        <Image className="w-5 h-5" />
                                        <span>Favicon du site</span>
                                    </h3>
                                    
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Qu'est-ce qu'un favicon ?</p>
                                                <p>Le favicon est la petite icône qui apparaît dans l'onglet de votre navigateur, à côté du titre de votre site. Il aide les utilisateurs à identifier rapidement votre site parmi leurs onglets ouverts.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Aperçu du favicon actuel */}
                                        {(faviconPreview || siteSettings.faviconUrl) && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Favicon actuel :
                                                </label>
                                                <img
                                                    src={faviconPreview || (siteSettings.faviconUrl ? `/${siteSettings.faviconUrl}` : '')}
                                                    alt="Favicon du site"
                                                    className="h-8 w-8 object-cover border border-gray-200 rounded-full"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Upload du favicon */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Télécharger un nouveau favicon :
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                                    <Upload className="w-4 h-4" />
                                                    <span>Choisir un fichier</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFaviconChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {faviconFile && (
                                                    <span className="text-sm text-gray-600">
                                                        {faviconFile.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Formats acceptés : JPG, PNG, SVG, ICO. Taille maximale : 2MB. Recommandé : 32x32 pixels.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Couleur Principale */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Couleur Principale
                                </h3>

                                {/* Roue chromatique avec opacité */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        Roue chromatique avec opacité :
                                    </label>
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <HexAlphaColorPicker
                                                color={
                                                    siteSettings.primaryColor
                                                }
                                                onChange={handleColorChange}
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                }}
                                            />
                                        </div>

                                        {/* Contrôles et aperçu */}
                                        <div className="flex-1 space-y-4">
                                            {/* Sélecteur de couleur personnalisé */}
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="color"
                                                    value={siteSettings.primaryColor.slice(
                                                        0,
                                                        7
                                                    )} // Enlever l'alpha pour l'input color standard
                                                    onChange={(e) =>
                                                        handleColorChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={
                                                        siteSettings.primaryColor
                                                    }
                                                    onChange={(e) =>
                                                        handleColorChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent font-mono"
                                                    placeholder="#425e9b"
                                                />
                                            </div>

                                            {/* Couleurs prédéfinies */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Couleurs prédéfinies :
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {predefinedColors.map(
                                                        (color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() =>
                                                                    handleColorChange(
                                                                        color
                                                                    )
                                                                }
                                                                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                                                                    siteSettings.primaryColor.slice(
                                                                        0,
                                                                        7
                                                                    ) === color
                                                                        ? "border-gray-800 ring-2 ring-gray-400"
                                                                        : "border-gray-300"
                                                                }`}
                                                                style={{
                                                                    backgroundColor:
                                                                        color,
                                                                }}
                                                                title={color}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Aperçu */}
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Aperçu :
                                                </p>
                                                <div className="flex space-x-2">
                                                    <div
                                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                siteSettings.primaryColor,
                                                        }}
                                                    >
                                                        Couleur principale
                                                    </div>
                                                    <div
                                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                lightenColor(
                                                                    siteSettings.primaryColor.slice(
                                                                        0,
                                                                        7
                                                                    ),
                                                                    20
                                                                ),
                                                        }}
                                                    >
                                                        Couleur claire
                                                    </div>
                                                    <div
                                                        className="px-4 py-2 rounded-lg text-white font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                darkenColor(
                                                                    siteSettings.primaryColor.slice(
                                                                        0,
                                                                        7
                                                                    ),
                                                                    15
                                                                ),
                                                        }}
                                                    >
                                                        Couleur foncée
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Informations du Site */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Informations du Site
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nom du site
                                            </label>
                                            <div className="relative group">
                                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                    Modifie le nom qui apparaît en haut du site et en bas de page
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={siteSettings.siteName}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    siteName: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sous-titre du site
                                        </label>
                                        <input
                                            type="text"
                                            value={siteSettings.siteSubtitle}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    siteSubtitle:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Informations du Club */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Informations du Club
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom du club
                                        </label>
                                        <input
                                            type="text"
                                            value={siteSettings.clubName}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    clubName: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Identifiant FFPJP
                                        </label>
                                        <input
                                            type="text"
                                            value={siteSettings.ffpjpId}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    ffpjpId: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Adresse
                                        </label>
                                        <textarea
                                            value={siteSettings.address}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    address: e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Téléphone
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="tel"
                                                    value={siteSettings.phone}
                                                    onChange={(e) =>
                                                        setSiteSettings((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-sm text-gray-600">
                                                        Caché
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSiteSettings(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    phoneVisible:
                                                                        !prev.phoneVisible,
                                                                })
                                                            )
                                                        }
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                            siteSettings.phoneVisible
                                                                ? "bg-green-600 focus:ring-green-500"
                                                                : "bg-red-500 focus:ring-red-500"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                siteSettings.phoneVisible
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                            }`}
                                                        />
                                                    </button>
                                                    <label className="text-sm text-gray-600">
                                                        Visible
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={siteSettings.email}
                                                onChange={(e) =>
                                                    setSiteSettings((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description du club
                                        </label>
                                        <textarea
                                            value={siteSettings.clubDescription}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    clubDescription: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                            placeholder="Un club convivial et dynamique qui rassemble les passionnés de pétanque de tous âges dans une ambiance chaleureuse et sportive."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lien Facebook
                                        </label>
                                        <input
                                            type="url"
                                            value={siteSettings.facebookUrl}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    facebookUrl: e.target.value,
                                                }))
                                            }
                                            placeholder="https://facebook.com/votre-page"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lien Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={siteSettings.instagramUrl}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    instagramUrl:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="https://instagram.com/votre-compte"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lien WhatsApp
                                        </label>
                                        <input
                                            type="url"
                                            value={siteSettings.whatsappUrl}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    whatsappUrl: e.target.value,
                                                }))
                                            }
                                            placeholder="https://wa.me/33123456789"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lien TikTok
                                        </label>
                                        <input
                                            type="url"
                                            value={siteSettings.tiktokUrl}
                                            onChange={(e) =>
                                                setSiteSettings((prev) => ({
                                                    ...prev,
                                                    tiktokUrl: e.target.value,
                                                }))
                                            }
                                            placeholder="https://tiktok.com/@votre-compte"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-var(--primary-color) focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        style={{
                            backgroundColor: "var(--primary-color)",
                            ":hover": {
                                backgroundColor: "var(--primary-dark)",
                            },
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Sauvegarde...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Sauvegarder</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiteManagement;