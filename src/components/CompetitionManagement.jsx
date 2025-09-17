import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Trophy, Gift, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CompetitionManagement = ({ onClose }) => {
    // États pour la gestion des concours
    const [showConcoursModal, setShowConcoursModal] = useState(false);
    const [concoursModalMode, setConcoursModalMode] = useState('add');
    const [selectedConcours, setSelectedConcours] = useState(null);
    const [concours, setConcours] = useState([]);
    const [concoursToDelete, setConcoursToDelete] = useState(null);
    const [showConcoursDeleteConfirm, setShowConcoursDeleteConfirm] = useState(false);
    const [concoursSearchTerm, setConcoursSearchTerm] = useState('');
    const [concoursFormData, setConcoursFormData] = useState({
        nom: '',
        date: '',
        description: '',
        prixInscription: '',
        prixAGagner: '',
        statut: 'planifie'
    });

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

    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState('concours');

    // Variables calculées pour le filtrage
    const filteredConcours = concours.filter(c => 
        c.nom.toLowerCase().includes(concoursSearchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(concoursSearchTerm.toLowerCase())
    );

    const filteredLotos = lotos.filter(l => 
        l.nom.toLowerCase().includes(lotoSearchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(lotoSearchTerm.toLowerCase())
    );

    // Chargement initial des données
    useEffect(() => {
        loadConcours();
        loadLotos();
    }, []);

    // Fonction pour charger les concours (données de test pour l'instant)
    const loadConcours = async () => {
        try {
            const concoursData = [
                {
                    id: 1,
                    nom: 'Concours de Printemps',
                    date: '2024-04-15',
                    description: 'Grand concours de printemps avec de nombreux prix',
                    prixInscription: 15,
                    prixAGagner: 500,
                    statut: 'planifie'
                },
                {
                    id: 2,
                    nom: 'Championnat d\'Été',
                    date: '2024-07-20',
                    description: 'Championnat estival de pétanque',
                    prixInscription: 20,
                    prixAGagner: 800,
                    statut: 'en_cours'
                }
            ];
            setConcours(concoursData);
        } catch (error) {
            console.error('Erreur lors du chargement des concours:', error);
            toast.error('Erreur lors du chargement des concours');
        }
    };

    // Fonction pour charger les lotos (données de test pour l'instant)
    const loadLotos = async () => {
        try {
            const lotosData = [
                {
                    id: 1,
                    nom: 'Loto de Printemps',
                    date: '2024-05-10',
                    description: 'Grand loto de printemps avec de nombreux lots à gagner',
                    prixCarton: 5,
                    lotsAGagner: 'Électroménager, bons d\'achat, paniers garnis',
                    statut: 'planifie'
                },
                {
                    id: 2,
                    nom: 'Loto d\'Été',
                    date: '2024-08-15',
                    description: 'Loto estival en plein air',
                    prixCarton: 3,
                    lotsAGagner: 'Vélos, parasols, glacières',
                    statut: 'termine'
                }
            ];
            setLotos(lotosData);
        } catch (error) {
            console.error('Erreur lors du chargement des lotos:', error);
            toast.error('Erreur lors du chargement des lotos');
        }
    };

    // Fonctions de gestion des concours
    const handleAddConcours = () => {
        setConcoursModalMode('add');
        setSelectedConcours(null);
        setConcoursFormData({
            nom: '',
            date: '',
            description: '',
            prixInscription: '',
            prixAGagner: '',
            statut: 'planifie'
        });
        setShowConcoursModal(true);
    };

    const handleEditConcours = (concours) => {
        setConcoursModalMode('edit');
        setSelectedConcours(concours);
        setConcoursFormData({
            nom: concours.nom,
            date: concours.date,
            description: concours.description,
            prixInscription: concours.prixInscription.toString(),
            prixAGagner: concours.prixAGagner.toString(),
            statut: concours.statut
        });
        setShowConcoursModal(true);
    };

    const handleDeleteConcours = (concours) => {
        setConcoursToDelete(concours);
        setShowConcoursDeleteConfirm(true);
    };

    const confirmDeleteConcours = () => {
        setConcours(concours.filter(c => c.id !== concoursToDelete.id));
        setShowConcoursDeleteConfirm(false);
        setConcoursToDelete(null);
        toast.success('Concours supprimé avec succès');
    };

    const handleSaveConcours = () => {
        if (!concoursFormData.nom.trim() || !concoursFormData.date) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const concoursData = {
            ...concoursFormData,
            prixInscription: parseFloat(concoursFormData.prixInscription) || 0,
            prixAGagner: parseFloat(concoursFormData.prixAGagner) || 0
        };

        if (concoursModalMode === 'add') {
            const newConcours = {
                ...concoursData,
                id: Math.max(...concours.map(c => c.id), 0) + 1
            };
            setConcours([...concours, newConcours]);
            toast.success('Concours ajouté avec succès');
        } else {
            setConcours(concours.map(c => 
                c.id === selectedConcours.id 
                    ? { ...concoursData, id: selectedConcours.id }
                    : c
            ));
            toast.success('Concours modifié avec succès');
        }

        setShowConcoursModal(false);
    };

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
        setLotos(lotos.filter(l => l.id !== lotoToDelete.id));
        setShowLotoDeleteConfirm(false);
        setLotoToDelete(null);
        toast.success('Loto supprimé avec succès');
    };

    const handleSaveLoto = () => {
        if (!lotoFormData.nom.trim() || !lotoFormData.date) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const lotoData = {
            ...lotoFormData,
            prixCarton: parseFloat(lotoFormData.prixCarton) || 0
        };

        if (lotoModalMode === 'add') {
            const newLoto = {
                ...lotoData,
                id: Math.max(...lotos.map(l => l.id), 0) + 1
            };
            setLotos([...lotos, newLoto]);
            toast.success('Loto ajouté avec succès');
        } else {
            setLotos(lotos.map(l => 
                l.id === selectedLoto.id 
                    ? { ...lotoData, id: selectedLoto.id }
                    : l
            ));
            toast.success('Loto modifié avec succès');
        }

        setShowLotoModal(false);
    };

    return (
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des Compétitions</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ×
                </button>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('concours')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'concours'
                            ? 'border-b-2 border-[#425e9b] text-[#425e9b]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Concours ({concours.length})
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('lotos')}
                    className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === 'lotos'
                            ? 'border-b-2 border-[#425e9b] text-[#425e9b]'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Lotos ({lotos.length})
                    </div>
                </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {activeTab === 'concours' && (
                    <div className="space-y-6">
                        {/* Barre de recherche et bouton d'ajout pour concours */}
                        <div className="flex flex-col gap-4 justify-between items-start mb-6 sm:flex-row sm:items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un concours..."
                                    value={concoursSearchTerm}
                                    onChange={(e) => setConcoursSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleAddConcours}
                                className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter un concours</span>
                            </button>
                        </div>

                        {/* Tableau des concours */}
                        <div className="admin-content-card">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prix inscription</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prix à gagner</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Statut</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredConcours.length > 0 ? (
                                            filteredConcours.map((concours) => (
                                                <tr key={concours.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{concours.nom}</div>
                                                        <div className="text-sm text-gray-500">{concours.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(concours.date).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {concours.prixInscription}€
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {concours.prixAGagner}€
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                            concours.statut === 'termine' ? 'bg-green-100 text-green-800' :
                                                            concours.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {concours.statut === 'termine' ? 'Terminé' :
                                                             concours.statut === 'en_cours' ? 'En cours' : 'Planifié'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditConcours(concours)}
                                                                className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteConcours(concours)}
                                                                className="text-red-600 transition-colors hover:text-red-800"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Aucun concours trouvé
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'lotos' && (
                    <div className="space-y-6">
                        {/* Barre de recherche et bouton d'ajout pour lotos */}
                        <div className="flex flex-col gap-4 justify-between items-start mb-6 sm:flex-row sm:items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un loto..."
                                    value={lotoSearchTerm}
                                    onChange={(e) => setLotoSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleAddLoto}
                                className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter un loto</span>
                            </button>
                        </div>

                        {/* Tableau des lotos */}
                        <div className="admin-content-card">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prix carton</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Lots à gagner</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Statut</th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredLotos.length > 0 ? (
                                            filteredLotos.map((loto) => (
                                                <tr key={loto.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{loto.nom}</div>
                                                        <div className="text-sm text-gray-500">{loto.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(loto.date).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                        {loto.prixCarton}€
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap max-w-xs truncate">
                                                        {loto.lotsAGagner}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                            loto.statut === 'termine' ? 'bg-green-100 text-green-800' :
                                                            loto.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {loto.statut === 'termine' ? 'Terminé' :
                                                             loto.statut === 'en_cours' ? 'En cours' : 'Planifié'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditLoto(loto)}
                                                                className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLoto(loto)}
                                                                className="text-red-600 transition-colors hover:text-red-800"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    Aucun loto trouvé
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Ajouter/Modifier Concours */}
            {showConcoursModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {concoursModalMode === 'add' ? 'Ajouter un concours' : 'Modifier le concours'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du concours *
                                    </label>
                                    <input
                                        type="text"
                                        value={concoursFormData.nom}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            nom: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Nom du concours"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date du concours *
                                    </label>
                                    <input
                                        type="date"
                                        value={concoursFormData.date}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            date: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={concoursFormData.statut}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            statut: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    >
                                        <option value="planifie">Planifié</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix d'inscription (€)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={concoursFormData.prixInscription}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            prixInscription: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix à gagner (€)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={concoursFormData.prixAGagner}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            prixAGagner: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={concoursFormData.description}
                                        onChange={(e) => setConcoursFormData({
                                            ...concoursFormData,
                                            description: e.target.value
                                        })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Description du concours, règles, conditions..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowConcoursModal(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveConcours}
                                    className="px-4 py-2 bg-[#425e9b] text-white rounded-lg hover:bg-[#364a82] transition-colors"
                                >
                                    {concoursModalMode === 'add' ? 'Ajouter' : 'Modifier'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajouter/Modifier Loto */}
            {showLotoModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {lotoModalMode === 'add' ? 'Ajouter un loto' : 'Modifier le loto'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du loto *
                                    </label>
                                    <input
                                        type="text"
                                        value={lotoFormData.nom}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            nom: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Nom du loto"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date du loto *
                                    </label>
                                    <input
                                        type="date"
                                        value={lotoFormData.date}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            date: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={lotoFormData.statut}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            statut: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    >
                                        <option value="planifie">Planifié</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix du carton (€)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={lotoFormData.prixCarton}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            prixCarton: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lots à gagner
                                    </label>
                                    <textarea
                                        value={lotoFormData.lotsAGagner}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            lotsAGagner: e.target.value
                                        })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Liste des lots à gagner..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={lotoFormData.description}
                                        onChange={(e) => setLotoFormData({
                                            ...lotoFormData,
                                            description: e.target.value
                                        })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Description du loto..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowLotoModal(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveLoto}
                                    className="px-4 py-2 bg-[#425e9b] text-white rounded-lg hover:bg-[#364a82] transition-colors"
                                >
                                    {lotoModalMode === 'add' ? 'Ajouter' : 'Modifier'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression concours */}
            {showConcoursDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer le concours "{concoursToDelete?.nom}" ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConcoursDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDeleteConcours}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression loto */}
            {showLotoDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer le loto "{lotoToDelete?.nom}" ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLotoDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDeleteLoto}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitionManagement;