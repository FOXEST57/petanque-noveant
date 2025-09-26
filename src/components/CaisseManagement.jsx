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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { apiCall } from "../utils/apiCall.js";
import MemberAutocomplete from './MemberAutocomplete';

const CaisseManagement = ({ onClose }) => {
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [fondCaisse, setFondCaisse] = useState(0);
    const [typeOperation, setTypeOperation] = useState("");
    const [historique, setHistorique] = useState([]);
    const [showHistorique, setShowHistorique] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferType, setTransferType] = useState('caisse_vers_membre');
    const [caisseAmount, setCaisseAmount] = useState('');
    const [caisseOperation, setCaisseOperation] = useState('ajouter');

    useEffect(() => {
        if (!user) {
            onClose();
            return;
        }
        
        if (user.role !== 'admin' && user.role !== 'bureau' && user.role !== 'president') {
            onClose();
            return;
        }

        loadFondCaisse();
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
                alert(data.message);
                setCreditAmount('');
                setSelectedMember(null);
                loadFondCaisse();
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
        if (!selectedMember || !transferAmount || parseFloat(transferAmount) <= 0) {
            alert('Veuillez sélectionner un membre et saisir un montant valide');
            return;
        }

        try {
            setLoading(true);
            await apiCall('/caisse/transfert-bancaire', {
                method: 'POST',
                body: {
                    membreId: selectedMember.id,
                    montant: parseFloat(transferAmount),
                    type: type // 'caisse-vers-banque' ou 'banque-vers-caisse'
                }
            });

            const message = type === 'caisse-vers-banque'
                ? 'Transfert de la caisse vers le compte bancaire du club effectué !'
                : 'Transfert du compte bancaire vers la caisse effectué !';
            
            alert(message);
            setTransferAmount('');
            setSelectedMember(null);
            loadFondCaisse();
            loadHistorique();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du transfert');
        } finally {
            setLoading(false);
        }
    };

    const handleGestionFondCaisse = async (operation, montantFond) => {
        if (!montantFond || parseFloat(montantFond) <= 0) {
            alert('Veuillez saisir un montant valide');
            return;
        }

        try {
            setLoading(true);
            await apiCall('/caisse/fond', {
                method: 'PUT',
                body: {
                    operation: operation, // 'ajouter' ou 'retirer'
                    montant: parseFloat(montantFond)
                }
            });

            const message = operation === 'ajouter' 
                ? 'Montant ajouté au fond de caisse !'
                : 'Montant retiré du fond de caisse !';
            
            alert(message);
            loadFondCaisse();
            loadHistorique();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la gestion du fond de caisse');
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

            {/* Fond de caisse - Vue d'ensemble */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Wallet className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Fond de Caisse
                            </h2>
                            <p className="text-2xl font-bold text-green-600">
                                {typeof fondCaisse === 'number' ? fondCaisse.toFixed(2) : '0.00'} €
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
                                placeholder="Rechercher par prénom, nom ou pseudo..."
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

                {/* Carte 2: Transferts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <ArrowRightLeft className="h-6 w-6 text-purple-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Transferts
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
                                placeholder="Rechercher par prénom, nom ou pseudo..."
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
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0.00"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => handleTransfert('caisse-vers-compte')}
                                disabled={!selectedMember || !transferAmount}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Caisse → Compte
                            </button>
                            <button
                                onClick={() => handleTransfert('compte-vers-caisse')}
                                disabled={!selectedMember || !transferAmount}
                                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <TrendingDown className="h-4 w-4 mr-2" />
                                Compte → Caisse
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carte 3: Gestion du fond de caisse */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                    <Euro className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Gestion du Fond de Caisse
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ajouter au fond */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Ajouter au fond</h4>
                        <div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Montant à ajouter"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleGestionFondCaisse('ajouter', e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                const montantInput = e.target.parentElement.querySelector('input');
                                handleGestionFondCaisse('ajouter', montantInput.value);
                                montantInput.value = '';
                            }}
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </button>
                    </div>

                    {/* Retirer du fond */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Retirer du fond</h4>
                        <div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Montant à retirer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleGestionFondCaisse('retirer', e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                const montantInput = e.target.parentElement.querySelector('input');
                                handleGestionFondCaisse('retirer', montantInput.value);
                                montantInput.value = '';
                            }}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Minus className="h-4 w-4 mr-2" />
                            Retirer
                        </button>
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
                                        Montant
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {historique.map((operation, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(operation.date_operation).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {operation.type_operation}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {operation.description}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                            operation.montant >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {operation.montant >= 0 ? '+' : ''}{operation.montant.toFixed(2)} €
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