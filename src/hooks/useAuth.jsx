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

    // TODO: Remplacer par votre système d'authentification local
    // Pour l'instant, on simule un utilisateur connecté
    useEffect(() => {
        // Simulation d'un utilisateur pour les tests
        const mockUser = {
            id: 'mock-user-id',
            email: 'admin@petanque-noveant.fr'
        };
        
        const mockProfile = {
            first_name: 'Admin',
            last_name: 'Pétanque',
            phone: '0123456789',
            role: 'admin'
        };
        
        setUser(mockUser);
        setUserProfile(mockProfile);
        setLoading(false);
    }, []);

    const fetchUserProfile = async (userId) => {
        // TODO: Implémenter la récupération du profil utilisateur depuis votre API locale
        console.log('fetchUserProfile appelé pour:', userId);
        return null;
    };

    const signUp = async (email, password, userData) => {
        // TODO: Implémenter l'inscription avec votre API locale
        console.log('signUp appelé:', { email, userData });
        throw new Error('Inscription non implémentée - remplacer par votre API locale');
    };

    const signIn = async (email, password) => {
        // TODO: Implémenter la connexion avec votre API locale
        console.log('signIn appelé:', { email });
        throw new Error('Connexion non implémentée - remplacer par votre API locale');
    };

    const signOut = async () => {
        // TODO: Implémenter la déconnexion avec votre API locale
        setUser(null);
        setUserProfile(null);
        console.log('Utilisateur déconnecté');
    };

    const getCurrentUser = () => {
        return user;
    };

    const onAuthStateChange = (callback) => {
        // TODO: Implémenter l'écoute des changements d'état d'authentification
        console.log('onAuthStateChange appelé');
        return { unsubscribe: () => {} };
    };

    const resetPassword = async (email) => {
        // TODO: Implémenter la réinitialisation de mot de passe avec votre API locale
        console.log('resetPassword appelé pour:', email);
        throw new Error('Réinitialisation de mot de passe non implémentée');
    };

    const updateProfile = async (updates) => {
        // TODO: Implémenter la mise à jour du profil avec votre API locale
        console.log('updateProfile appelé:', updates);
        // Simulation de mise à jour locale
        if (user) {
            const updatedUser = {
                ...user,
                user_metadata: {
                    ...user.user_metadata,
                    ...updates
                }
            };
            setUser(updatedUser);
            setUserProfile(updatedUser.user_metadata);
        }
    };

    const isAdmin = () => {
        return userProfile?.role === 'admin';
    };

    const isMembre = () => {
        return userProfile?.role === 'admin' || userProfile?.role === 'responsable' || userProfile?.role === 'membre';
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
