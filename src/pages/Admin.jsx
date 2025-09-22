import {
    BarChart3,
    Calendar,
    Calendar as CalendarIcon,
    Camera,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Edit,
    Euro,
    Gift,
    Home,
    Mail,
    MapPin,
    Minus,
    Phone,
    Plus,
    Save,
    Search,
    Settings,
    Shield,
    Trash2,
    Trophy,
    UserPlus,
    Users,
    Wine,
    X,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useDrinks } from "../contexts/DrinksContext";
import { eventsAPI, teamsAPI } from "../lib/api";
import { membersAPI } from "../lib/membersAPI";
import BarManagement from "../components/BarManagement";
import MemberManagement from "../components/MemberManagement";
import EventManagement from "../components/EventManagement";
import CompetitionManagement from "../components/CompetitionManagement";
import TeamManagement from "../components/TeamManagement";
import HomeContentManagement from "../components/HomeContentManagement";
import SiteManagement from "../components/SiteManagement";
import MembershipRequestManagement from "../components/MembershipRequestManagement";

import { formatDateToFrench, formatDateToISO, validateFrenchDate } from "../utils/dateUtils";
import { generateAvatar } from "../utils/avatarUtils";
import "../styles/animations.css";
import "../styles/AdminCards.css";

const Admin = () => {
    const { drinks, addDrink, updateDrink, deleteDrink } = useDrinks();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        teams: 0,
        events: 0,
        drinks: 0,
        results: 0,
        membershipRequests: 0,
    });

    // État pour la gestion des modales
    const [activeModal, setActiveModal] = useState(null); // 'bar', 'membre', 'evenement', 'equipe', 'resultat'
    const [searchTerm, setSearchTerm] = useState("");

    // États pour la gestion des membres
    const [members, setMembers] = useState([]);
    const [memberTypes, setMemberTypes] = useState([]);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [selectedMemberType, setSelectedMemberType] = useState("");
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberModalMode, setMemberModalMode] = useState("add");
    const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // États pour la gestion des types de membres
    const [showTypeMemberModal, setShowTypeMemberModal] = useState(false);
    const [typeMemberModalMode, setTypeMemberModalMode] = useState("add");
    const [selectedTypeMember, setSelectedTypeMember] = useState(null);
    const [typeMemberSearchTerm, setTypeMemberSearchTerm] = useState("");
    const [showTypeMemberDeleteConfirm, setShowTypeMemberDeleteConfirm] =
        useState(false);
    const [typeMemberToDelete, setTypeMemberToDelete] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [typeMemberFormData, setTypeMemberFormData] = useState({
        nom: "",
        description: "",
        droits: [],
    });



    // États pour la gestion des concours - maintenant dans CompetitionManagement.jsx
    const [concours, setConcours] = useState([]); // Gardé pour les stats


    // concoursSearchTerm et concoursFormData maintenant dans CompetitionManagement.jsx

    // États pour la gestion des lotos - maintenant dans CompetitionManagement.jsx
    const [lotos, setLotos] = useState([]); // Gardé pour les stats





    const [isDropdownOpen, setIsDropdownOpen] = useState(false);



    // Variables calculées pour le filtrage des types de membres
    const filteredTypeMember = memberTypes.filter(
        (type) =>
            type &&
            type.nom &&
            (type.nom
                .toLowerCase()
                .includes(typeMemberSearchTerm.toLowerCase()) ||
                (type.description &&
                    type.description
                        .toLowerCase()
                        .includes(typeMemberSearchTerm.toLowerCase())))
    );



    useEffect(() => {
        const initializeAdmin = async () => {
            try {
                await loadMembers(); // Les stats seront mises à jour automatiquement après le chargement des membres
                await loadMemberTypes();
                // loadLotos maintenant dans CompetitionManagement.jsx
            } catch (error) {
                console.error("Erreur lors de l'initialisation de l'admin:", error);
            } finally {
                setLoading(false); // S'assurer que le loading se termine
            }
        };
        
        initializeAdmin();
    }, []);

    // Mettre à jour les stats quand les boissons changent
    useEffect(() => {
        if (drinks.length >= 0) { // Vérifier que les boissons sont chargées (même si vide)
            setStats(prevStats => ({
                ...prevStats,
                drinks: drinks.length
            }));
        }
    }, [drinks]);

    // Fonction pour charger les membres depuis la base de données
    const loadMembers = async () => {
        try {
            const membersData = await membersAPI.getAll();
            setMembers(membersData);
            // Mettre à jour les stats après avoir chargé les membres
            updateMemberStats(membersData);
        } catch (error) {
            console.error("Erreur lors du chargement des membres:", error);
            toast.error("Erreur lors du chargement des membres");
        }
    };

    // Fonction pour mettre à jour les statistiques des membres
    const updateMemberStats = async (membersData) => {
        try {
            setLoading(true);
            const eventsCount = await eventsAPI.getCount();
            const teamsCount = await teamsAPI.getCount();
            
            // Charger le compteur des demandes d'adhésion
            const membershipRequestsCount = await loadMembershipRequestsCount();

            setStats((prevStats) => ({
                ...prevStats,
                users: membersData.length, // Utiliser les données des membres passées en paramètre
                teams: teamsCount,
                events: eventsCount,
                albums: 0, // TODO: Implémenter l'API des albums
                // drinks: drinks.length, // Ne pas écraser le compteur de boissons ici
                results: 0, // TODO: Implémenter l'API des résultats
                membershipRequests: membershipRequestsCount,
            }));
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour des statistiques des membres:",
                error
            );
            toast.error("Erreur lors de la mise à jour des statistiques");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour charger les types de membres depuis la base de données
    const loadMemberTypes = async () => {
        try {
            const typesData = await membersAPI.getTypes();
            setMemberTypes(typesData);
        } catch (error) {
            console.error(
                "Erreur lors du chargement des types de membres:",
                error
            );
            toast.error("Erreur lors du chargement des types de membres");
        }
    };

    // Fonction pour charger le compteur des demandes d'adhésion
    const loadMembershipRequestsCount = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/membership/requests?status=en_attente', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 403) {
                // L'utilisateur n'a pas les permissions pour voir les demandes d'adhésion
                console.log('Utilisateur sans permissions pour voir les demandes d\'adhésion');
                return 0;
            }

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des demandes');
            }

            const data = await response.json();
            return data.requests ? data.requests.length : 0;
        } catch (error) {
            console.error('Erreur lors du chargement du compteur des demandes:', error);
            return 0;
        }
    };

    // Fonction pour charger les lotos (données de test pour l'instant)
    // loadLotos maintenant dans CompetitionManagement.jsx





    const loadStats = async () => {
        try {
            setLoading(true);
            const eventsCount = await eventsAPI.getCount();
            const teamsCount = await teamsAPI.getCount();

            setStats({
                users: members.length, // Nombre de membres
                teams: teamsCount,
                events: eventsCount,
                albums: 0, // TODO: Implémenter l'API des albums
                drinks: drinks.length,
                results: 0, // TODO: Implémenter l'API des résultats
            });
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
            toast.error("Erreur lors du chargement des statistiques");
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour mettre à jour les statistiques après modification des équipes
    const handleStatsUpdate = async () => {
        await loadStats();
    };

    const loadEvents = async () => {
        try {
            const eventsData = await eventsAPI.getAll();

            // Mapper les champs et récupérer le nombre de photos pour chaque événement
            const eventsWithPhotos = await Promise.all(
                eventsData.map(async (event) => {
                    try {
                        // Récupérer les photos de l'événement
                        const response = await fetch(
                            `${
                                import.meta.env.VITE_API_URL ||
                                "http://localhost:3002"
                            }/api/events/${event.id}/photos`
                        );
                        const photos = response.ok ? await response.json() : [];

                        return {
                            ...event,
                            titre: event.title, // Mapper title vers titre
                            photos: photos, // Ajouter les photos
                        };
                    } catch (photoError) {
                        console.error(
                            `Erreur lors du chargement des photos pour l'événement ${event.id}:`,
                            photoError
                        );
                        return {
                            ...event,
                            titre: event.title,
                            photos: [],
                        };
                    }
                })
            );

            setEvents(eventsWithPhotos);
        } catch (error) {
            console.error("Erreur lors du chargement des événements:", error);
            toast.error("Erreur lors du chargement des événements");
        }
    };

    // Fonction pour gérer la sélection d'image de membre




    const validateMemberForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (
            !memberFormData.nom ||
            !memberFormData.prenom ||
            !memberFormData.email
        ) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return false;
        }

        if (!emailRegex.test(memberFormData.email)) {
            toast.error("Veuillez saisir un email valide");
            return false;
        }

        if (
            memberFormData.telephone &&
            !phoneRegex.test(memberFormData.telephone.replace(/\s/g, ""))
        ) {
            toast.error(
                "Veuillez saisir un numéro de téléphone valide (10 chiffres)"
            );
            return false;
        }

        return true;
    };

    const handleSaveMember = async () => {
        if (!validateMemberForm()) {
            return;
        }

        // Vérifier les erreurs de date avant la sauvegarde
        if (dateErrors.dateNaissance || dateErrors.dateEntree) {
            toast.error("Veuillez corriger les erreurs de format de date");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("nom", memberFormData.nom);
            formData.append("prenom", memberFormData.prenom);
            formData.append("adresse", memberFormData.adresse);
            formData.append("telephone", memberFormData.telephone);
            formData.append("email", memberFormData.email);
            formData.append("numero_licence", memberFormData.numeroLicence);
            formData.append(
                "date_entree",
                memberFormData.dateEntree
                    ? formatDateToISO(memberFormData.dateEntree)
                    : ""
            );
            formData.append(
                "date_naissance",
                memberFormData.dateNaissance
                    ? formatDateToISO(memberFormData.dateNaissance)
                    : ""
            );
            formData.append("type_membre_id", memberFormData.typeMembreId);

            // Ajouter la photo si elle existe
            if (selectedMemberImageFile) {
                // Validation finale avant upload
                const allowedTypes = [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                ];
                if (!allowedTypes.includes(selectedMemberImageFile.type)) {
                    toast.error("Type de fichier non supporté pour la photo.");
                    return;
                }

                const maxSize = 5 * 1024 * 1024; // 5MB
                if (selectedMemberImageFile.size > maxSize) {
                    toast.error("La photo est trop volumineuse (max 5MB).");
                    return;
                }

                formData.append("photo", selectedMemberImageFile);
            }

            if (memberModalMode === "add") {
                await membersAPI.create(formData);
                toast.success("Membre ajouté avec succès");
            } else {
                await membersAPI.update(selectedMember.id, formData);
                toast.success("Membre modifié avec succès");
            }

            // Recharger les données
            await loadMembers();
            setShowMemberModal(false);

            // Réinitialiser les états des photos
            setSelectedMemberImageFile(null);
            setMemberImagePreview(null);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du membre:", error);

            // Gestion d'erreurs spécifiques
            if (error.message && error.message.includes("file")) {
                toast.error(
                    "Erreur lors de l'upload de la photo. Veuillez réessayer."
                );
            } else if (error.message && error.message.includes("network")) {
                toast.error(
                    "Erreur de connexion. Vérifiez votre connexion internet."
                );
            } else if (error.response && error.response.status === 413) {
                toast.error(
                    "Le fichier est trop volumineux pour être uploadé."
                );
            } else if (error.response && error.response.status === 415) {
                toast.error("Type de fichier non supporté par le serveur.");
            } else {
                toast.error(
                    "Erreur lors de la sauvegarde du membre. Veuillez réessayer."
                );
            }
        }
    };

    // Fonctions pour la gestion des composants de date
    const handleDateComponentChange = (dateField, component, value) => {
        // Ne permettre que les chiffres
        if (!/^\d*$/.test(value)) return;

        // Limiter la longueur selon le composant
        const maxLength = component === "year" ? 4 : 2;
        if (value.length > maxLength) return;

        // Validation des valeurs
        if (component === "day" && value.length === 2) {
            const dayNum = parseInt(value);
            if (dayNum < 1 || dayNum > 31) return;
        }

        if (component === "month" && value.length === 2) {
            const monthNum = parseInt(value);
            if (monthNum < 1 || monthNum > 12) return;
        }

        // Mettre à jour l'état des composants
        setDateComponents((prev) => ({
            ...prev,
            [dateField]: {
                ...prev[dateField],
                [component]: value,
            },
        }));

        // Auto-navigation et conversion d'année
        if (component === "day" && value.length === 2) {
            // Passer au champ mois
            setTimeout(() => {
                if (dateRefs.current[dateField]?.month) {
                    dateRefs.current[dateField].month.focus();
                }
            }, 0);
        } else if (component === "month" && value.length === 2) {
            // Passer au champ année
            setTimeout(() => {
                if (dateRefs.current[dateField]?.year) {
                    dateRefs.current[dateField].year.focus();
                }
            }, 0);
        } else if (component === "year" && value.length === 2) {
            // Conversion automatique de l'année
            const yearNum = parseInt(value);
            const fullYear = yearNum < 50 ? 2000 + yearNum : 1900 + yearNum;

            setDateComponents((prev) => ({
                ...prev,
                [dateField]: {
                    ...prev[dateField],
                    year: fullYear.toString(),
                },
            }));
        }

        // Mettre à jour le champ principal quand tous les composants sont remplis
        const updatedComponents = {
            ...dateComponents[dateField],
            [component]:
                component === "year" && value.length === 2
                    ? (parseInt(value) < 50
                          ? 2000 + parseInt(value)
                          : 1900 + parseInt(value)
                      ).toString()
                    : value,
        };

        if (
            updatedComponents.day &&
            updatedComponents.month &&
            updatedComponents.year
        ) {
            const formattedDate = `${updatedComponents.day.padStart(
                2,
                "0"
            )}/${updatedComponents.month.padStart(2, "0")}/${
                updatedComponents.year
            }`;
            setMemberFormData((prev) => ({
                ...prev,
                [dateField]: formattedDate,
            }));

            // Validation de la date
            const validation = validateFrenchDate(formattedDate);
            setDateErrors((prev) => ({
                ...prev,
                [dateField]: validation.isValid ? "" : validation.error,
            }));
        }
    };

    const handleDateKeyDown = (e, dateField, component) => {
        // Permettre les touches de navigation
        if (
            ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                e.key
            )
        ) {
            return;
        }

        // Empêcher les caractères non numériques
        if (!/\d/.test(e.key)) {
            e.preventDefault();
        }
    };

    const getMemberTypeName = (typeId) => {
        const type = memberTypes.find((t) => t.id === typeId);
        return type ? type.nom : "Non défini";
    };

    // Fonction pour afficher l'anniversaire au format JJ/MM
    const getBirthdayDisplay = (dateNaissance) => {
        if (!dateNaissance) return "Non renseigné";

        try {
            let date;
            // Si la date est au format jj/mm/aaaa
            if (dateNaissance.includes("/")) {
                const [jour, mois] = dateNaissance.split("/");
                return `${jour.padStart(2, "0")}/${mois.padStart(2, "0")}`;
            }
            // Si la date est au format ISO (aaaa-mm-jj)
            else {
                date = new Date(dateNaissance);
                const jour = date.getDate().toString().padStart(2, "0");
                const mois = (date.getMonth() + 1).toString().padStart(2, "0");
                return `${jour}/${mois}`;
            }
        } catch (error) {
            return "Non renseigné";
        }
    };

    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            member.nom.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.prenom
                .toLowerCase()
                .includes(memberSearchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(memberSearchTerm.toLowerCase());

        const matchesType =
            selectedMemberType === "" ||
            (member.type_membre_id &&
                member.type_membre_id.toString() === selectedMemberType);

        return matchesSearch && matchesType;
    });



    // Fonctions de gestion des types de membres
    const handleAddTypeMember = () => {
        setTypeMemberModalMode("add");
        setSelectedTypeMember(null);
        setTypeMemberFormData({
            nom: "",
            description: "",
            droits: [],
        });
        setShowTypeMemberModal(true);
    };

    const handleEditTypeMember = (typeMember) => {
        setTypeMemberModalMode("edit");
        setSelectedTypeMember(typeMember);
        setTypeMemberFormData({
            nom: typeMember.nom,
            description: typeMember.description,
            droits: Array.isArray(typeMember.droits)
                ? [...typeMember.droits]
                : [],
        });
        setShowTypeMemberModal(true);
    };

    const handleDeleteTypeMember = (typeMember) => {
        setTypeMemberToDelete(typeMember);
        setShowTypeMemberDeleteConfirm(true);
    };

    const confirmDeleteTypeMember = async () => {
        try {
            await membersAPI.deleteType(typeMemberToDelete.id);
            await loadMemberTypes();
            setShowTypeMemberDeleteConfirm(false);
            setTypeMemberToDelete(null);
            toast.success("Type de membre supprimé avec succès");
        } catch (error) {
            console.error(
                "Erreur lors de la suppression du type de membre:",
                error
            );
            toast.error("Erreur lors de la suppression: " + error.message);
        }
    };

    const handleSaveTypeMember = async () => {
        if (!typeMemberFormData.nom.trim()) {
            toast.error("Veuillez saisir un nom pour le type de membre");
            return;
        }

        setLoading(true);
        try {
            if (typeMemberModalMode === "add") {
                const newTypeMember = await membersAPI.createType(
                    typeMemberFormData
                );
                toast.success("Type de membre ajouté avec succès");
            } else {
                await membersAPI.updateType(
                    selectedTypeMember.id,
                    typeMemberFormData
                );
                toast.success("Type de membre modifié avec succès");
            }

            // Rafraîchir la liste des types de membres
            await loadMemberTypes();
            setShowTypeMemberModal(false);
        } catch (error) {
            console.error(
                "Erreur lors de la sauvegarde du type de membre:",
                error
            );
            toast.error("Erreur lors de la sauvegarde: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTypeMemberRight = (right) => {
        const currentRights = typeMemberFormData.droits;
        if (currentRights.includes(right)) {
            setTypeMemberFormData({
                ...typeMemberFormData,
                droits: currentRights.filter((r) => r !== right),
            });
        } else {
            setTypeMemberFormData({
                ...typeMemberFormData,
                droits: [...currentRights, right],
            });
        }
    };

    const handleDeleteMember = (member) => {
        setMemberToDelete(member);
        setShowMemberDeleteConfirm(true);
    };

    const confirmDeleteMember = async () => {
        try {
            await membersAPI.delete(memberToDelete.id);
            toast.success("Membre supprimé avec succès");

            // Recharger les données
            await loadMembers();
            setShowMemberDeleteConfirm(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            toast.error("Erreur lors de la suppression du membre");
        }
    };




  const availableRights = [
        {
            id: "admin",
            label: "Administration complète",
            description: "Accès total à toutes les fonctionnalités",
        },
        {
            id: "manage_members",
            label: "Gestion des membres",
            description: "Créer, modifier et supprimer des membres",
        },
        {
            id: "manage_events",
            label: "Gestion des événements",
            description: "Créer et gérer les événements",
        },
        {
            id: "manage_bar",
            label: "Gestion du bar",
            description: "Gérer les boissons et le stock",
        },
        {
            id: "view_stats",
            label: "Consultation des statistiques",
            description: "Accès aux rapports et statistiques",
        },
        {
            id: "manage_teams",
            label: "Gestion des équipes",
            description: "Créer et gérer les équipes",
        },
    ];

    // Les fonctions de gestion des concours sont maintenant dans CompetitionManagement.jsx





    // Gestion des événements clavier
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && activeModal) {
                setActiveModal(null);
            }
        };

        if (activeModal) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [activeModal]);

    // Gestion des clics à l'extérieur du dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isDropdownOpen &&
                !event.target.closest(".member-dropdown-container")
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);



    const ManagementCard = ({
        title,
        icon: Icon,
        count,
        description,
        modalKey,
    }) => {
        const handleCardClick = (e) => {
            setActiveModal(modalKey);
        };

        return (
            <div
                className="admin-stats-card"
                onClick={handleCardClick}
            >
                <div className="admin-stats-card-header">
                    <div className="admin-stats-card-info">
                        <div className="admin-card-icon">
                            <Icon />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {description}
                            </p>
                        </div>
                    </div>
                    <div className="admin-stats-card-count">
                        <div className="admin-stats-card-number">
                            {count}
                        </div>
                    </div>
                </div>
                <div className="admin-stats-card-footer">
                    <span className="admin-stats-card-action">
                        Cliquer pour gérer →
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="admin-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-main-container">
            <div className="admin-content-wrapper">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">
                        Administration
                    </h1>
                    <p className="text-lg text-gray-600">
                        Gérez tous les aspects de votre club de pétanque depuis
                        cette interface centralisée
                    </p>
                </div>

                <div className="admin-cards-grid">
                    <ManagementCard
                        title="Page d'Accueil"
                        icon={Home}
                        count={1}
                        description="Gestion du contenu de la page d'accueil"
                        modalKey="home"
                    />

                    <ManagementCard
                        title="Bar"
                        icon={Wine}
                        count={stats.drinks}
                        description="Gestion des boissons et du stock"
                        modalKey="bar"
                    />

                    <ManagementCard
                        title="Membre"
                        icon={Users}
                        count={stats.users}
                        description="Gestion des utilisateurs et rôles"
                        modalKey="membre"
                    />

                    <ManagementCard
                        title="Demandes d'adhésion"
                        icon={UserPlus}
                        count={stats.membershipRequests}
                        description="Gérer les demandes d'adhésion en attente"
                        modalKey="membershipRequests"
                    />

                    <ManagementCard
                        title="Types de Membre"
                        icon={Shield}
                        count={memberTypes.length}
                        description="Gérer les types et droits des membres"
                        modalKey="typeMembre"
                    />

                    <ManagementCard
                        title="Gestion des droits"
                        icon={Shield}
                        count={availableRights.length}
                        description="Gérer les permissions et accès des utilisateurs"
                        modalKey="droits"
                    />

                    <ManagementCard
                        title="Événement"
                        icon={Calendar}
                        count={stats.events}
                        description="Gestion des événements et calendrier"
                        modalKey="evenement"
                    />

                    <ManagementCard
                        title="Équipe"
                        icon={Trophy}
                        count={stats.teams}
                        description="Gestion des équipes de pétanque"
                        modalKey="equipe"
                    />

                    <ManagementCard
                        title="Résultat"
                        icon={BarChart3}
                        count={stats.results}
                        description="Gestion des résultats et classements"
                        modalKey="resultat"
                    />

                    <ManagementCard
                        title="Concours"
                        icon={Trophy}
                        count={concours.length}
                        description="Gestion des concours de pétanque"
                        modalKey="concours"
                    />

                    <ManagementCard
                        title="Loto"
                        icon={Gift}
                        count={lotos.length}
                        description="Gestion des lotos et tirages"
                        modalKey="concours"
                    />

                    <ManagementCard
                        title="Gestion du site"
                        icon={Settings}
                        count={1}
                        description="Configuration et paramètres du site web"
                        modalKey="gestionSite"
                    />
                </div>
            </div>

            {/* Système de modales */}
            {activeModal && (
                <div
                    className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setActiveModal(null);
                        }
                    }}
                >
                    <div className="admin-modal-card">
                        {/* Contenu de la modale */}
                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">









                            {activeModal === "bar" && (
                                <BarManagement onClose={() => setActiveModal(null)} />
                            )}

                            {/* Gestion du Contenu de la Page d'Accueil */}
                            {activeModal === "home" && (
                                <HomeContentManagement onClose={() => setActiveModal(null)} />
                            )}

                            {/* Gestion des Événements */}
                            {activeModal === "evenement" && (
                                <EventManagement onClose={() => setActiveModal(null)} />
                            )}

                            {/* Gestion des Demandes d'adhésion */}
                            {activeModal === "membershipRequests" && (
                                <MembershipRequestManagement onClose={() => setActiveModal(null)} />
                            )}

                            {/* Modal Gestion des Concours et Lotos */}
                            {(activeModal === "concours" || activeModal === "loto") && (
                                <CompetitionManagement onClose={() => setActiveModal(null)} />
                            )}







                            {/* Modal Ajouter/Modifier type de membre */}
                            {showTypeMemberModal && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {typeMemberModalMode ===
                                                    "add"
                                                        ? "Ajouter un type de membre"
                                                        : "Modifier le type de membre"}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowTypeMemberModal(
                                                            false
                                                        )
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Nom du type *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            typeMemberFormData.nom
                                                        }
                                                        onChange={(e) =>
                                                            setTypeMemberFormData(
                                                                {
                                                                    ...typeMemberFormData,
                                                                    nom: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Ex: Administrateur, Modérateur, Membre standard"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={
                                                            typeMemberFormData.description
                                                        }
                                                        onChange={(e) =>
                                                            setTypeMemberFormData(
                                                                {
                                                                    ...typeMemberFormData,
                                                                    description:
                                                                        e.target
                                                                            .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        rows="3"
                                                        placeholder="Description du rôle et des responsabilités"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-3 text-sm font-medium text-gray-700">
                                                        <Shield className="inline mr-1 w-4 h-4" />
                                                        Droits et permissions
                                                    </label>
                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        {availableRights.map(
                                                            (right) => (
                                                                <label
                                                                    key={
                                                                        right.id
                                                                    }
                                                                    className="flex items-center p-3 space-x-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={typeMemberFormData.droits.includes(
                                                                            right.id
                                                                        )}
                                                                        onChange={() =>
                                                                            toggleTypeMemberRight(
                                                                                right.id
                                                                            )
                                                                        }
                                                                        className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                right.label
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {
                                                                                right.description
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {typeMemberFormData.droits
                                                    .length > 0 && (
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <h4 className="mb-2 text-sm font-medium text-blue-900">
                                                            Aperçu des
                                                            permissions
                                                            accordées :
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {typeMemberFormData.droits.map(
                                                                (droitId) => {
                                                                    const right =
                                                                        availableRights.find(
                                                                            (
                                                                                r
                                                                            ) =>
                                                                                r.id ===
                                                                                droitId
                                                                        );
                                                                    return (
                                                                        <span
                                                                            key={
                                                                                droitId
                                                                            }
                                                                            className="px-2 py-1 text-xs font-medium text-white bg-[var(--primary-color)] rounded-full"
                                                                        >
                                                                            {right
                                                                                ? right.label
                                                                                : droitId}
                                                                        </span>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end mt-6 space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowTypeMemberModal(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={
                                                        handleSaveTypeMember
                                                    }
                                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>
                                                        {typeMemberModalMode ===
                                                        "add"
                                                            ? "Ajouter"
                                                            : "Modifier"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal de confirmation de suppression type de membre */}
                            {showTypeMemberDeleteConfirm && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="w-full max-w-md bg-white rounded-lg">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Confirmer la suppression
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowTypeMemberDeleteConfirm(
                                                            false
                                                        )
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <p className="mb-6 text-gray-600">
                                                Êtes-vous sûr de vouloir
                                                supprimer le type de membre "
                                                {typeMemberToDelete?.nom}" ?
                                                Cette action est irréversible et
                                                pourrait affecter les membres
                                                existants.
                                            </p>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowTypeMemberDeleteConfirm(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={
                                                        confirmDeleteTypeMember
                                                    }
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

                            {activeModal === "membre" && (
                                <MemberManagement 
                                    members={members}
                                    setMembers={setMembers}
                                    memberTypes={memberTypes}
                                    loadMembers={loadMembers}
                                    onClose={() => setActiveModal(null)}
                                />
                            )}

                            {activeModal === "typeMembre" && (
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                             <div className="p-2 bg-gray-100 rounded-lg">
                                                 <Shield className="w-6 h-6 text-[var(--primary-color)]" />
                                             </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    Gestion des Types de Membre
                                                </h2>
                                                <p className="text-sm text-gray-600">
                                                    Gérez les différents types de membres et leurs droits associés
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveModal(null)}
                                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* Barre de recherche et bouton d'ajout */}
                                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un type de membre..."
                                                    value={typeMemberSearchTerm}
                                                    onChange={(e) =>
                                                        setTypeMemberSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddTypeMember}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Ajouter un type
                                        </button>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="mb-6">
                                        <div className="text-sm text-gray-600">
                                            {filteredTypeMember.length} type
                                            {filteredTypeMember.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            de membre
                                            {filteredTypeMember.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            trouvé
                                            {filteredTypeMember.length > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Tableau des types de membres */}
                                    <div className="admin-content-card">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Nom du type
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Description
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Droits
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredTypeMember.map(
                                                        (type) => (
                                                            <tr
                                                                key={type.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <Shield className="h-5 w-5 text-[var(--primary-color)] mr-2" />
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                type.nom
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm text-gray-900">
                                                                        {
                                                                            type.description
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {(Array.isArray(
                                                                            type.droits
                                                                        )
                                                                            ? type.droits
                                                                            : []
                                                                        ).map(
                                                                            (
                                                                                droit
                                                                            ) => {
                                                                                const rightInfo =
                                                                                    availableRights.find(
                                                                                        (
                                                                                            r
                                                                                        ) =>
                                                                                            r.id ===
                                                                                            droit
                                                                                    );
                                                                                return (
                                                                                    <span
                                                                                        key={
                                                                                            droit
                                                                                        }
                                                                                        className="px-2 py-1 bg-white text-[var(--primary-color)] rounded-full text-xs font-medium"
                                                                                    >
                                                                                        {rightInfo
                                                                                            ? rightInfo.label
                                                                                            : droit}
                                                                                    </span>
                                                                                );
                                                                            }
                                                                        )}
                                                                        {(!Array.isArray(
                                                                            type.droits
                                                                        ) ||
                                                                            type
                                                                                .droits
                                                                                .length ===
                                                                                0) && (
                                                                            <span className="text-xs italic text-gray-500">
                                                                                Aucun
                                                                                droit
                                                                                défini
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditTypeMember(
                                                                                    type
                                                                                )
                                                                            }
                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteTypeMember(
                                                                                    type
                                                                                )
                                                                            }
                                                                            className="text-red-600 transition-colors hover:text-red-800"
                                                                            title="Supprimer"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                            {filteredTypeMember.length ===
                                                0 && (
                                                <div className="py-8 text-center text-gray-500">
                                                    Aucun type de membre trouvé
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === "equipe" && (
                                <TeamManagement onStatsUpdate={handleStatsUpdate} onClose={() => setActiveModal(null)} />
                            )}

                            {activeModal === "gestionSite" && (
                                <SiteManagement 
                                    isOpen={true}
                                    onClose={() => setActiveModal(null)} 
                                />
                            )}

                            {activeModal === "droits" && (
                                <div className="space-y-6">
                                    {/* Header du modal de gestion des droits */}
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Shield className="w-6 h-6 text-[var(--primary-color)]" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    Gestion des Droits
                                                </h2>
                                                <p className="text-sm text-gray-600">
                                                    Configurez les permissions et accès des utilisateurs
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveModal(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {/* Liste des droits disponibles */}
                                    <div className="p-6 bg-white rounded-lg shadow">
                                        <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                                            <Shield className="w-5 h-5 text-[var(--primary-color)]" />
                                            Droits disponibles
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {availableRights.map((right) => (
                                                <div
                                                    key={right.id}
                                                    className="p-4 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-gray-900">
                                                            {right.label}
                                                        </h4>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                right.active
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {right.active
                                                                ? "Actif"
                                                                : "Inactif"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {right.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Attribution des droits */}
                                    <div className="p-6 bg-white rounded-lg shadow">
                                        <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                                            <Users className="w-5 h-5 text-[var(--primary-color)]" />
                                            Attribution des droits
                                        </h3>
                                        <div className="space-y-4">
                                            <button
                                                onClick={() =>
                                                    setActiveModal("typeMembre")
                                                }
                                                className="w-full bg-[var(--primary-color)] text-white px-4 py-3 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Gérer les types de membre
                                            </button>
                                            <p className="text-sm text-center text-gray-600">
                                                Les droits sont attribués via
                                                les types de membre. Cliquez sur
                                                le bouton ci-dessus pour gérer
                                                les types de membre et leurs
                                                droits associés.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modales vides pour les autres sections */}
                            {activeModal !== "bar" &&
                                activeModal !== "membre" &&
                                activeModal !== "typeMembre" &&
                                activeModal !== "equipe" &&
                                activeModal !== "droits" && (
                                    <div className="py-12 text-center">
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}




            {/* Modal de confirmation de suppression */}
            {showDeleteConfirm && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md bg-white rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer la boisson "
                                {drinkToDelete?.name}" ? Cette action est
                                irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
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

            {/* Modal Ajouter/Modifier membre */}
            {showMemberModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {memberModalMode === "add"
                                        ? "Ajouter un membre"
                                        : "Modifier le membre"}
                                </h3>
                                <button
                                    onClick={() => setShowMemberModal(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={memberFormData.nom}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                nom: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Nom"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        value={memberFormData.prenom}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                prenom: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Prénom"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <Mail className="inline mr-1 w-4 h-4" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={memberFormData.email}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="email@exemple.com"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <Phone className="inline mr-1 w-4 h-4" />
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={memberFormData.telephone}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                telephone: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <CreditCard className="inline mr-1 w-4 h-4" />
                                        N° Licence
                                    </label>
                                    <input
                                        type="text"
                                        value={memberFormData.numeroLicence}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                numeroLicence: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="LIC001"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <MapPin className="inline mr-1 w-4 h-4" />
                                        Adresse
                                    </label>
                                    <textarea
                                        value={memberFormData.adresse}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                adresse: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        rows="2"
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                        Date de naissance
                                    </label>
                                    <div className="flex items-center space-x-1">
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current
                                                        .dateNaissance
                                                )
                                                    dateRefs.current.dateNaissance =
                                                        {};
                                                dateRefs.current.dateNaissance.day =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="JJ"
                                            maxLength="2"
                                            value={
                                                dateComponents?.dateNaissance
                                                    ?.day || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateNaissance",
                                                    "day",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateNaissance",
                                                    "day"
                                                )
                                            }
                                            className={`w-12 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateNaissance
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        <span className="text-gray-500">/</span>
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current
                                                        .dateNaissance
                                                )
                                                    dateRefs.current.dateNaissance =
                                                        {};
                                                dateRefs.current.dateNaissance.month =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="MM"
                                            maxLength="2"
                                            value={
                                                dateComponents?.dateNaissance
                                                    ?.month || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateNaissance",
                                                    "month",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateNaissance",
                                                    "month"
                                                )
                                            }
                                            className={`w-12 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateNaissance
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        <span className="text-gray-500">/</span>
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current
                                                        .dateNaissance
                                                )
                                                    dateRefs.current.dateNaissance =
                                                        {};
                                                dateRefs.current.dateNaissance.year =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="AAAA"
                                            maxLength="4"
                                            value={
                                                dateComponents?.dateNaissance
                                                    ?.year || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateNaissance",
                                                    "year",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateNaissance",
                                                    "year"
                                                )
                                            }
                                            className={`w-16 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateNaissance
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {dateErrors.dateNaissance && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {dateErrors.dateNaissance}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                        Date d'entrée
                                    </label>
                                    <div className="flex items-center space-x-1">
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current.dateEntree
                                                )
                                                    dateRefs.current.dateEntree =
                                                        {};
                                                dateRefs.current.dateEntree.day =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="JJ"
                                            maxLength="2"
                                            value={
                                                dateComponents?.dateEntree
                                                    ?.day || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateEntree",
                                                    "day",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateEntree",
                                                    "day"
                                                )
                                            }
                                            className={`w-12 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateEntree
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        <span className="text-gray-500">/</span>
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current.dateEntree
                                                )
                                                    dateRefs.current.dateEntree =
                                                        {};
                                                dateRefs.current.dateEntree.month =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="MM"
                                            maxLength="2"
                                            value={
                                                dateComponents?.dateEntree
                                                    ?.month || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateEntree",
                                                    "month",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateEntree",
                                                    "month"
                                                )
                                            }
                                            className={`w-12 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateEntree
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        <span className="text-gray-500">/</span>
                                        <input
                                            ref={(el) => {
                                                if (
                                                    !dateRefs.current.dateEntree
                                                )
                                                    dateRefs.current.dateEntree =
                                                        {};
                                                dateRefs.current.dateEntree.year =
                                                    el;
                                            }}
                                            type="text"
                                            placeholder="AAAA"
                                            maxLength="4"
                                            value={
                                                dateComponents?.dateEntree
                                                    ?.year || ""
                                            }
                                            onChange={(e) =>
                                                handleDateComponentChange(
                                                    "dateEntree",
                                                    "year",
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleDateKeyDown(
                                                    e,
                                                    "dateEntree",
                                                    "year"
                                                )
                                            }
                                            className={`w-16 px-2 py-2 text-center border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent ${
                                                dateErrors.dateEntree
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {dateErrors.dateEntree && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {dateErrors.dateEntree}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Photo du membre
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex justify-center items-center w-full">
                                            <label className="flex flex-col justify-center items-center w-full h-32 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed transition-colors cursor-pointer hover:bg-gray-100">
                                                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                                                    <svg
                                                        className="mb-4 w-8 h-8 text-gray-500"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 20 16"
                                                    >
                                                        <path
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                                        />
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">
                                                            Cliquez pour
                                                            télécharger
                                                        </span>{" "}
                                                        ou glissez-déposez
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, JPEG (MAX.
                                                        5MB)
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleMemberImageChange
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {memberImagePreview && (
                                            <div className="relative">
                                                <img
                                                    src={memberImagePreview}
                                                    alt="Prévisualisation"
                                                    className="object-cover w-full h-32 rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMemberImagePreview(
                                                            null
                                                        );
                                                        setSelectedMemberImageFile(
                                                            null
                                                        );
                                                        setMemberFormData({
                                                            ...memberFormData,
                                                            photo: "",
                                                        });
                                                    }}
                                                    className="absolute top-2 right-2 p-1 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <Shield className="inline mr-1 w-4 h-4" />
                                        Type de membre
                                    </label>
                                    <select
                                        value={memberFormData.typeMembreId}
                                        onChange={(e) =>
                                            setMemberFormData({
                                                ...memberFormData,
                                                typeMembreId: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    >
                                        <option value="">
                                            Sélectionner un type
                                        </option>
                                        {memberTypes.map((type) => (
                                            <option
                                                key={type.id}
                                                value={type.id.toString()}
                                            >
                                                {type.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowMemberModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveMember}
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {memberModalMode === "add"
                                            ? "Ajouter"
                                            : "Modifier"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression membre */}
            {showMemberDeleteConfirm && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md bg-white rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowMemberDeleteConfirm(false)
                                    }
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le membre "
                                {memberToDelete?.prenom} {memberToDelete?.nom}"
                                ? Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() =>
                                        setShowMemberDeleteConfirm(false)
                                    }
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteMember}
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
    );
};

export default Admin;
