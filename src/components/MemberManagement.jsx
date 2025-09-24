import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    UserPlus,
    Edit,
    Trash2,
    Search,
    X,
    Mail,
    Phone,
    CreditCard,
    MapPin,
    Calendar as CalendarIcon,
    Shield,
    Send
} from 'lucide-react';
import { toast } from 'sonner';
import { membersAPI } from '../lib/membersAPI';
import { formatDateToFrench, formatDateToISO } from '../utils/dateUtils';
import { generateAvatar } from '../utils/avatarUtils';
import { apiCall } from '../lib/api';

const MemberManagement = ({ onClose }) => {
    // États pour la gestion des membres
    const [members, setMembers] = useState([]);
    const [memberTypes, setMemberTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberModalMode, setMemberModalMode] = useState("add");
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [selectedMemberType, setSelectedMemberType] = useState("");
    const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [selectedMemberImageFile, setSelectedMemberImageFile] = useState(null);
    const [memberImagePreview, setMemberImagePreview] = useState(null);
    const [resendLoading, setResendLoading] = useState(false);

    const [memberFormData, setMemberFormData] = useState({
        nom: "",
        prenom: "",
        adresse: "",
        telephone: "",
        email: "",
        numeroLicence: "",
        dateEntree: "",
        dateNaissance: "",
        typeMembreId: "",
        photo: "",
    });

    // Charger les données initiales
    useEffect(() => {
        loadMembers();
        loadMemberTypes();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const result = await apiCall('/api/members');
            setMembers(result.data || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des membres:", error);
            toast.error("Erreur lors de la récupération des membres");
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMemberTypes = async () => {
        try {
            const result = await apiCall('/api/members/types');
            setMemberTypes(result.data || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des types de membres:", error);
            toast.error("Erreur lors de la récupération des types de membres");
            setMemberTypes([]);
        }
    };

    // Filtrer les membres
    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            member.nom?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.prenom?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(memberSearchTerm.toLowerCase());

        const matchesType =
            selectedMemberType === "" ||
            member.type_membre_id?.toString() === selectedMemberType;

        return matchesSearch && matchesType;
    });

    const handleAddMember = () => {
        setMemberModalMode("add");
        setSelectedMember(null);
        setMemberFormData({
            nom: "",
            prenom: "",
            adresse: "",
            telephone: "",
            email: "",
            numeroLicence: "",
            dateEntree: "",
            dateNaissance: "",
            typeMembreId: "",
            photo: "",
        });
        setSelectedMemberImageFile(null);
        setMemberImagePreview(null);
        setShowMemberModal(true);
    };

    const handleMemberImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation du type de fichier
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
                e.target.value = '';
                return;
            }
            
            // Validation de la taille (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('La taille du fichier ne doit pas dépasser 5MB.');
                e.target.value = '';
                return;
            }
            
            setSelectedMemberImageFile(file);
            
            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onload = (e) => {
                setMemberImagePreview(e.target.result);
            };
            reader.onerror = () => {
                toast.error('Erreur lors de la lecture du fichier.');
                setSelectedMemberImageFile(null);
                setMemberImagePreview(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditMember = (member) => {
        setMemberModalMode("edit");
        setSelectedMember(member);
        setMemberFormData({
            nom: member.nom || "",
            prenom: member.prenom || "",
            adresse: member.adresse || "",
            telephone: member.telephone || "",
            email: member.email || "",
            numeroLicence: member.numero_licence || "",
            dateEntree: member.date_entree ? formatDateToFrench(member.date_entree) : "",
            dateNaissance: member.date_naissance ? formatDateToFrench(member.date_naissance) : "",
            typeMembreId: member.type_membre_id?.toString() || "",
            photo: member.photo_url || "",
        });
        
        // Gérer l'affichage de la photo existante
        setSelectedMemberImageFile(null);
        
        if (member.photo_url && (member.photo_url.startsWith('/uploads/') || member.photo_url.startsWith('uploads/'))) {
            setMemberImagePreview(`${import.meta.env.VITE_API_URL}/api/members/photos/${member.photo_url.split('/').pop()}`);
        } else {
            setMemberImagePreview(null);
        }
        
        setShowMemberModal(true);
    };

    const handleDeleteMember = (member) => {
        setMemberToDelete(member);
        setShowMemberDeleteConfirm(true);
    };

    const confirmDeleteMember = async () => {
        try {
            await membersAPI.delete(memberToDelete.id);
            toast.success("Membre supprimé avec succès");
            setShowMemberDeleteConfirm(false);
            setMemberToDelete(null);
            await loadMembers();
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            toast.error("Erreur lors de la suppression du membre");
        }
    };

    // Fonction pour renvoyer l'invitation
    const resendInvitation = async (member) => {
        try {
            setResendLoading(true);
            const token = localStorage.getItem('auth_token');
            
            // Chercher la demande d'adhésion correspondante
            const data = await apiCall('/api/membership/requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const requests = data.requests || [];
            const memberRequest = requests.find(req => 
                req.email === member.email && req.statut === 'approuvee'
            );

            if (!memberRequest) {
                toast.error('Aucune demande d\'adhésion approuvée trouvée pour ce membre');
                return;
            }

            // Renvoyer l'invitation
            await apiCall(`/api/membership/resend-invitation/${memberRequest.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Email d\'invitation renvoyé avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du renvoi de l\'invitation');
        } finally {
            setResendLoading(false);
        }
    };

    const handleMemberSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append("nom", memberFormData.nom);
            formData.append("prenom", memberFormData.prenom);
            formData.append("adresse", memberFormData.adresse);
            formData.append("telephone", memberFormData.telephone);
            formData.append("email", memberFormData.email);
            formData.append("numero_licence", memberFormData.numeroLicence);
            formData.append("date_entree", memberFormData.dateEntree ? formatDateToISO(memberFormData.dateEntree) : "");
            formData.append("date_naissance", memberFormData.dateNaissance ? formatDateToISO(memberFormData.dateNaissance) : "");
            formData.append("type_membre_id", memberFormData.typeMembreId);

            // Ajouter la photo si elle existe
            if (selectedMemberImageFile) {
                // Validation finale avant upload
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(selectedMemberImageFile.type)) {
                    toast.error('Type de fichier non supporté pour la photo.');
                    return;
                }

                const maxSize = 5 * 1024 * 1024; // 5MB
                if (selectedMemberImageFile.size > maxSize) {
                    toast.error('La photo est trop volumineuse (max 5MB).');
                    return;
                }

                formData.append('photo', selectedMemberImageFile);
            }

            if (memberModalMode === "add") {
                await membersAPI.create(formData);
                toast.success("Membre ajouté avec succès");
            } else {
                await membersAPI.update(selectedMember.id, formData);
                toast.success("Membre modifié avec succès");
            }

            setShowMemberModal(false);
            setSelectedMemberImageFile(null);
            setMemberImagePreview(null);
            await loadMembers();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du membre:", error);
            toast.error("Erreur lors de la sauvegarde du membre");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-lg">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border">
                            <Users className="w-6 h-6 text-[var(--primary-color)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestion des Membres</h2>
                            <p className="text-gray-600">Gérez les membres du club</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    )}
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleAddMember}
                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Ajouter un membre</span>
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={memberSearchTerm}
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                </div>
                <select
                    value={selectedMemberType}
                    onChange={(e) => setSelectedMemberType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                    <option value="">Tous les types</option>
                    {memberTypes.map((type) => (
                        <option key={type.id} value={type.id.toString()}>
                            {type.nom}
                        </option>
                    ))}
                </select>
            </div>

            {/* Liste des membres */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Membre
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Licence
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => {
                                const memberType = memberTypes.find(
                                    (type) => type.id === member.type_membre_id
                                );
                                return (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10">
                                                    {member.photo_url && member.photo_url.trim() !== '' ? (
                                                        <img
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            src={`http://localhost:3002/${member.photo_url}`}
                                                            alt={`${member.prenom} ${member.nom}`}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                                                        style={{ 
                                                            display: member.photo_url && member.photo_url.trim() !== '' ? 'none' : 'flex',
                                                            backgroundColor: generateAvatar(member.prenom, member.nom).backgroundColor 
                                                        }}
                                                    >
                                                        {generateAvatar(member.prenom, member.nom).initials}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {member.prenom} {member.nom}
                                                        </div>
                                                        {!member.has_user_account && (
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                                                                Compte non créé
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {member.date_naissance
                                                            ? new Date(member.date_naissance).toLocaleDateString('fr-FR')
                                                            : 'Date non renseignée'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {member.email || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {member.telephone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                                {memberType ? memberType.nom : 'Non défini'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {member.numero_licence || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <div className="flex justify-end items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditMember(member)}
                                                    className="p-1 text-indigo-600 rounded transition-colors hover:text-indigo-900"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => resendInvitation(member)}
                                                    disabled={resendLoading || member.has_user_account}
                                                    className="p-1 text-blue-600 rounded transition-colors hover:text-blue-900 disabled:opacity-50"
                                                    title={member.has_user_account ? "Le membre a déjà un compte" : "Renvoyer l'invitation"}
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member)}
                                                    className="p-1 text-red-600 rounded transition-colors hover:text-red-900"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredMembers.length === 0 && (
                    <div className="py-12 text-center">
                        <Users className="mx-auto w-12 h-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Aucun membre trouvé
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {memberSearchTerm || selectedMemberType
                                ? "Aucun membre ne correspond aux critères de recherche."
                                : "Commencez par ajouter un nouveau membre."}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal d'ajout/modification de membre */}
            {showMemberModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleMemberSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {memberModalMode === "add" ? "Ajouter un membre" : "Modifier le membre"}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowMemberModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={memberFormData.nom}
                                        onChange={(e) => setMemberFormData({...memberFormData, nom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={memberFormData.prenom}
                                        onChange={(e) => setMemberFormData({...memberFormData, prenom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={memberFormData.email}
                                        onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={memberFormData.telephone}
                                        onChange={(e) => setMemberFormData({...memberFormData, telephone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de membre *
                                    </label>
                                    <select
                                        required
                                        value={memberFormData.typeMembreId}
                                        onChange={(e) => setMemberFormData({...memberFormData, typeMembreId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    >
                                        <option value="">Sélectionner un type</option>
                                        {memberTypes.map((type) => (
                                            <option key={type.id} value={type.id.toString()}>
                                                {type.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <CreditCard className="w-4 h-4 inline mr-1" />
                                        Numéro de licence
                                    </label>
                                    <input
                                        type="text"
                                        value={memberFormData.numeroLicence}
                                        onChange={(e) => setMemberFormData({...memberFormData, numeroLicence: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Ex: 123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                        Date de naissance
                                    </label>
                                    <input
                                        type="date"
                                        value={memberFormData.dateNaissance}
                                        onChange={(e) => setMemberFormData({...memberFormData, dateNaissance: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                        Date d'entrée
                                    </label>
                                    <input
                                        type="date"
                                        value={memberFormData.dateEntree}
                                        onChange={(e) => setMemberFormData({...memberFormData, dateEntree: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Adresse
                                    </label>
                                    <textarea
                                        value={memberFormData.adresse}
                                        onChange={(e) => setMemberFormData({...memberFormData, adresse: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        rows="2"
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Photo
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMemberImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                    <div className="mt-2">
                                        {memberImagePreview ? (
                                            <img
                                                src={memberImagePreview}
                                                alt="Aperçu"
                                                className="w-20 h-20 object-cover rounded-full border-2 border-gray-300"
                                            />
                                        ) : (
                                            <div 
                                                className="flex justify-center items-center w-20 h-20 text-lg font-semibold text-white rounded-full border-2 border-gray-300"
                                                style={{ backgroundColor: generateAvatar(memberFormData.prenom, memberFormData.nom).backgroundColor }}
                                            >
                                                {generateAvatar(memberFormData.prenom, memberFormData.nom).initials}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowMemberModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                                >
                                    {memberModalMode === "add" ? "Ajouter" : "Modifier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {showMemberDeleteConfirm && (
                <div className="flex fixed inset-0 z-[70] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="p-6 w-full max-w-lg bg-white rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Confirmer la suppression
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Êtes-vous sûr de vouloir supprimer le membre{" "}
                            <strong>
                                {memberToDelete?.nom} {memberToDelete?.prenom}
                            </strong>{" "}?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowMemberDeleteConfirm(false);
                                    setMemberToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDeleteMember}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
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

export default MemberManagement;