import {
    Edit,
    Plus,
    Save,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { teamsAPI } from "../api/teams.js";
import { membersAPI } from "../lib/membersAPI";

const TeamManagement = ({ onStatsUpdate, onClose }) => {
    // États pour la gestion des équipes
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamModalMode, setTeamModalMode] = useState("add");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [showTeamDeleteConfirm, setShowTeamDeleteConfirm] = useState(false);
    const [teamSearchTerm, setTeamSearchTerm] = useState("");
    const [selectedTeamCategory, setSelectedTeamCategory] = useState("");
    const [teamFormData, setTeamFormData] = useState({
        name: "",
        category: "",
        description: "",
        photo_url: "",
        teamPhoto: null,
        competition: "",
        teamMembers: [],
    });

    // États pour la recherche de membres
    const [members, setMembers] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Charger les données au montage du composant
    useEffect(() => {
        loadTeams();
        loadMembers();
    }, []);

    // Charger les équipes
    const loadTeams = async () => {
        try {
            const response = await teamsAPI.getAll();
            // L'API retourne { success: true, data: teams }
            const teamsData = response?.data || [];
            setTeams(teamsData);
        } catch (error) {
            console.error("Erreur lors du chargement des équipes:", error);
            toast.error("Erreur lors du chargement des équipes");
            setTeams([]); // S'assurer que teams est toujours un tableau
        }
    };

    // Charger les membres
    const loadMembers = async () => {
        try {
            const membersData = await membersAPI.getAll();
            console.log("🔍 Données reçues de l'API members:", membersData);
            console.log("🔍 Type de membersData:", typeof membersData);
            console.log("🔍 Est-ce un tableau?", Array.isArray(membersData));
            
            // Vérifier si les données sont dans une propriété spécifique
            if (membersData && typeof membersData === 'object') {
                if (Array.isArray(membersData.data)) {
                    console.log("✅ Utilisation de membersData.data");
                    setMembers(membersData.data);
                } else if (Array.isArray(membersData.members)) {
                    console.log("✅ Utilisation de membersData.members");
                    setMembers(membersData.members);
                } else if (Array.isArray(membersData)) {
                    console.log("✅ Utilisation directe de membersData");
                    setMembers(membersData);
                } else {
                    console.warn("⚠️ Structure inattendue, utilisation d'un tableau vide");
                    setMembers([]);
                }
            } else {
                setMembers(membersData || []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des membres:", error);
            setMembers([]); // S'assurer que members est toujours un tableau
        }
    };

    // Fonctions de gestion des équipes
    const handleAddTeam = () => {
        setTeamModalMode("add");
        setSelectedTeam(null);
        setTeamFormData({
            name: "",
            category: "",
            description: "",
            photo_url: "",
            teamPhoto: null,
            competition: "",
            teamMembers: [],
        });
        setShowTeamModal(true);
    };

    const handleEditTeam = (team) => {
        setTeamModalMode("edit");
        setSelectedTeam(team);
        setTeamFormData({
            name: team.name || "",
            category: team.category || "",
            description: team.description || "",
            photo_url: team.photo_url || "",
            teamPhoto: null,
            competition: team.competition || "",
            teamMembers: team.members || [],
        });
        setShowTeamModal(true);
    };

    const handleDeleteTeam = (team) => {
        setTeamToDelete(team);
        setShowTeamDeleteConfirm(true);
    };

    const confirmDeleteTeam = async () => {
        try {
            await teamsAPI.delete(teamToDelete.id);
            await loadTeams();
            if (onStatsUpdate) onStatsUpdate();
            setShowTeamDeleteConfirm(false);
            setTeamToDelete(null);
            toast.success("Équipe supprimée avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression de l'équipe:", error);
            toast.error("Erreur lors de la suppression de l'équipe");
        }
    };

    const validateTeamForm = () => {
        if (!teamFormData.name.trim()) {
            toast.error("Veuillez saisir un nom pour l'équipe");
            return false;
        }
        if (!teamFormData.category.trim()) {
            toast.error("Veuillez saisir une catégorie");
            return false;
        }
        return true;
    };

    // Fonction pour gérer le changement de photo d'équipe
    const handleTeamPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTeamFormData({ ...teamFormData, teamPhoto: file });
        }
    };

    // Fonction pour supprimer la photo d'équipe
    const removeTeamPhoto = () => {
        setTeamFormData({ ...teamFormData, teamPhoto: null, photo_url: "" });
    };

    // Fonction pour ajouter un membre à l'équipe
    const addMemberToTeam = (member, role) => {
        const existingMember = teamFormData.teamMembers.find(
            (m) => m.id === member.id
        );
        if (!existingMember) {
            setTeamFormData({
                ...teamFormData,
                teamMembers: [...teamFormData.teamMembers, { ...member, role }],
            });
        }
    };

    // Fonction pour supprimer un membre de l'équipe
    const removeMemberFromTeam = (memberId) => {
        setTeamFormData({
            ...teamFormData,
            teamMembers: teamFormData.teamMembers.filter(
                (m) => m.id !== memberId
            ),
        });
    };

    // Fonction pour changer le rôle d'un membre
    const changeMemberRole = (memberId, newRole) => {
        setTeamFormData({
            ...teamFormData,
            teamMembers: teamFormData.teamMembers.map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m
            ),
        });
    };

    const handleSaveTeam = async () => {
        console.log('handleSaveTeam called - teamModalMode:', teamModalMode);
        console.log('handleSaveTeam called - selectedTeam:', selectedTeam);
        console.log('handleSaveTeam called - teamFormData:', teamFormData);
        
        if (!validateTeamForm()) {
            console.log('Validation failed');
            return;
        }

        console.log('Validation passed, proceeding with save...');
        try {
            const formData = new FormData();
            formData.append("name", teamFormData.name);
            formData.append("category", teamFormData.category);
            formData.append("description", teamFormData.description);
            formData.append("competition", teamFormData.competition);
            formData.append(
                "members",
                JSON.stringify(teamFormData.teamMembers)
            );

            if (teamFormData.teamPhoto) {
                formData.append("photo", teamFormData.teamPhoto);
            } else if (teamFormData.photo_url) {
                formData.append("photo_url", teamFormData.photo_url);
            }

            if (teamModalMode === "add") {
                await teamsAPI.create(formData);
                toast.success("Équipe ajoutée avec succès");
            } else {
                await teamsAPI.update(selectedTeam.id, formData);
                toast.success("Équipe modifiée avec succès");
            }

            await loadTeams();
            if (onStatsUpdate) onStatsUpdate();
            setShowTeamModal(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'équipe:", error);
            toast.error("Erreur lors de la sauvegarde de l'équipe");
        }
    };

    // Filtrer les équipes
    const filteredTeams = teams.filter((team) => {
        const matchesSearch = team.name
            ?.toLowerCase()
            .includes(teamSearchTerm.toLowerCase());
        const matchesCategory =
            !selectedTeamCategory || team.category === selectedTeamCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border">
                        <Users className="w-6 h-6 text-[var(--primary-color)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestion des Équipes</h2>
                        <p className="text-gray-600">Gérez les équipes et leurs membres</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Bouton d'ajout */}
                <div className="flex justify-end items-center">
                    <button
                        onClick={handleAddTeam}
                        className="flex items-center px-4 py-2 space-x-2 text-white bg-[var(--primary-color)] rounded-lg transition-colors hover:bg-[var(--primary-dark)]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une équipe</span>
                    </button>
                </div>

            {/* Filtres de recherche */}
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher une équipe..."
                            value={teamSearchTerm}
                            onChange={(e) => setTeamSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="md:w-48">
                    <select
                        value={selectedTeamCategory}
                        onChange={(e) => setSelectedTeamCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    >
                        <option value="">Toutes les catégories</option>
                        <option value="senior">Senior</option>
                        <option value="veteran">Vétéran</option>
                        <option value="junior">Junior</option>
                        <option value="mixte">Mixte</option>
                    </select>
                </div>
            </div>

            {/* Liste des équipes */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Équipe
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Catégorie
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Compétition
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Membres
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTeams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {team.photo_url && (
                                                <img
                                                    src={team.photo_url}
                                                    alt={team.name}
                                                    className="object-cover mr-3 w-10 h-10 rounded-full"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {team.name}
                                                </div>
                                                {team.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {team.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-white bg-[var(--primary-color)] rounded-full">
                                            {team.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                        {team.competition || "Aucune"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                        {team.members?.length || 0} membre(s)
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleEditTeam(team)
                                                }
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTeam(team)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTeams.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="text-gray-500">
                            {teamSearchTerm || selectedTeamCategory
                                ? "Aucune équipe trouvée avec ces critères"
                                : "Aucune équipe enregistrée"}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'ajout/modification d'équipe */}
            {showTeamModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {teamModalMode === "add"
                                        ? "Ajouter une équipe"
                                        : "Modifier l'équipe"}
                                </h3>
                                <button
                                    onClick={() => setShowTeamModal(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Nom de l'équipe *
                                    </label>
                                    <input
                                        type="text"
                                        value={teamFormData.name}
                                        onChange={(e) =>
                                            setTeamFormData({
                                                ...teamFormData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Nom de l'équipe"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Catégorie *
                                    </label>
                                    <select
                                        value={teamFormData.category}
                                        onChange={(e) =>
                                            setTeamFormData({
                                                ...teamFormData,
                                                category: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    >
                                        <option value="">
                                            Sélectionner une catégorie
                                        </option>
                                        <option value="senior">Senior</option>
                                        <option value="veteran">Vétéran</option>
                                        <option value="junior">Junior</option>
                                        <option value="mixte">Mixte</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Compétition
                                    </label>
                                    <select
                                        value={teamFormData.competition}
                                        onChange={(e) =>
                                            setTeamFormData({
                                                ...teamFormData,
                                                competition: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    >
                                        <option value="">
                                            Aucune compétition
                                        </option>
                                        <option value="championnat">
                                            Championnat
                                        </option>
                                        <option value="coupe">Coupe</option>
                                        <option value="tournoi">Tournoi</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={teamFormData.description}
                                        onChange={(e) =>
                                            setTeamFormData({
                                                ...teamFormData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        rows="3"
                                        placeholder="Description de l'équipe"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Photo de l'équipe
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleTeamPhotoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                    {(teamFormData.teamPhoto ||
                                        teamFormData.photo_url) && (
                                        <div className="inline-block relative mt-2">
                                            <img
                                                src={
                                                    teamFormData.teamPhoto
                                                        ? URL.createObjectURL(
                                                              teamFormData.teamPhoto
                                                          )
                                                        : teamFormData.photo_url
                                                }
                                                alt="Aperçu"
                                                className="object-cover w-32 h-32 rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeTeamPhoto}
                                                className="flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section de sélection des membres */}
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Membres de l'équipe
                                    </label>

                                    {/* Sélection d'un nouveau membre */}
                                    <div className="p-4 mb-4 bg-gray-50 rounded-lg">
                                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                                            Ajouter un membre
                                        </h4>

                                        {/* Input avec dropdown */}
                                        <div className="relative member-dropdown-container">
                                            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                                                <Search className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Rechercher par nom ou prénom..."
                                                value={memberSearchTerm}
                                                onChange={(e) => {
                                                    setMemberSearchTerm(
                                                        e.target.value
                                                    );
                                                    setIsDropdownOpen(
                                                        e.target.value.trim() !==
                                                            ""
                                                    );
                                                }}
                                                onFocus={() => {
                                                    if (
                                                        memberSearchTerm.trim() !==
                                                        ""
                                                    ) {
                                                        setIsDropdownOpen(true);
                                                    }
                                                }}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                            />

                                            {/* Dropdown avec les résultats */}
                                            {isDropdownOpen &&
                                                memberSearchTerm.trim() !==
                                                    "" &&
                                                (() => {
                                                    // Filtrer les membres disponibles (pas déjà dans l'équipe)
                                                    const availableMembers =
                                                        members.filter(
                                                            (member) =>
                                                                !teamFormData.teamMembers.find(
                                                                    (tm) =>
                                                                        tm.id ===
                                                                        member.id
                                                                )
                                                        );

                                                    // Appliquer le filtre de recherche
                                                    const filteredMembers =
                                                        availableMembers.filter(
                                                            (member) => {
                                                                const searchTerm =
                                                                    memberSearchTerm.toLowerCase();
                                                                const fullName =
                                                                    `${member.prenom} ${member.nom}`.toLowerCase();
                                                                const firstName =
                                                                    member.prenom?.toLowerCase() ||
                                                                    "";
                                                                const lastName =
                                                                    member.nom?.toLowerCase() ||
                                                                    "";

                                                                return (
                                                                    fullName.includes(
                                                                        searchTerm
                                                                    ) ||
                                                                    firstName.includes(
                                                                        searchTerm
                                                                    ) ||
                                                                    lastName.includes(
                                                                        searchTerm
                                                                    )
                                                                );
                                                            }
                                                        );

                                                    // Limiter à 10 résultats
                                                    const limitedMembers =
                                                        filteredMembers.slice(
                                                            0,
                                                            10
                                                        );

                                                    return (
                                                        <div
                                                            className="overflow-y-auto absolute right-0 left-0 top-full z-50 mt-2 max-h-64 bg-white rounded-xl border border-gray-200 shadow-xl animate-fadeIn"
                                                            style={{
                                                                boxShadow:
                                                                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                                            }}
                                                        >
                                                            {limitedMembers.length ===
                                                            0 ? (
                                                                <div className="px-4 py-4 text-sm text-center text-gray-500">
                                                                    <div className="flex flex-col items-center space-y-2">
                                                                        <Search className="w-5 h-5 text-gray-400" />
                                                                        <span>
                                                                            Aucun
                                                                            membre
                                                                            trouvé
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="py-2">
                                                                        {limitedMembers.map(
                                                                            (
                                                                                member,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        member.id
                                                                                    }
                                                                                    className="px-4 py-3 hover:bg-gradient-to-r hover:from-[var(--primary-color)]/5 hover:to-[var(--primary-color)]/10 cursor-pointer transition-all duration-200 ease-in-out border-b border-gray-50 last:border-b-0 group"
                                                                                    onClick={() => {
                                                                                        addMemberToTeam(
                                                                                            member,
                                                                                            "Joueur"
                                                                                        );
                                                                                        setMemberSearchTerm(
                                                                                            ""
                                                                                        );
                                                                                        setIsDropdownOpen(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center space-x-3">
                                                                                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-dark)] rounded-full flex items-center justify-center text-white text-sm font-medium group-hover:scale-110 transition-transform duration-200">
                                                                                            {member.prenom
                                                                                                ?.charAt(
                                                                                                    0
                                                                                                )
                                                                                                ?.toUpperCase()}
                                                                                            {member.nom
                                                                                                ?.charAt(
                                                                                                    0
                                                                                                )
                                                                                                ?.toUpperCase()}
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="font-medium text-gray-900 group-hover:text-[var(--primary-color)] transition-colors duration-200">
                                                                                                {
                                                                                                    member.prenom
                                                                                                }{" "}
                                                                                                {
                                                                                                    member.nom
                                                                                                }
                                                                                            </div>
                                                                                            {member.email && (
                                                                                                <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-gray-600">
                                                                                                    {
                                                                                                        member.email
                                                                                                    }
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    {filteredMembers.length >
                                                                        10 && (
                                                                        <div className="px-4 py-3 text-xs text-center text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                                                                            <span className="inline-flex items-center space-x-1">
                                                                                <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>
                                                                                <span>
                                                                                    {
                                                                                        filteredMembers.length
                                                                                    }{" "}
                                                                                    membres
                                                                                    trouvés
                                                                                    (10
                                                                                    premiers
                                                                                    affichés)
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                        </div>
                                    </div>

                                    {/* Liste des membres sélectionnés */}
                                    {teamFormData.teamMembers.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Membres sélectionnés
                                            </h4>
                                            {teamFormData.teamMembers.map(
                                                (member, index) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <span className="font-medium text-gray-900">
                                                                {member.prenom}{" "}
                                                                {member.nom}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <select
                                                                value={
                                                                    member.role
                                                                }
                                                                onChange={(e) =>
                                                                    changeMemberRole(
                                                                        member.id,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                            >
                                                                <option value="Capitaine">
                                                                    Capitaine
                                                                </option>
                                                                <option value="Joueur">
                                                                    Joueur
                                                                </option>
                                                                <option value="Remplaçant">
                                                                    Remplaçant
                                                                </option>
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeMemberFromTeam(
                                                                        member.id
                                                                    )
                                                                }
                                                                className="text-red-600 transition-colors hover:text-red-800"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowTeamModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveTeam}
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {teamModalMode === "add"
                                            ? "Ajouter"
                                            : "Modifier"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression équipe */}
            {showTeamDeleteConfirm && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-lg bg-white rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowTeamDeleteConfirm(false)
                                    }
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer l'équipe "
                                {teamToDelete?.name}" ? Cette action est
                                irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() =>
                                        setShowTeamDeleteConfirm(false)
                                    }
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteTeam}
                                    className="flex items-center px-4 py-2 space-x-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default TeamManagement;