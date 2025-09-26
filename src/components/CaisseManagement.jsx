import {
    CreditCard,
    ArrowRightLeft,
    Wallet,
    Users,
    Plus,
    Minus,
    Search,
    Euro,
    TrendingUp,
    TrendingDown,
    History,
    CheckCircle,
    AlertCircle,
    X,
    Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { apiCall } from "../utils/apiCall.js";
import MemberAutocomplete from './MemberAutocomplete';
import { banqueAPI } from '../api/banque.js';

const CaisseManagement = ({ onClose }) => {
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [fondCaisse, setFondCaisse] = useState(0);
    const [soldeCaisse, setSoldeCaisse] = useState(0);
    const [recettes, setRecettes] = useState(0);
    const [typeOperation, setTypeOperation] = useState("");
    const [historique, setHistorique] = useState([]);
    const [showHistorique, setShowHistorique] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedBanque, setSelectedBanque] = useState(null);
    const [banques, setBanques] = useState([]);
    const [creditAmount, setCreditAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferType, setTransferType] = useState('caisse_vers_membre');
    const [depenseDescription, setDepenseDescription] = useState('');
    const [depenseAmount, setDepenseAmount] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        if (!user) {
            onClose();
            return;
        }
        
        if (user.role !== 'admin' && user.role !== 'bureau' && user.role !== 'president') {
            onClose();
            return;
        }

        loadSoldeCaisse();
        loadBanques();
        setLoading(false);
    }, [user, onClose]);

    const loadFondCaisse = async () => {
        try {
            const data = await apiCall('/api/caisse/fond');
            const fondValue = parseFloat(data.fond) || 0;
            setFondCaisse(fondValue);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du fond de caisse');
            setFondCaisse(0); // Valeur par défaut en cas d'erreur
        }
    };

    const loadSoldeCaisse = async () => {
        try {
            const data = await apiCall('/api/caisse/solde');
            if (data.success) {
                setFondCaisse(parseFloat(data.fondCaisse) || 0);
                setSoldeCaisse(parseFloat(data.soldeCaisse) || 0);
                setRecettes(parseFloat(data.recettes) || 0);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du solde de caisse');
            setSoldeCaisse(0);
            setRecettes(0);
        }
    };

    const loadBanques = async () => {
        try {
            const data = await banqueAPI.getBanques();
            setBanques(data);
            // Sélectionner automatiquement la banque principale
            const banquePrincipale = data.find(b => b.nom === 'Banque Principale');
            if (banquePrincipale) {
                setSelectedBanque(banquePrincipale);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des banques:', error);
            setBanques([]);
        }
    };

    const loadHistorique = async () => {
        try {
            const data = await apiCall('/api/caisse/historique');
            setHistorique(data.historique || []);
            setShowHistorique(true);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement de l\'historique');
        }
    };

    const handleCrediterMembre = async () => {
        if (!selectedMember || !creditAmount || parseFloat(creditAmount) <= 0) {
            alert('Veuillez sélectionner un membre et saisir un montant valide');
            return;
        }

        try {
            setLoading(true);
            const data = await apiCall('/api/caisse/crediter-membre', {
                method: 'POST',
                body: {
                    membreId: selectedMember.id,
                    montant: parseFloat(creditAmount)
                }
            });

            if (data.success) {
                setSuccessMessage(data.message);
                setShowSuccessMessage(true);
                // Masquer le message après 5 secondes
                setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 5000);
                setCreditAmount('');
                setSelectedMember(null);
                loadSoldeCaisse();
                loadHistorique();
            } else {
                alert(data.error || 'Erreur lors du crédit');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du crédit du compte membre');
        } finally {
            setLoading(false);
        }
    };

    const handleTransfert = async (type) => {
        if (!selectedBanque || !transferAmount || parseFloat(transferAmount) <= 0) {
            alert('Veuillez sélectionner une banque et saisir un montant valide');
            return;
        }

        try {
            setLoading(true);
            await apiCall('/api/caisse/transfert-bancaire', {
                method: 'POST',
                body: {
                    banqueId: selectedBanque.id,
                    montant: parseFloat(transferAmount),
                    type: type // 'caisse-vers-banque' ou 'banque-vers-caisse'
                }
            });

            const message = type === 'caisse-vers-banque'
                ? `Transfert de la caisse vers ${selectedBanque.nom} effectué !`
                : `Transfert de ${selectedBanque.nom} vers la caisse effectué !`;
            
            setSuccessMessage(message);
            setShowSuccessMessage(true);
            // Masquer le message après 5 secondes
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            setTransferAmount('');
            loadSoldeCaisse();
            loadHistorique();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du transfert');
        } finally {
            setLoading(false);
        }
    };

    const handleDepenseEspeces = async () => {
        if (!depenseAmount || parseFloat(depenseAmount) <= 0) {
            alert('Veuillez saisir un montant valide');
            return;
        }

        if (!depenseDescription.trim()) {
            alert('Veuillez saisir une description pour la dépense');
            return;
        }

        try {
            setLoading(true);
            const data = await apiCall('/api/caisse/depense-especes', {
                method: 'POST',
                body: {
                    montant: parseFloat(depenseAmount),
                    description: depenseDescription.trim()
                }
            });

            if (data.success) {
                alert('Dépense en espèces enregistrée avec succès !');
                setDepenseAmount('');
                setDepenseDescription('');
                loadSoldeCaisse();
                loadHistorique();
            } else {
                alert(data.error || 'Erreur lors de l\'enregistrement de la dépense');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'enregistrement de la dépense en espèces');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de la caisse...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Message de succès */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{successMessage}</span>
                    <button
                        onClick={() => setShowSuccessMessage(false)}
                        className="ml-2 text-white hover:text-gray-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* En-tête avec bouton fermer */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Gestion de la Caisse
                    </h1>
                    <p className="text-gray-600">
                        Gérez les encaissements et les comptes membres
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Vue d'ensemble de la caisse */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Wallet className="h-8 w-8 text-green-600 mr-3" />
                        
                        {/* Fond de caisse */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Fond de Caisse
                            </h3>
                            <p className="text-xl font-bold text-blue-600">
                                {typeof fondCaisse === 'number' ? fondCaisse.toFixed(2) : '0.00'} €
                            </p>
                        </div>
                        
                        {/* Solde de caisse */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Solde de Caisse
                            </h3>
                            <p className="text-xl font-bold text-green-600">
                                {typeof soldeCaisse === 'number' ? soldeCaisse.toFixed(2) : '0.00'} €
                            </p>
                        </div>
                        
                        {/* Recettes */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Recettes
                            </h3>
                            <p className={`text-xl font-bold ${recettes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {typeof recettes === 'number' ? (recettes >= 0 ? '+' : '') + recettes.toFixed(2) : '0.00'} €
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadHistorique}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <History className="h-4 w-4 mr-2" />
                        Historique
                    </button>
                </div>
            </div>

            {/* Grille des cartes principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Carte 1: Créditer un compte membre */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Créditer un Compte Membre
                        </h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sélectionner un membre
                            </label>
                            <MemberAutocomplete
                                selectedMember={selectedMember}
                                onSelect={setSelectedMember}
                                placeholder="Rechercher par prénom, nom ou surnom..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        
                        <button
                            onClick={handleCrediterMembre}
                            disabled={!selectedMember || !creditAmount}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Créditer le Compte
                        </button>
                    </div>
                </div>

                {/* Carte 2: Dépenses en Espèces */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <Minus className="h-6 w-6 text-red-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Dépenses en Espèces
                        </h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description de la dépense
                            </label>
                            <input
                                type="text"
                                value={depenseDescription}
                                onChange={(e) => setDepenseDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Ex: Achat matériel, frais déplacement..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={depenseAmount}
                                onChange={(e) => setDepenseAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="0.00"
                            />
                        </div>
                        
                        <button
                            onClick={handleDepenseEspeces}
                            disabled={!depenseAmount || !depenseDescription.trim()}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="h-4 w-4 mr-2" />
                            Enregistrer la Dépense
                        </button>
                    </div>
                </div>

                {/* Carte 3: Transferts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <ArrowRightLeft className="h-6 w-6 text-purple-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Transferts Bancaires
                        </h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banque par défaut
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedBanque?.id || ''}
                                    onChange={(e) => {
                                        const banque = banques.find(b => b.id === parseInt(e.target.value));
                                        setSelectedBanque(banque);
                                    }}
                                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                                >
                                    <option value="">Sélectionner une banque</option>
                                    {banques.map((banque) => (
                                        <option key={banque.id} value={banque.id}>
                                            {banque.nom}
                                        </option>
                                    ))}
                                </select>
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {selectedBanque && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                    <p><strong>Adresse:</strong> {selectedBanque.adresse}</p>
                                    <p><strong>IBAN:</strong> {selectedBanque.iban}</p>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Montant (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0.00"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => handleTransfert('caisse-vers-banque')}
                                disabled={!selectedBanque || !transferAmount}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Caisse → Banque
                            </button>
                            <button
                                onClick={() => handleTransfert('banque-vers-caisse')}
                                disabled={!selectedBanque || !transferAmount}
                                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <TrendingDown className="h-4 w-4 mr-2" />
                                Banque → Caisse
                            </button>
                        </div>
                    </div>
                </div>
            </div>



            {/* Historique */}
            {showHistorique && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Historique des Opérations
                        </h3>
                        <button
                            onClick={() => setShowHistorique(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Encaissement
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Retrait
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {historique.map((operation, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(operation.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {operation.type}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {operation.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {parseFloat(operation.montant_encaissement) > 0 ? `+${parseFloat(operation.montant_encaissement).toFixed(2)} €` : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            {parseFloat(operation.montant_retrait) > 0 ? `-${parseFloat(operation.montant_retrait).toFixed(2)} €` : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaisseManagement;