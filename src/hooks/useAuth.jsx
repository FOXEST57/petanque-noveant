import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                await fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchUserProfile(session.user.id);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error fetching user profile:", error);
                return;
            }

            setUserProfile(data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const signUp = async (email, password, userData = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData,
                },
            });

            if (error) throw error;

            // Create user profile in users table
            if (data.user) {
                const { error: profileError } = await supabase
                    .from("users")
                    .insert({
                        id: data.user.id,
                        email: data.user.email,
                        first_name: userData.first_name || "",
                        last_name: userData.last_name || "",
                        phone: userData.phone || "",
                        role: "membre",
                    });

                if (profileError) {
                    console.error("Error creating user profile:", profileError);
                }
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const resetPassword = async (email) => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(
                email
            );
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const updateProfile = async (updates) => {
        try {
            // Update auth user metadata
            const { data: authData, error: authError } =
                await supabase.auth.updateUser({
                    data: updates,
                });

            if (authError) throw authError;

            // Update user profile in users table
            if (user?.id) {
                const { data: profileData, error: profileError } =
                    await supabase
                        .from("users")
                        .update(updates)
                        .eq("id", user.id)
                        .select()
                        .single();

                if (profileError) throw profileError;

                setUserProfile(profileData);
            }

            return { data: authData, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const getUserRole = () => {
        return userProfile?.role || "visiteur";
    };

    const isAdmin = () => {
        return getUserRole() === "admin";
    };

    const isResponsable = () => {
        return getUserRole() === "responsable" || isAdmin();
    };

    const isMembre = () => {
        return ["membre", "responsable", "admin"].includes(getUserRole());
    };

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        getUserRole,
        isAdmin,
        isResponsable,
        isMembre,
        fetchUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
