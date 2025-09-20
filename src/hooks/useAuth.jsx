import { createContext, useContext, useEffect, useState } from "react";

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
    const [loading, setLoading] = useState(false);

    // Vérifier si un token existe au démarrage
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Vérifier la validité du token en récupérant le profil
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData.user);
                setUserProfile(userData.user);
            } else {
                // Token invalide, le supprimer
                localStorage.removeItem('auth_token');
                setUser(null);
                setUserProfile(null);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
            setUserProfile(null);
        }
    };

    const signUp = async (email, password, userData) => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    ...userData
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                setUser(data.user);
                setUserProfile(data.user);
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            setLoading(true);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                setUser(data.user);
                setUserProfile(data.user);
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Erreur lors de la connexion');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Appeler l'API de déconnexion si disponible
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // Nettoyer l'état local dans tous les cas
            localStorage.removeItem('auth_token');
            setUser(null);
            setUserProfile(null);
            console.log('Utilisateur déconnecté');
        }
    };

    const getCurrentUser = () => {
        return user;
    };

    const onAuthStateChange = (callback) => {
        // Implémenter l'écoute des changements d'état d'authentification
        console.log('onAuthStateChange appelé');
        return { unsubscribe: () => {} };
    };

    const resetPassword = async (email) => {
        // TODO: Implémenter la réinitialisation de mot de passe avec votre API locale
        console.log('resetPassword appelé pour:', email);
        throw new Error('Réinitialisation de mot de passe non implémentée');
    };

    const updateProfile = async (updates) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('Non authentifié');

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                // Recharger le profil utilisateur
                await fetchUserProfile();
                return { success: true };
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur de mise à jour du profil:', error);
            throw error;
        }
    };

    const isAdmin = () => {
        return userProfile?.role === 'president' || userProfile?.role === 'vice_president';
    };

    const isMembre = () => {
        return userProfile?.role === 'president' || userProfile?.role === 'vice_president' || userProfile?.role === 'secretaire' || userProfile?.role === 'tresorier' || userProfile?.role === 'membre';
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
        isMembre
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
