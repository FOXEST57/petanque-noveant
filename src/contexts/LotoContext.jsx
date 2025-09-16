import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Actions pour le reducer
const LOTO_ACTIONS = {
    SET_LOTOS: 'SET_LOTOS',
    ADD_LOTO: 'ADD_LOTO',
    UPDATE_LOTO: 'UPDATE_LOTO',
    DELETE_LOTO: 'DELETE_LOTO',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',
    SET_MODAL_STATE: 'SET_MODAL_STATE',
    RESET_FORM: 'RESET_FORM'
};

// État initial
const initialState = {
    lotos: [],
    loading: false,
    error: null,
    searchTerm: '',
    showModal: false,
    modalMode: 'add', // 'add' ou 'edit'
    selectedLoto: null,
    formData: {
        nom: '',
        date: '',
        description: '',
        prixCarton: '',
        lotsAGagner: '',
        statut: 'planifie'
    }
};

// Reducer pour gérer les actions
const lotoReducer = (state, action) => {
    switch (action.type) {
        case LOTO_ACTIONS.SET_LOTOS:
            return {
                ...state,
                lotos: action.payload,
                loading: false,
                error: null
            };
        
        case LOTO_ACTIONS.ADD_LOTO:
            return {
                ...state,
                lotos: [...state.lotos, action.payload],
                showModal: false,
                formData: initialState.formData
            };
        
        case LOTO_ACTIONS.UPDATE_LOTO:
            return {
                ...state,
                lotos: state.lotos.map(loto => 
                    loto.id === action.payload.id ? action.payload : loto
                ),
                showModal: false,
                selectedLoto: null,
                formData: initialState.formData
            };
        
        case LOTO_ACTIONS.DELETE_LOTO:
            return {
                ...state,
                lotos: state.lotos.filter(loto => loto.id !== action.payload)
            };
        
        case LOTO_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        
        case LOTO_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        
        case LOTO_ACTIONS.SET_SEARCH_TERM:
            return {
                ...state,
                searchTerm: action.payload
            };
        
        case LOTO_ACTIONS.SET_MODAL_STATE:
            return {
                ...state,
                showModal: action.payload.show,
                modalMode: action.payload.mode || state.modalMode,
                selectedLoto: action.payload.loto || null,
                formData: action.payload.formData || state.formData
            };
        
        case LOTO_ACTIONS.RESET_FORM:
            return {
                ...state,
                formData: initialState.formData,
                selectedLoto: null
            };
        
        default:
            return state;
    }
};

// Création du contexte
const LotoContext = createContext();

// Provider du contexte
export const LotoProvider = ({ children }) => {
    const [state, dispatch] = useReducer(lotoReducer, initialState);

    // Sélecteurs (computed values)
    const filteredLotos = state.lotos.filter(loto => 
        loto.nom.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        loto.description.toLowerCase().includes(state.searchTerm.toLowerCase())
    );

    // Actions
    const actions = {
        // Charger les lotos depuis l'API
        loadLotos: async () => {
            dispatch({ type: LOTO_ACTIONS.SET_LOADING, payload: true });
            try {
                // Ici vous pourriez appeler votre API
                // const lotos = await lotoAPI.getAll();
                // dispatch({ type: LOTO_ACTIONS.SET_LOTOS, payload: lotos });
                
                // Pour l'exemple, on utilise des données mockées
                const mockLotos = [
                    {
                        id: 1,
                        nom: 'Loto de Printemps',
                        date: '2024-04-15',
                        description: 'Grand loto annuel du club',
                        prixCarton: 5,
                        lotsAGagner: 'Jambon, bouteilles, bons d\'achat',
                        statut: 'planifie'
                    }
                ];
                dispatch({ type: LOTO_ACTIONS.SET_LOTOS, payload: mockLotos });
            } catch (error) {
                dispatch({ type: LOTO_ACTIONS.SET_ERROR, payload: error.message });
            }
        },

        // Ajouter un nouveau loto
        addLoto: async (lotoData) => {
            try {
                // Ici vous pourriez appeler votre API
                // const newLoto = await lotoAPI.create(lotoData);
                
                // Pour l'exemple, on crée un loto avec un ID généré
                const newLoto = {
                    id: Date.now(),
                    ...lotoData,
                    prixCarton: parseFloat(lotoData.prixCarton)
                };
                
                dispatch({ type: LOTO_ACTIONS.ADD_LOTO, payload: newLoto });
                return newLoto;
            } catch (error) {
                dispatch({ type: LOTO_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Mettre à jour un loto
        updateLoto: async (id, lotoData) => {
            try {
                // Ici vous pourriez appeler votre API
                // const updatedLoto = await lotoAPI.update(id, lotoData);
                
                const updatedLoto = {
                    id,
                    ...lotoData,
                    prixCarton: parseFloat(lotoData.prixCarton)
                };
                
                dispatch({ type: LOTO_ACTIONS.UPDATE_LOTO, payload: updatedLoto });
                return updatedLoto;
            } catch (error) {
                dispatch({ type: LOTO_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Supprimer un loto
        deleteLoto: async (id) => {
            try {
                // Ici vous pourriez appeler votre API
                // await lotoAPI.delete(id);
                
                dispatch({ type: LOTO_ACTIONS.DELETE_LOTO, payload: id });
            } catch (error) {
                dispatch({ type: LOTO_ACTIONS.SET_ERROR, payload: error.message });
                throw error;
            }
        },

        // Gérer la recherche
        setSearchTerm: (term) => {
            dispatch({ type: LOTO_ACTIONS.SET_SEARCH_TERM, payload: term });
        },

        // Gérer les modales
        openAddModal: () => {
            dispatch({ 
                type: LOTO_ACTIONS.SET_MODAL_STATE, 
                payload: { 
                    show: true, 
                    mode: 'add',
                    formData: initialState.formData
                }
            });
        },

        openEditModal: (loto) => {
            dispatch({ 
                type: LOTO_ACTIONS.SET_MODAL_STATE, 
                payload: { 
                    show: true, 
                    mode: 'edit',
                    loto: loto,
                    formData: {
                        nom: loto.nom,
                        date: loto.date,
                        description: loto.description,
                        prixCarton: loto.prixCarton.toString(),
                        lotsAGagner: loto.lotsAGagner,
                        statut: loto.statut
                    }
                }
            });
        },

        closeModal: () => {
            dispatch({ 
                type: LOTO_ACTIONS.SET_MODAL_STATE, 
                payload: { show: false }
            });
        },

        // Réinitialiser le formulaire
        resetForm: () => {
            dispatch({ type: LOTO_ACTIONS.RESET_FORM });
        }
    };

    // Charger les lotos au montage du composant
    useEffect(() => {
        actions.loadLotos();
    }, []);

    const value = {
        // État
        ...state,
        
        // Données calculées
        filteredLotos,
        
        // Actions
        ...actions
    };

    return (
        <LotoContext.Provider value={value}>
            {children}
        </LotoContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte
export const useLoto = () => {
    const context = useContext(LotoContext);
    if (!context) {
        throw new Error('useLoto doit être utilisé à l\'intérieur d\'un LotoProvider');
    }
    return context;
};

export default LotoContext;