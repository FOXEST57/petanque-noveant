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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { apiCall } from "../utils/apiCall.js";
import MemberAutocomplete from '../components/MemberAutocomplete';

const Caisse = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
            navigate('/login');
            return;
        }
        
        if (user.role !== 'admin' && user.role !== 'bureau') {
            navigate('/');
            return;
        }

        loadFondCaisse();
        setLoading(false);
    }, [user, navigate]);

    const loadFondCaisse = async () => {
        try {
            const response = await apiCall('/api/caisse/fond');
            if (response.ok) {
                const data = await response.json();
                setFondCaisse(data.fond || 0);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du fond de caisse');
        }
    };

    const loadHistorique = async () => {
        try {
            const response = await apiCall('/api/caisse/historique');
            if (response.ok) {
                const data = await response.json();
                setHistorique(data.historique || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement de l\'historique');
        }
    };

    const handleCreditMember = async () => {
        if (!selectedMember || !creditAmount) {
            alert('Veuillez sélectionner un membre et saisir un montant');
            return;
        }

        try {
            const response = await apiCall('/api/caisse/crediter-membre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    membreId: selectedMember.id,
                    montant: parseFloat(creditAmount)
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                setCreditAmount('');
                setSelectedMember(null);
                loadFondCaisse();
                loadHistorique();
            } else {
                const error = await response.json();
                alert(error.error || 'Erreur lors du crédit');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du crédit du membre');
        }
    };

    const handleTransfert = async (type) => {
        if (!transferAmount || parseFloat(transferAmount) <= 0) {
            alert('Veuillez saisir un montant valide');
            return;
        }

        try {
            setLoading(true);
            await apiCall('/caisse/transfert-bancaire', {
                method: 'POST',
                body: {
                    montant: parseFloat(transferAmount),
                    type: type // 'caisse-vers-banque' ou 'banque-vers-caisse'
                }
            });

            const message = type === 'caisse-vers-banque' 
                ? 'Transfert de la caisse vers le compte bancaire du club effectué !'
                : 'Transfert du compte bancaire vers la caisse effectué !';
            
            alert(message);
            setTransferAmount('');
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
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de la caisse...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestion de la Caisse
                    </h1>
                    <p className="text-gray-600">
                        Gérez les encaissements et les comptes membres
                    </p>
                </div>

                {/* Fond de caisse - Vue d'ensemble */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Wallet className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Fond de Caisse
                                </h2>
                                <p className="text-3xl font-bold text-green-600">
                                    {fondCaisse.toFixed(2)} €
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                                    onMemberSelect={setSelectedMember}
                                    placeholder="Rechercher par prénom, nom ou pseudo..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Montant à créditer (€)
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
                                onClick={handleCreditMember}
                                disabled={!selectedMember || !creditAmount}
                                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                                    onMemberSelect={setSelectedMember}
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
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                                    id="montant-ajouter"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Montant à ajouter"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const montantInput = document.getElementById('montant-ajouter');
                                    handleGestionFondCaisse('ajouter', montantInput.value);
                                    montantInput.value = '';
                                }}
                                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter au Fond
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
                                    id="montant-retirer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Montant à retirer"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const montantInput = document.getElementById('montant-retirer');
                                    handleGestionFondCaisse('retirer', montantInput.value);
                                    montantInput.value = '';
                                }}
                                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Minus className="h-4 w-4 mr-2" />
                                Retirer du Fond
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Historique */}
                {showHistorique && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Historique des Opérations
                                </h3>
                                <button
                                    onClick={() => setShowHistorique(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {historique.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        Aucune opération enregistrée
                                    </p>
                                ) : (
                                    historique.map((operation, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                {operation.type === 'credit' && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                                                {operation.type === 'transfert' && <ArrowRightLeft className="h-5 w-5 text-purple-600 mr-2" />}
                                                {operation.type === 'fond' && <Wallet className="h-5 w-5 text-blue-600 mr-2" />}
                                                <div>
                                                    <p className="font-medium">{operation.description}</p>
                                                    <p className="text-sm text-gray-500">{operation.date}</p>
                                                </div>
                                            </div>
                                            <span className={`font-semibold ${operation.montant > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {operation.montant > 0 ? '+' : ''}{operation.montant.toFixed(2)} €
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Caisse;