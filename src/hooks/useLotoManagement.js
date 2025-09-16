import { useState } from 'react';

/**
 * Hook personnalisé pour la gestion des lotos
 * Sépare la logique et les états des lotos du composant Admin principal
 */
export const useLotoManagement = () => {
    // États pour la gestion des lotos
    const [showLotoModal, setShowLotoModal] = useState(false);
    const [lotoModalMode, setLotoModalMode] = useState('add');
    const [selectedLoto, setSelectedLoto] = useState(null);
    const [lotos, setLotos] = useState([]);
    const [lotoToDelete, setLotoToDelete] = useState(null);
    const [showLotoDeleteConfirm, setShowLotoDeleteConfirm] = useState(false);
    const [lotoSearchTerm, setLotoSearchTerm] = useState('');
    const [lotoFormData, setLotoFormData] = useState({
        nom: '',
        date: '',
        description: '',
        prixCarton: '',
        lotsAGagner: '',
        statut: 'planifie'
    });

    // Variables calculées pour le filtrage
    const filteredLotos = lotos.filter(l => 
        l.nom.toLowerCase().includes(lotoSearchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(lotoSearchTerm.toLowerCase())
    );

    // Fonctions de gestion des lotos
    const handleAddLoto = () => {
        setLotoModalMode('add');
        setSelectedLoto(null);
        setLotoFormData({
            nom: '',
            date: '',
            description: '',
            prixCarton: '',
            lotsAGagner: '',
            statut: 'planifie'
        });
        setShowLotoModal(true);
    };

    const handleEditLoto = (loto) => {
        setLotoModalMode('edit');
        setSelectedLoto(loto);
        setLotoFormData({
            nom: loto.nom,
            date: loto.date,
            description: loto.description,
            prixCarton: loto.prixCarton.toString(),
            lotsAGagner: loto.lotsAGagner,
            statut: loto.statut
        });
        setShowLotoModal(true);
    };

    const handleDeleteLoto = (loto) => {
        setLotoToDelete(loto);
        setShowLotoDeleteConfirm(true);
    };

    const confirmDeleteLoto = () => {
        if (lotoToDelete) {
            setLotos(prev => prev.filter(l => l.id !== lotoToDelete.id));
            setLotoToDelete(null);
            setShowLotoDeleteConfirm(false);
        }
    };

    const handleSaveLoto = (formData) => {
        if (lotoModalMode === 'add') {
            const newLoto = {
                id: Date.now(),
                ...formData,
                prixCarton: parseFloat(formData.prixCarton)
            };
            setLotos(prev => [...prev, newLoto]);
        } else {
            setLotos(prev => prev.map(l => 
                l.id === selectedLoto.id 
                    ? { ...l, ...formData, prixCarton: parseFloat(formData.prixCarton) }
                    : l
            ));
        }
        setShowLotoModal(false);
    };

    const resetLotoForm = () => {
        setLotoFormData({
            nom: '',
            date: '',
            description: '',
            prixCarton: '',
            lotsAGagner: '',
            statut: 'planifie'
        });
    };

    // Retourner tous les états et fonctions nécessaires
    return {
        // États
        showLotoModal,
        setShowLotoModal,
        lotoModalMode,
        setLotoModalMode,
        selectedLoto,
        setSelectedLoto,
        lotos,
        setLotos,
        lotoToDelete,
        setLotoToDelete,
        showLotoDeleteConfirm,
        setShowLotoDeleteConfirm,
        lotoSearchTerm,
        setLotoSearchTerm,
        lotoFormData,
        setLotoFormData,
        
        // Variables calculées
        filteredLotos,
        
        // Fonctions
        handleAddLoto,
        handleEditLoto,
        handleDeleteLoto,
        confirmDeleteLoto,
        handleSaveLoto,
        resetLotoForm
    };
};

export default useLotoManagement;