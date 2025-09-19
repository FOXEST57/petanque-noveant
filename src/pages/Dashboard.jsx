import {
    Calendar,
    Edit3,
    LogOut,
    Save,
    Trophy,
    User,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

const Dashboard = () => {
    const { user, signOut, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [userEvents, setUserEvents] = useState([]);
    const [userTeams, setUserTeams] = useState([]);
    const [userMatches, setUserMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserData();
            setProfileData({
                firstName: user.user_metadata?.firstName || "",
                lastName: user.user_metadata?.lastName || "",
                phone: user.user_metadata?.phone || "",
            });
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            // TODO: Remplacer par des appels API locaux si nécessaire
            // Pour l'instant, on initialise avec des données vides
            setUserEvents([]);
            setUserTeams([]);
            setUserMatches([]);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            await updateProfile(profileData);
            setEditingProfile(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Chargement de votre tableau de bord...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tableau de bord
                            </h1>
                            <p className="text-gray-600">
                                Bienvenue,{" "}
                                {user?.user_metadata?.firstName || user?.email}
                            </p>
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="p-4 bg-white rounded-lg shadow">
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                                            activeTab === "profile"
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <User className="w-5 h-5" />
                                        <span>Mon Profil</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("events")}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                                            activeTab === "events"
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span>Mes Événements</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("teams")}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                                            activeTab === "teams"
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span>Mes Équipes</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab("matches")}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                                            activeTab === "matches"
                                                ? "bg-blue-100 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Trophy className="w-5 h-5" />
                                        <span>Mes Matchs</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Mon Profil
                                        </h2>
                                        {!editingProfile && (
                                            <button
                                                onClick={() =>
                                                    setEditingProfile(true)
                                                }
                                                className="flex items-center space-x-2 text-[var(--primary-color)] hover:text-[var(--primary-dark)]"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span>Modifier</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    Prénom
                                                </label>
                                                {editingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            profileData.firstName
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                firstName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {user?.user_metadata
                                                            ?.firstName ||
                                                            "Non renseigné"}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                                    Nom
                                                </label>
                                                {editingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            profileData.lastName
                                                        }
                                                        onChange={(e) =>
                                                            setProfileData({
                                                                ...profileData,
                                                                lastName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">
                                                        {user?.user_metadata
                                                            ?.lastName ||
                                                            "Non renseigné"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <p className="text-gray-900">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Téléphone
                                            </label>
                                            {editingProfile ? (
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) =>
                                                        setProfileData({
                                                            ...profileData,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                />
                                            ) : (
                                                <p className="text-gray-900">
                                                    {user?.user_metadata
                                                        ?.phone ||
                                                        "Non renseigné"}
                                                </p>
                                            )}
                                        </div>

                                        {editingProfile && (
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={
                                                        handleProfileUpdate
                                                    }
                                                    disabled={saving}
                                                    className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-dark)] disabled:opacity-50"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>
                                                        {saving
                                                            ? "Enregistrement..."
                                                            : "Enregistrer"}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingProfile(
                                                            false
                                                        );
                                                        setProfileData({
                                                            firstName:
                                                                user
                                                                    ?.user_metadata
                                                                    ?.firstName ||
                                                                "",
                                                            lastName:
                                                                user
                                                                    ?.user_metadata
                                                                    ?.lastName ||
                                                                "",
                                                            phone:
                                                                user
                                                                    ?.user_metadata
                                                                    ?.phone ||
                                                                "",
                                                        });
                                                    }}
                                                    className="flex items-center px-4 py-2 space-x-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Annuler</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Events Tab */}
                            {activeTab === "events" && (
                                <div className="p-6">
                                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                                        Mes Événements
                                    </h2>

                                    {userEvents.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                            <p className="text-gray-600">
                                                Aucun événement inscrit
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userEvents.map((registration) => (
                                                <div
                                                    key={registration.id}
                                                    className="p-4 rounded-lg border border-gray-200"
                                                >
                                                    <h3 className="font-semibold text-gray-900">
                                                        {
                                                            registration.events
                                                                .title
                                                        }
                                                    </h3>
                                                    <p className="mt-1 text-gray-600">
                                                        {
                                                            registration.events
                                                                .description
                                                        }
                                                    </p>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(
                                                                registration
                                                                    .events
                                                                    .event_date
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                registration.status ===
                                                                "confirmed"
                                                                    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                        >
                                                            {registration.status ===
                                                            "confirmed"
                                                                ? "Confirmé"
                                                                : "En attente"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Teams Tab */}
                            {activeTab === "teams" && (
                                <div className="p-6">
                                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                                        Mes Équipes
                                    </h2>

                                    {userTeams.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Users className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                            <p className="text-gray-600">
                                                Aucune équipe rejointe
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {userTeams.map((membership) => (
                                                <div
                                                    key={membership.id}
                                                    className="p-4 rounded-lg border border-gray-200"
                                                >
                                                    <h3 className="font-semibold text-gray-900">
                                                        {membership.teams.name}
                                                    </h3>
                                                    <p className="mt-1 text-gray-600">
                                                        {
                                                            membership.teams
                                                                .description
                                                        }
                                                    </p>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-sm text-gray-500">
                                                            Membre depuis{" "}
                                                            {formatDate(
                                                                membership.joined_at
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                membership.role ===
                                                                "captain"
                                                                    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800"
                                                                    : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800"
                                                            }`}
                                                        >
                                                            {membership.role ===
                                                            "captain"
                                                                ? "Capitaine"
                                                                : "Membre"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Matches Tab */}
                            {activeTab === "matches" && (
                                <div className="p-6">
                                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                                        Mes Matchs Récents
                                    </h2>

                                    {userMatches.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Trophy className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                            <p className="text-gray-600">
                                                Aucun match enregistré
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userMatches.map((match) => (
                                                <div
                                                    key={match.id}
                                                    className="p-4 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                Match du{" "}
                                                                {formatDate(
                                                                    match.match_date
                                                                )}
                                                            </h3>
                                                            <p className="mt-1 text-gray-600">
                                                                Score:{" "}
                                                                {
                                                                    match.team1_score
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    match.team2_score
                                                                }
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                match.status ===
                                                                "completed"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : match.status ===
                                                                      "in_progress"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {match.status ===
                                                            "completed"
                                                                ? "Terminé"
                                                                : match.status ===
                                                                  "in_progress"
                                                                ? "En cours"
                                                                : "Programmé"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
