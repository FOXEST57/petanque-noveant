import { ExternalLink, MapPin, Search, X, Mail, Building, MapPin as MapPinIcon, Phone, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiCall } from "../utils/apiCall.js";

const ClubFinder = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [clubs, setClubs] = useState([]);
    const [filteredClubs, setFilteredClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showAccountRequestModal, setShowAccountRequestModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showFFPJPWarningModal, setShowFFPJPWarningModal] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const [requestForm, setRequestForm] = useState({
        clubName: "",
        contactName: "",
        email: "",
        phone: "",
        city: "",
        streetNumber: "",
        streetName: "",
        postalCode: "",
        ffpjpNumber: "",
        message: ""
    });
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Charger tous les clubs au démarrage
    useEffect(() => {
        loadAllClubs();
    }, []);

    // Filtrer les clubs selon le terme de recherche
    useEffect(() => {
        if (searchTerm.trim().length >= 2) {
            const filtered = clubs.filter(
                (club) =>
                    club.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    club.ville
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    club.numero_ffpjp.includes(searchTerm)
            );
            setFilteredClubs(filtered);
            setShowResults(true);
        } else {
            setFilteredClubs([]);
            setShowResults(false);
        }
    }, [searchTerm, clubs]);

    // Charger tous les clubs
    const loadAllClubs = async () => {
        try {
            setLoading(true);
            const data = await apiCall("/clubs");
            setClubs(data.clubs || []);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur lors du chargement des clubs");
        } finally {
            setLoading(false);
        }
    };

    // Gérer la soumission du formulaire de demande
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des champs obligatoires
        if (!requestForm.clubName.trim()) {
            toast.error("Le nom du club est obligatoire");
            return;
        }
        
        if (!requestForm.city.trim()) {
            toast.error("La ville est obligatoire");
            return;
        }
        
        if (!requestForm.contactName.trim()) {
            toast.error("Le nom du contact est obligatoire");
            return;
        }
        
        if (!requestForm.email.trim()) {
            toast.error("L'email est obligatoire");
            return;
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestForm.email)) {
            toast.error("Format d'email invalide");
            return;
        }
        
        // Vérifier si le numéro FFPJP est manquant
        if (!requestForm.ffpjpNumber.trim()) {
            // Si un compte a déjà été créé, procéder directement à la création sans modal
            if (accountCreated) {
                await processAccountCreation();
                return;
            }
            setShowFFPJPWarningModal(true);
            return;
        }
        
        // Si le numéro FFPJP est présent, procéder directement à la création
        await processAccountCreation();
    };

    // Fonction pour traiter la création du compte
    const processAccountCreation = async () => {
        try {
            // Préparer les données du club pour l'API
            const clubData = {
                nom: requestForm.clubName,
                ville: requestForm.city,
                numero_rue: requestForm.streetNumber,
                nom_rue: requestForm.streetName,
                code_postal: requestForm.postalCode,
                contactName: requestForm.contactName,
                email: requestForm.email,
                telephone: requestForm.phone
            };
            
            // Ajouter le numéro FFPJP seulement s'il est fourni
            if (requestForm.ffpjpNumber && requestForm.ffpjpNumber.trim() !== '') {
                clubData.numero_ffpjp = formatFFPJPNumberForSubmit(requestForm.ffpjpNumber);
            }
            
            console.log("Données du club à créer:", clubData);
            
            // Appel à l'API pour créer le club
            const response = await apiCall('/api/clubs', {
                method: 'POST',
                body: clubData
            });
            
            console.log("Réponse de l'API:", response);
            
            // Message de succès avec instructions détaillées
            const successMessage = requestForm.ffpjpNumber 
                ? "Votre club a été créé avec succès ! Un email de vérification sera envoyé à votre adresse. Veuillez cliquer sur le lien dans l'email pour créer votre mot de passe et accéder à votre espace d'administration."
                : "Votre club a été créé avec un accès provisoire de 30 jours. Un email de vérification sera envoyé à votre adresse. Veuillez cliquer sur le lien pour créer votre mot de passe. N'oubliez pas de renseigner votre numéro FFPJP dans les 30 jours.";
            
            toast.success(successMessage, { duration: 10000 });
            
            // Réinitialiser le formulaire et fermer les modales
            setRequestForm({
                clubName: '',
                contactName: '',
                email: '',
                phone: '',
                city: '',
                streetNumber: '',
                streetName: '',
                postalCode: '',
                ffpjpNumber: '',
                message: ''
            });
            setShowAccountRequestModal(false);
            setShowFFPJPWarningModal(false);
            setAccountCreated(true);
        } catch (error) {
            console.error("Erreur lors de la création du compte:", error);
            
            // Gestion spécifique des erreurs de doublon FFPJP
            if (error.message && error.message.includes('Ce numéro FFPJP est déjà utilisé')) {
                toast.error("Ce numéro FFPJP est déjà utilisé par un autre club. Veuillez vérifier votre numéro ou contacter l'administration.");
                // Fermer la modale d'avertissement FFPJP si elle est ouverte
                setShowFFPJPWarningModal(false);
                return;
            }
            
            // Autres erreurs de doublon
            if (error.message && error.message.includes('Cette information est déjà utilisée')) {
                toast.error("Ces informations sont déjà utilisées par un autre club. Veuillez vérifier vos données.");
                setShowFFPJPWarningModal(false);
                return;
            }
            
            // Erreur générique
            toast.error(error.message || "Erreur lors de la création du compte");
            setShowFFPJPWarningModal(false);
        }
    };

    // Fonction pour nettoyer le numéro FFPJP pendant la saisie (sans ajouter de zéros)
    const cleanFFPJPNumber = (number) => {
        if (!number || number.trim() === '') return '';
        
        // Supprimer tous les caractères non numériques
        const cleanNumber = number.replace(/\D/g, '');
        
        // Limiter à 4 chiffres maximum
        return cleanNumber.slice(0, 4);
    };

    // Fonction pour formater le numéro FFPJP final (compléter avec des zéros devant pour avoir 4 chiffres)
    const formatFFPJPNumberForSubmit = (number) => {
        if (!number || number.trim() === '') return '';
        
        const cleanNumber = cleanFFPJPNumber(number);
        if (cleanNumber === '') return '';
        
        // Compléter avec des zéros devant pour avoir 4 chiffres
        return cleanNumber.padStart(4, '0');
    };



    // Gérer les changements dans le formulaire de demande
    const handleRequestFormChange = (field, value) => {
        if (field === 'ffpjpNumber') {
            // Nettoyer la saisie sans ajouter de zéros automatiquement
            const cleanedValue = cleanFFPJPNumber(value);
            setRequestForm(prev => ({
                ...prev,
                [field]: cleanedValue
            }));
        } else {
            setRequestForm(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Gérer la sélection d'un club
    const handleClubSelect = (club) => {
        console.log("🔍 Club sélectionné:", club);
        console.log("🔍 Subdomain disponible:", club.subdomain);
        console.log("🔍 Environment:", process.env.NODE_ENV);

        if (!club.subdomain) {
            console.error("❌ Erreur: Aucun subdomain trouvé pour ce club");
            toast.error("Erreur: Ce club n'a pas de sous-domaine configuré");
            return;
        }

        // En développement, simuler la redirection avec un paramètre
        if (process.env.NODE_ENV === "development") {
            // Pour le développement, on utilise un paramètre URL au lieu d'un sous-domaine
            const frontendUrl =
                import.meta.env.VITE_FRONTEND_URL || window.location.origin;
            const targetUrl = `${frontendUrl}/?club=${club.subdomain}`;
            console.log("🚀 Redirection vers:", targetUrl);
            window.location.href = targetUrl;
        } else {
            const targetUrl = `https://${club.subdomain}.petanque-club.fr`;
            console.log("🚀 Redirection vers:", targetUrl);
            // En production, redirection vers le vrai sous-domaine
            window.location.href = targetUrl;
        }
    };

    // Gérer les clics en dehors des résultats
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-center">
                        <h1 className="text-3xl font-bold text-green-800">
                            BoulApp
                        </h1>
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Bienvenue sur BoulApp
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        L'application de gestion pour les clubs de pétanque
                    </p>
                    <p className="text-lg text-gray-500">
                        Trouvez votre club et accédez à votre espace membre
                    </p>
                </div>

                {/* Zone de recherche */}
                <div className="relative max-w-2xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() =>
                                searchTerm.length >= 2 && setShowResults(true)
                            }
                            placeholder="Recherchez votre club par nom, ville ou numéro FFPJP..."
                            className="block w-full pl-10 pr-3 py-4 text-lg border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg"
                        />
                    </div>

                    {/* Résultats de recherche */}
                    {showResults && (
                        <div
                            ref={resultsRef}
                            className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto"
                        >
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    Chargement...
                                </div>
                            ) : filteredClubs.length > 0 ? (
                                <div className="py-2">
                                    {filteredClubs.map((club) => (
                                        <button
                                            key={club.id}
                                            onClick={() =>
                                                handleClubSelect(club)
                                            }
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {club.nom}
                                                            </h3>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    {club.ville}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    FFPJP:{" "}
                                                                    {
                                                                        club.numero_ffpjp
                                                                    }
                                                                </div>
                                                            </div>
                                                            {club.adresse && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {
                                                                        club.adresse
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchTerm.length >= 2 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Aucun club trouvé pour "{searchTerm}"
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-12 text-center">
                    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Comment ça marche ?
                        </h3>
                        <div className="space-y-3 text-left">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-green-600">
                                        1
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Tapez le nom de votre club, votre ville ou
                                    votre numéro FFPJP
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-green-600">
                                        2
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Sélectionnez votre club dans la liste des
                                    résultats
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-green-600">
                                        3
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Vous serez redirigé vers l'espace de votre
                                    club
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section pour les clubs sans compte */}
                <div className="mt-8 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            Votre club n'est pas listé ou n'a pas de compte ?
                        </h3>
                        <p className="text-blue-700 mb-4">
                            Si votre club n'apparaît pas dans les résultats ou s'il est listé mais sans espace membre, vous pouvez ouvrir un compte directement.
                        </p>
                        <button
                            onClick={() => {
                                setAccountCreated(false);
                                setShowWarningModal(true);
                            }}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Ouvrir un compte club
                        </button>
                    </div>
                </div>
            </main>

            {/* Modale d'avertissement FFPJP manquant */}
            {showFFPJPWarningModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
                                Numéro FFPJP manquant
                            </h2>
                            <button
                                onClick={() => setShowFFPJPWarningModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                <p className="text-orange-800 font-medium mb-2">
                                    ⚠️ Accès provisoire accordé
                                </p>
                                <p className="text-orange-700 text-sm">
                                    Le numéro FFPJP n'étant pas renseigné, l'accès à l'application sera <strong>provisoire</strong>.
                                </p>
                            </div>
                            
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 font-medium mb-2">
                                    📅 Délai de 30 jours
                                </p>
                                <p className="text-red-700 text-sm">
                                    Vous disposez de <strong>30 jours</strong> pour renseigner le numéro FFPJP. 
                                    Passé ce délai, l'accès sera <strong>bloqué</strong> jusqu'à ce que cette information soit fournie.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFFPJPWarningModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={async () => {
                                    setShowFFPJPWarningModal(false);
                                    setShowAccountRequestModal(false); // Fermer le modal principal immédiatement
                                    setAccountCreated(true); // Marquer le compte comme créé pour éviter la boucle
                                    await processAccountCreation();
                                }}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Continuer malgré tout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale d'avertissement */}
            {showWarningModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
                                Avertissement Important
                            </h2>
                            
                            <div className="text-gray-700 space-y-3 mb-6">
                                <p className="text-center">
                                    Seules les personnes habilitées peuvent ouvrir un compte pour le club :
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-sm">
                                    <li>Le <strong>président</strong> du club</li>
                                    <li>Un <strong>membre du comité</strong> ayant la capacité de représenter le club</li>
                                </ul>
                                <p className="text-center text-sm text-gray-600 mt-4">
                                    En continuant, vous confirmez être une personne habilitée à représenter votre club.
                                </p>
                            </div>

                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={() => setShowWarningModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        setShowWarningModal(false);
                                        setShowAccountRequestModal(true);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Je confirme
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale de demande d'ouverture de compte */}
            {showAccountRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Ouverture de compte club
                                </h2>
                                <button
                                    onClick={() => setShowAccountRequestModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Nom du club */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom du club *
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={requestForm.clubName}
                                                onChange={(e) => handleRequestFormChange('clubName', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Nom complet du club"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Nom du contact */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom du contact *
                                        </label>
                                        <input
                                            type="text"
                                            value={requestForm.contactName}
                                            onChange={(e) => handleRequestFormChange('contactName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Prénom et nom"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={requestForm.email}
                                                onChange={(e) => handleRequestFormChange('email', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="email@exemple.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Téléphone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Téléphone
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={requestForm.phone}
                                                onChange={(e) => handleRequestFormChange('phone', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="06 12 34 56 78"
                                            />
                                        </div>
                                    </div>

                                    {/* Ville */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ville
                                        </label>
                                        <div className="relative">
                                            <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={requestForm.city}
                                                onChange={(e) => handleRequestFormChange('city', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ville du club"
                                            />
                                        </div>
                                    </div>

                                    {/* Adresse - Numéro et Rue */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Numéro
                                            </label>
                                            <input
                                                type="text"
                                                value={requestForm.streetNumber}
                                                onChange={(e) => handleRequestFormChange('streetNumber', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: 15"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rue
                                            </label>
                                            <input
                                                type="text"
                                                value={requestForm.streetName}
                                                onChange={(e) => handleRequestFormChange('streetName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: Rue de la République"
                                            />
                                        </div>
                                    </div>

                                    {/* Code Postal */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Code Postal
                                        </label>
                                        <input
                                            type="text"
                                            value={requestForm.postalCode}
                                            onChange={(e) => handleRequestFormChange('postalCode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: 57680"
                                            maxLength="5"
                                        />
                                    </div>

                                    {/* Numéro FFPJP */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro FFPJP
                                        </label>
                                        <input
                                            type="text"
                                            value={requestForm.ffpjpNumber}
                                            onChange={(e) => handleRequestFormChange('ffpjpNumber', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: 15 → 0015"
                                            maxLength="4"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Le numéro sera automatiquement formaté sur 4 chiffres (ex: 15 → 0015)
                                        </p>
                                    </div>


                                </div>

                                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowAccountRequestModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Créer le compte
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-white border-t mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-500">
                        <p>
                            &copy; 2025 BoulApp - Application de gestion pour
                            clubs de pétanque
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClubFinder;
