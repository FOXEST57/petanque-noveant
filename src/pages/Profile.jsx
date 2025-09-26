import {
    Edit3,
    Save,
    X,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Plus,
    Eye,
    EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { apiCall } from "../utils/apiCall.js";

const Profile = () => {
    const { user, signOut, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        nom: "",
        prenom: "",
        surnom: "",
        email: "",
        telephone: "",
        numero_rue: "",
        rue: "",
        code_postal: "",
        ville: "",
        solde: 0,
    });
    const [saving, setSaving] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

    useEffect(() => {
        if (!user) {
            // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
            navigate('/login');
            return;
        }
        loadUserProfile();
    }, [user, navigate]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await apiCall('/auth/profile');
            
            setProfileData({
                nom: data.user.nom || '',
                prenom: data.user.prenom || '',
                surnom: data.user.surnom || '',
                email: data.user.email || '',
                telephone: data.user.telephone || '',
                numero_rue: data.user.numeroRue || '',
                rue: data.user.rue || '',
                code_postal: data.user.codePostal || '',
                ville: data.user.ville || '',
                solde: data.user.solde || 0,
                currentPassword: ''
            });
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            // Préparer les données à envoyer
            const dataToSend = {
                nom: profileData.nom,
                prenom: profileData.prenom,
                surnom: profileData.surnom,
                telephone: profileData.telephone,
                numero_rue: profileData.numero_rue,
                rue: profileData.rue,
                code_postal: profileData.code_postal,
                ville: profileData.ville
            };

            // Mettre à jour le profil
            await apiCall('/auth/profile', {
                method: 'PUT',
                body: dataToSend
            });

            // Si l'email a changé, utiliser la route spécifique
            if (profileData.email !== user.email) {
                await apiCall('/auth/change-email', {
                    method: 'PUT',
                    body: {
                        newEmail: profileData.email,
                        password: profileData.currentPassword
                    }
                });

                // Déconnecter l'utilisateur pour qu'il se reconnecte avec le nouvel email
                alert('Email changé avec succès. Vous allez être déconnecté pour vous reconnecter avec votre nouvel email.');
                signOut();
                return;
            }

            // Recharger les données utilisateur
            await loadUserProfile();
            setEditingProfile(false);
            alert('Profil mis à jour avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handleAddMoney = async () => {
        const amount = prompt('Montant à ajouter (€):');
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert('Montant invalide');
            return;
        }

        try {
            setLoading(true);
            const data = await apiCall('/auth/add-money', {
                method: 'POST',
                body: { amount: parseFloat(amount) }
            });
            
            // Mettre à jour le solde dans l'état local
            setProfileData(prev => ({
                ...prev,
                solde: data.nouveauSolde
            }));

            alert(`${amount}€ ajouté avec succès ! Nouveau solde: ${data.nouveauSolde}€`);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'ajout d\'argent');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Chargement de votre profil...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Mon Profil
                                </h1>
                                <p className="text-gray-600">
                                    Gérez vos informations personnelles et votre compte
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">
                                        {showBalance ? `${profileData.solde.toFixed(2)} €` : "••••"}
                                    </span>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddMoney}
                                    className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Ajouter de l'argent</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Informations Personnelles
                            </h2>
                            {!editingProfile ? (
                                <button
                                    onClick={() => setEditingProfile(true)}
                                    className="flex items-center space-x-2 text-[var(--primary-color)] hover:text-[var(--primary-dark)]"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Modifier</span>
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleProfileUpdate}
                                        disabled={saving}
                                        className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-dark)] disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>
                                            {saving ? "Enregistrement..." : "Enregistrer"}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingProfile(false);
                                            loadUserProfile(); // Recharger les données originales
                                        }}
                                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Annuler</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Informations de base */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Informations de base
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Nom *
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.nom}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        nom: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.nom || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Prénom *
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.prenom}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        prenom: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.prenom || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Surnom
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.surnom}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        surnom: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="Votre surnom"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.surnom || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Email *
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.email || "Non renseigné"}
                                            </p>
                                        )}
                                        {editingProfile && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                ⚠️ Attention : L'email est votre identifiant de connexion
                                            </p>
                                        )}
                                        {editingProfile && profileData.email !== user.email && (
                                            <div className="mt-2">
                                                <label className="block mb-1 text-sm font-medium text-red-700">
                                                    Mot de passe actuel (requis pour changer l'email) *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={profileData.currentPassword}
                                                    onChange={(e) =>
                                                        setProfileData({
                                                            ...profileData,
                                                            currentPassword: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                                    placeholder="Votre mot de passe actuel"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Téléphone
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="tel"
                                                value={profileData.telephone}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        telephone: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="06 12 34 56 78"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.telephone || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Adresse */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Adresse
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Numéro de rue
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.numero_rue}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        numero_rue: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="123"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.numero_rue || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Rue
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.rue}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        rue: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="Rue de la République"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.rue || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Code postal
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.code_postal}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        code_postal: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="57000"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.code_postal || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Ville
                                        </label>
                                        {editingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.ville}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        ville: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                                                placeholder="Metz"
                                            />
                                        ) : (
                                            <p className="text-gray-900 py-2">
                                                {profileData.ville || "Non renseigné"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Solde du compte */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Solde du compte
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Solde actuel</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {profileData.solde.toFixed(2)} €
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleAddMoney}
                                            className="flex items-center space-x-2 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Ajouter de l'argent</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Utilisez votre solde pour payer les cotisations, événements et autres services du club.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;