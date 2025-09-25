import { ExternalLink, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { apiCall } from "../utils/apiCall.js";

const ClubFinder = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [clubs, setClubs] = useState([]);
    const [filteredClubs, setFilteredClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
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
            </main>

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
