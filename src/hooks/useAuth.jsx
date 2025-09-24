import { createContext, useContext, useEffect, useState } from "react";
import { apiCall } from '../lib/api';
import ClubSelectionModal from "../components/ClubSelectionModal.jsx";

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showClubSelection, setShowClubSelection] = useState(false);
    const [pendingSuperAdmin, setPendingSuperAdmin] = useState(null);

    // Vérifier si un token existe au démarrage
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            // Vérifier la validité du token en récupérant le profil
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return;

            const userData = await apiCall("/api/auth/profile");
            setUser(userData.user);
            setUserProfile(userData.user);
        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);
            localStorage.removeItem("auth_token");
            setUser(null);
            setUserProfile(null);
        }
    };

    const signUp = async (email, password, userData) => {
        try {
            setLoading(true);
            const data = await apiCall("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    ...userData,
                }),
            });

            localStorage.setItem("auth_token", data.token);
            setUser(data.user);
            setUserProfile(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const data = await apiCall("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            console.log("🔍 Réponse de l'API login:", data);
            console.log("🔍 Token reçu:", data.token);
            
            // Vérifier si l'utilisateur est un super admin
            if (data.user.is_super_admin) {
                // Pour les super admins, ne pas stocker le token immédiatement
                // Afficher la modale de sélection de club
                const pendingData = {
                    token: data.token,
                    user: data.user,
                    email: email,
                };
                console.log("🔍 Données pendingSuperAdmin:", pendingData);

                // Sauvegarder le token dans localStorage comme backup
                localStorage.setItem(
                    "pending_super_admin_token",
                    data.token
                );
                console.log("🔍 Token sauvegardé dans localStorage");

                setPendingSuperAdmin(pendingData);
                setShowClubSelection(true);
                return {
                    success: true,
                    user: data.user,
                    requiresClubSelection: true,
                };
            } else {
                // Utilisateur normal, connexion directe
                localStorage.setItem("auth_token", data.token);
                setUser(data.user);
                setUserProfile(data.user);
                return { success: true, user: data.user };
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (token) {
                // Appeler l'API de déconnexion si disponible
                await apiCall("/api/auth/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        } finally {
            // Nettoyer l'état local dans tous les cas
            localStorage.removeItem("auth_token");
            setUser(null);
            setUserProfile(null);
            console.log("Utilisateur déconnecté");
        }
    };

    const getCurrentUser = () => {
        return user;
    };

    const onAuthStateChange = (callback) => {
        // Implémenter l'écoute des changements d'état d'authentification
        console.log("onAuthStateChange appelé");
        return { unsubscribe: () => {} };
    };

    const resetPassword = async (email) => {
        // TODO: Implémenter la réinitialisation de mot de passe avec votre API locale
        console.log("resetPassword appelé pour:", email);
        throw new Error("Réinitialisation de mot de passe non implémentée");
    };

    const updateProfile = async (updates) => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) throw new Error("Non authentifié");

            await apiCall("/api/auth/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            // Recharger le profil utilisateur
            await fetchUserProfile();
            return { success: true };
        } catch (error) {
            console.error("Erreur de mise à jour du profil:", error);
            throw error;
        }
    };

    const isAdmin = () => {
        return (
            userProfile?.role === "president" ||
            userProfile?.role === "vice_president"
        );
    };

    const isMembre = () => {
        return (
            userProfile?.role === "president" ||
            userProfile?.role === "vice_president" ||
            userProfile?.role === "secretaire" ||
            userProfile?.role === "tresorier" ||
            userProfile?.role === "membre"
        );
    };

    const isSuperAdmin = () => {
        return userProfile?.is_super_admin === 1;
    };

    const selectClub = async (clubId) => {
        console.log("🔍 Début selectClub, clubId:", clubId);
        console.log("🔍 pendingSuperAdmin actuel:", pendingSuperAdmin);

        try {
            // Récupérer le token du super admin en attente
            let token = pendingSuperAdmin?.token;
            console.log("🔍 Token extrait de pendingSuperAdmin:", token);

            // Si le token n'est pas dans pendingSuperAdmin, essayer de le récupérer du localStorage
            if (!token) {
                console.log(
                    "🔍 Token non trouvé dans pendingSuperAdmin, vérification localStorage..."
                );
                token = localStorage.getItem("pending_super_admin_token");
                console.log("🔍 Token récupéré du localStorage:", token);
            }

            console.log("🔍 Token final utilisé:", token);
            console.log("🔍 Type du token:", typeof token);

            if (!token) {
                console.error("❌ Token manquant partout:", {
                    pendingSuperAdmin,
                    localStorage: localStorage.getItem(
                        "pending_super_admin_token"
                    ),
                });
                throw new Error("Token d'authentification manquant");
            }

            const data = await apiCall("/api/auth/super-admin-login", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ clubId }),
            });

            // Mettre à jour le token et les informations utilisateur
            localStorage.setItem("auth_token", data.token);
            localStorage.removeItem("pending_super_admin_token"); // Nettoyer le token temporaire
            setUser(data.user);
            setUserProfile(data.user);
            setShowClubSelection(false);
            setPendingSuperAdmin(null);

            // Déclencher un événement personnalisé pour notifier le changement de club
            window.dispatchEvent(
                new CustomEvent("clubChanged", { detail: { clubId } })
            );
        } catch (error) {
            console.error("Erreur lors de la sélection du club:", error);
            throw error; // Propager l'erreur pour que la modale puisse l'afficher
        }
    };

    const cancelClubSelection = () => {
        setShowClubSelection(false);
        setPendingSuperAdmin(null);
        localStorage.removeItem("pending_super_admin_token"); // Nettoyer le token temporaire
    };

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        onAuthStateChange,
        resetPassword,
        updateProfile,
        fetchUserProfile,
        isAdmin,
        isMembre,
        isSuperAdmin,
        selectClub,
        cancelClubSelection,
        showClubSelection,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showClubSelection && pendingSuperAdmin && (
                <ClubSelectionModal
                    isOpen={showClubSelection}
                    onClose={cancelClubSelection}
                    onSelectClub={selectClub}
                    userEmail={pendingSuperAdmin.email}
                />
            )}
        </AuthContext.Provider>
    );
};
