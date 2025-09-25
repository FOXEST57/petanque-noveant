import React, { useState, useEffect } from 'react';
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Mail,
    Phone,
    Calendar,
    User,
    MessageSquare,
    Search,
    Filter,
    Eye,
    Check,
    X,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiCall } from '../utils/apiCall.js';

const MembershipRequestManagement = ({ onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Charger les demandes d'adhésion (seulement celles en attente et rejetées)
    const loadRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            
            const data = await apiCall('/membership/requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const requests = data.requests || [];
            // Filtrer pour ne montrer que les demandes en attente et rejetées
            const filteredRequests = requests.filter(request => 
                request.statut === 'en_attente' || request.statut === 'rejetee'
            );
            setRequests(filteredRequests);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.message && error.message.includes('403')) {
                // L'utilisateur n'a pas les permissions pour voir les demandes d'adhésion
                console.log('Utilisateur sans permissions pour voir les demandes d\'adhésion');
                setRequests([]);
                toast.error('Vous n\'avez pas les permissions pour voir les demandes d\'adhésion');
            } else {
                toast.error('Erreur lors du chargement des demandes');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Filtrer les demandes
    const filteredRequests = requests.filter(request => {
        const matchesSearch = 
            request.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || request.statut === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Fonction pour approuver une demande
    const approveRequest = async (requestId) => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('auth_token');
            
            await apiCall(`/membership/approve/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Demande approuvée avec succès');
            loadRequests(); // Recharger la liste
            setSelectedRequest(null); // Fermer la modal
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'approbation');
        } finally {
            setActionLoading(false);
        }
    };
    const rejectRequest = async (requestId, reason = '') => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('auth_token');
            
            await apiCall(`/membership/reject/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    reason: reason,
                    sendNotification: true 
                })
            });

            toast.success('Demande rejetée');
            loadRequests();
            setShowModal(false);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Formater la date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtenir le badge de statut
    const getStatusBadge = (status) => {
        switch (status) {
            case 'en_attente':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                    </span>
                );
            case 'approuvee':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approuvée
                    </span>
                );
            case 'rejetee':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejetée
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-[var(--primary-color)]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Demandes d'adhésion
                        </h2>
                        <p className="text-sm text-gray-600">
                            Gérez les demandes d'adhésion au club
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent appearance-none"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="approuvee">Approuvées</option>
                        <option value="rejetee">Rejetées</option>
                    </select>
                </div>
            </div>

            {/* Liste des demandes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucune demande d'adhésion trouvée</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Candidat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white font-medium">
                                                        {request.prenom.charAt(0)}{request.nom.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.prenom} {request.nom}
                                                    </div>
                                                    {request.surnom && (
                                                        <div className="text-sm text-gray-500">
                                                            "{request.surnom}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center mb-1">
                                                    <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                                    {request.email}
                                                </div>
                                                <div className="flex items-center">
                                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                    {request.telephone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(request.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(request.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {request.statut === 'en_attente' && (
                                                    <>
                                                        <button
                                                            onClick={() => approveRequest(request.id)}
                                                            disabled={actionLoading}
                                                            className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => rejectRequest(request.id)}
                                                            disabled={actionLoading}
                                                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de détails */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Détails de la demande
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Informations personnelles */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Informations personnelles
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nom
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.nom}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prénom
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.prenom}</p>
                                    </div>
                                    {selectedRequest.surnom && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Surnom
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">"{selectedRequest.surnom}"</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Téléphone
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.telephone}</p>
                                    </div>
                                    {selectedRequest.numero_licence && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Numéro de licence
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedRequest.numero_licence}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            {selectedRequest.message && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        Message du candidat
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">{selectedRequest.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Informations de la demande */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                    Informations de la demande
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date de demande
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedRequest.statut)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedRequest.statut === 'en_attente' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => approveRequest(selectedRequest.id)}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4 inline mr-2" />
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => rejectRequest(selectedRequest.id)}
                                        disabled={actionLoading}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4 inline mr-2" />
                                        Rejeter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipRequestManagement;