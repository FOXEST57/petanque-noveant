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
    Shield,
    Trash2,
    Trophy,
    UserPlus,
    Users,
    Wine,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDrinks } from "../contexts/DrinksContext";
import { eventsAPI, teamsAPI } from "../lib/api";
import { membersAPI } from "../lib/membersAPI";
import LotoManagement from "../components/LotoManagement";
import { formatDateToFrench, formatDateToISO, validateFrenchDate } from "../utils/dateUtils";
import { generateAvatar } from "../utils/avatarUtils";
import "../styles/animations.css";









const Admin = () => {
    const { drinks, addDrink, updateDrink, deleteDrink } = useDrinks();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        teams: 0,
        events: 0,
        drinks: 0,
        results: 0,
    });

    // État pour la gestion des modales
    const [activeModal, setActiveModal] = useState(null); // 'bar', 'membre', 'evenement', 'equipe', 'resultat'
    const [showBarModal, setShowBarModal] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add' ou 'edit'
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [drinkToDelete, setDrinkToDelete] = useState(null);

    // États pour la gestion des membres
    const [members, setMembers] = useState([]);

    const [memberTypes, setMemberTypes] = useState([]);

    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberModalMode, setMemberModalMode] = useState("add");
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");
    const [selectedMemberType, setSelectedMemberType] = useState("");
    const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] =
        useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [showTypeModal, setShowTypeModal] = useState(false);

    // États pour la gestion des types de membres
    const [showTypeMemberModal, setShowTypeMemberModal] = useState(false);
    const [typeMemberModalMode, setTypeMemberModalMode] = useState("add");
    const [selectedTypeMember, setSelectedTypeMember] = useState(null);
    const [typeMemberSearchTerm, setTypeMemberSearchTerm] = useState("");
    const [showTypeMemberDeleteConfirm, setShowTypeMemberDeleteConfirm] =
        useState(false);
    const [typeMemberToDelete, setTypeMemberToDelete] = useState(null);
    const [typeMemberFormData, setTypeMemberFormData] = useState({
        nom: "",
        description: "",
        droits: [],
    });

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

    // États pour la validation des dates
    const [dateErrors, setDateErrors] = useState({
        dateNaissance: "",
        dateEntree: "",
    });

    // États pour les composants de date séparés
    const [dateComponents, setDateComponents] = useState({
        dateNaissance: { day: "", month: "", year: "" },
        dateEntree: { day: "", month: "", year: "" },
    });
    const dateRefs = useRef({});
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        stock: 50,
    });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // États pour la gestion des photos de membres
    const [selectedMemberImageFile, setSelectedMemberImageFile] =
        useState(null);
    const [memberImagePreview, setMemberImagePreview] = useState(null);

    // États pour la gestion des concours
    const [showConcoursModal, setShowConcoursModal] = useState(false);
    const [concoursModalMode, setConcoursModalMode] = useState("add");
    const [selectedConcours, setSelectedConcours] = useState(null);
    const [concours, setConcours] = useState([]);
    const [concoursToDelete, setConcoursToDelete] = useState(null);
    const [showConcoursDeleteConfirm, setShowConcoursDeleteConfirm] =
        useState(false);
    const [concoursSearchTerm, setConcoursSearchTerm] = useState("");
    const [concoursFormData, setConcoursFormData] = useState({
        nom: "",
        date: "",
        description: "",
        prixInscription: "",
        prixAGagner: "",
        statut: "planifie",
    });

    // Variables calculées pour le filtrage
    const filteredConcours = concours.filter(
        (c) =>
            c.nom.toLowerCase().includes(concoursSearchTerm.toLowerCase()) ||
            c.description
                .toLowerCase()
                .includes(concoursSearchTerm.toLowerCase())
    );



    // États pour la gestion des lotos
    const [lotos, setLotos] = useState([]);
    const [lotoSearchTerm, setLotoSearchTerm] = useState("");

    // États pour la gestion des événements
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventModalMode, setEventModalMode] = useState("add");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showEventDeleteConfirm, setShowEventDeleteConfirm] = useState(false);
    const [eventSearchTerm, setEventSearchTerm] = useState("");
    const [eventFormData, setEventFormData] = useState({
        titre: "",
        date: "",
        heure: "",
        lieu: "",
        publicCible: "",
        description: "",
        photos: [],
    });
    const [selectedEventPhotos, setSelectedEventPhotos] = useState([]);
    const [eventPhotosPreviews, setEventPhotosPreviews] = useState([]);
    const [existingEventPhotos, setExistingEventPhotos] = useState([]);

    // Variables calculées pour le filtrage des événements
    const filteredEvents = events.filter(
        (e) =>
            (e.titre &&
                e.titre
                    .toLowerCase()
                    .includes(eventSearchTerm.toLowerCase())) ||
            (e.description &&
                e.description
                    .toLowerCase()
                    .includes(eventSearchTerm.toLowerCase()))
    );

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Variables calculées pour le filtrage des équipes
    const filteredTeams = teams.filter((team) => {
        const matchesSearch =
            (team.name &&
                team.name
                    .toLowerCase()
                    .includes(teamSearchTerm.toLowerCase())) ||
            (team.category &&
                team.category
                    .toLowerCase()
                    .includes(teamSearchTerm.toLowerCase())) ||
            (team.description &&
                team.description
                    .toLowerCase()
                    .includes(teamSearchTerm.toLowerCase()));

        const matchesCategory =
            selectedTeamCategory === "" ||
            team.category === selectedTeamCategory;

        return matchesSearch && matchesCategory;
    });

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

    // États pour la gestion de la page d'accueil
    const [homeContent, setHomeContent] = useState({
        title: "",
        description: "",
        carouselImages: [],
        openingHours: "",
        contact: "",
        practicalInfo: "",
    });
    const [originalHomeContent, setOriginalHomeContent] = useState({
        title: "",
        description: "",
        carouselImages: [],
        openingHours: "",
        contact: "",
        practicalInfo: "",
    });
    const [homeContentLoading, setHomeContentLoading] = useState(false);
    const [selectedCarouselFiles, setSelectedCarouselFiles] = useState([]);
    const [carouselPreviews, setCarouselPreviews] = useState([]);
    const [existingCarouselImages, setExistingCarouselImages] = useState([]);

    useEffect(() => {
        loadMembers(); // Les stats seront mises à jour automatiquement après le chargement des membres
        loadMemberTypes();
        loadEvents();
        loadTeams();
        loadHomeContent(); // Charger le contenu de la page d'accueil
    }, []);

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

            setStats((prevStats) => ({
                ...prevStats,
                users: membersData.length, // Utiliser les données des membres passées en paramètre
                teams: teamsCount,
                events: eventsCount,
                albums: 0, // TODO: Implémenter l'API des albums
                drinks: drinks.length,
                results: 0, // TODO: Implémenter l'API des résultats
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
                                "http://localhost:3001"
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

    const loadTeams = async () => {
        try {
            const teamsData = await teamsAPI.getAll();
            setTeams(teamsData || []);
        } catch (error) {
            console.error("Erreur lors du chargement des équipes:", error);
            toast.error("Erreur lors du chargement des équipes");
        }
    };

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

    // Fonctions de gestion du bar
    const handleAddDrink = () => {
        setModalMode("add");
        setFormData({
            name: "",
            price: "",
            description: "",
            image: "",
            stock: 50,
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        setShowBarModal(true);
    };

    const handleEditDrink = (drink) => {
        setModalMode("edit");
        setSelectedDrink(drink);
        setFormData({
            name: drink.name,
            price: drink.price.toString(),
            description: drink.description,
            image: drink.image_url,
            stock: drink.stock,
        });
        setSelectedImageFile(null);
        setImagePreview(drink.image_url);
        setShowBarModal(true);
    };

    const handleDeleteDrink = (drink) => {
        setDrinkToDelete(drink);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteDrink(drinkToDelete.id);
            setShowDeleteConfirm(false);
            setDrinkToDelete(null);
            toast.success("Boisson supprimée avec succès");
        } catch (error) {
            toast.error("Erreur lors de la suppression de la boisson");
        }
    };

    // Fonction pour gérer la sélection d'image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setSelectedImageFile(file);

                // Créer une prévisualisation
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                toast.error("Veuillez sélectionner un fichier image valide");
            }
        }
    };

    // Fonction pour gérer la sélection d'image de membre
    const handleMemberImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation du type de fichier
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedTypes.includes(file.type)) {
                toast.error(
                    "Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP."
                );
                e.target.value = ""; // Reset input
                return;
            }

            // Validation de la taille (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB en bytes
            if (file.size > maxSize) {
                toast.error("La taille du fichier ne doit pas dépasser 5MB.");
                e.target.value = ""; // Reset input
                return;
            }

            setSelectedMemberImageFile(file);

            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onload = (e) => {
                setMemberImagePreview(e.target.result);
            };
            reader.onerror = () => {
                toast.error("Erreur lors de la lecture du fichier.");
                setSelectedMemberImageFile(null);
                setMemberImagePreview(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeMemberPhoto = () => {
        setSelectedMemberImageFile(null);
        setMemberImagePreview(null);
        setMemberFormData({ ...memberFormData, photo: "" });
    };

    const handleSaveDrink = async () => {
        if (!formData.name || !formData.price) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            if (modalMode === "add") {
                const formDataToSend = new FormData();
                formDataToSend.append("name", formData.name);
                formDataToSend.append("price", formData.price);
                formDataToSend.append(
                    "description",
                    formData.description || ""
                );
                formDataToSend.append("stock", formData.stock || "50");

                // Ajouter la photo si elle existe
                if (selectedImageFile) {
                    formDataToSend.append("photo", selectedImageFile);
                }

                const response = await fetch("/api/drinks", {
                    method: "POST",
                    body: formDataToSend,
                });

                if (!response.ok) {
                    throw new Error("Erreur lors de la création de la boisson");
                }

                const newDrink = await response.json();
                addDrink(newDrink);
                toast.success("Boisson ajoutée avec succès");
            } else {
                // Mode édition : différencier selon la présence d'un fichier
                if (selectedImageFile) {
                    // S'il y a une nouvelle photo, utiliser la route upload
                    const formDataToSend = new FormData();
                    formDataToSend.append("name", formData.name);
                    formDataToSend.append("price", formData.price);
                    formDataToSend.append(
                        "description",
                        formData.description || ""
                    );
                    formDataToSend.append("stock", formData.stock || "50");
                    formDataToSend.append("photo", selectedImageFile);

                    const response = await fetch(
                        `/api/drinks/${selectedDrink.id}/upload`,
                        {
                            method: "PUT",
                            body: formDataToSend,
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Erreur lors de la modification de la boisson"
                        );
                    }
                } else {
                    // Pas de nouvelle photo, utiliser JSON
                    const jsonData = {
                        name: formData.name,
                        price: parseFloat(formData.price),
                        description: formData.description || "",
                        stock: parseInt(formData.stock) || 50,
                    };

                    const response = await fetch(
                        `/api/drinks/${selectedDrink.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(jsonData),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Erreur lors de la modification de la boisson"
                        );
                    }
                }

                // Utiliser le contexte pour mettre à jour
                await updateDrink(selectedDrink.id, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description || "",
                    stock: parseInt(formData.stock) || 50,
                });
                toast.success("Boisson modifiée avec succès");
            }

            setShowBarModal(false);
            setSelectedImageFile(null);
            setImagePreview(null);

            // Rester dans la section bar après la sauvegarde
            setActiveModal("bar");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la boisson:", error);
            toast.error("Erreur lors de la sauvegarde de la boisson");
        }
    };

    // Fonctions de gestion des membres
    const handleAddMember = () => {
        setMemberModalMode("add");
        const todayFormatted = formatDateToFrench(
            new Date().toISOString().split("T")[0]
        );
        setMemberFormData({
            nom: "",
            prenom: "",
            adresse: "",
            telephone: "",
            email: "",
            numeroLicence: "",
            dateEntree: todayFormatted,
            dateNaissance: "",
            typeMembreId: "",
            photo: "",
        });

        // Réinitialiser les états des photos
        setSelectedMemberImageFile(null);
        setMemberImagePreview(null);

        // Initialiser les composants de date
        const todayParts = todayFormatted.split("/");
        setDateComponents({
            dateNaissance: { day: "", month: "", year: "" },
            dateEntree: {
                day: todayParts[0] || "",
                month: todayParts[1] || "",
                year: todayParts[2] || "",
            },
        });

        setDateErrors({ dateNaissance: "", dateEntree: "" });
        setShowMemberModal(true);
    };

    const handleEditMember = (member) => {
        setMemberModalMode("edit");
        setSelectedMember(member);

        const dateEntreeFormatted = member.date_entree
            ? formatDateToFrench(member.date_entree)
            : "";
        const dateNaissanceFormatted = member.date_naissance
            ? formatDateToFrench(member.date_naissance)
            : "";

        setMemberFormData({
            nom: member.nom,
            prenom: member.prenom,
            adresse: member.adresse,
            telephone: member.telephone,
            email: member.email,
            numeroLicence: member.numero_licence || "",
            dateEntree: dateEntreeFormatted,
            dateNaissance: dateNaissanceFormatted,
            typeMembreId: member.type_membre_id
                ? member.type_membre_id.toString()
                : "",
            photo: member.photo_url || "",
        });

        // Gérer l'affichage de la photo existante
        setSelectedMemberImageFile(null);

        // Validation robuste de la photo_url avant de l'utiliser comme preview
        // Prévisualisation simple de la photo (chemin de fichier uniquement)
        if (
            member.photo_url &&
            (member.photo_url.startsWith("/uploads/") ||
                member.photo_url.startsWith("uploads/"))
        ) {
            // Construire l'URL complète pour servir la photo depuis le backend
            setMemberImagePreview(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3001"
                }/api/members/photos/${member.photo_url.split("/").pop()}`
            );
        } else {
            setMemberImagePreview(null);
        }

        // Initialiser les composants de date
        const dateEntreeParts = dateEntreeFormatted
            ? dateEntreeFormatted.split("/")
            : ["", "", ""];
        const dateNaissanceParts = dateNaissanceFormatted
            ? dateNaissanceFormatted.split("/")
            : ["", "", ""];

        setDateComponents({
            dateNaissance: {
                day: dateNaissanceParts[0] || "",
                month: dateNaissanceParts[1] || "",
                year: dateNaissanceParts[2] || "",
            },
            dateEntree: {
                day: dateEntreeParts[0] || "",
                month: dateEntreeParts[1] || "",
                year: dateEntreeParts[2] || "",
            },
        });

        setDateErrors({ dateNaissance: "", dateEntree: "" });
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

            // Recharger les données
            await loadMembers();
            setShowMemberDeleteConfirm(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            toast.error("Erreur lors de la suppression du membre");
        }
    };

    // Fonctions de gestion de la page d'accueil
    const loadHomeContent = async () => {
        try {
            setHomeContentLoading(true);
            console.log("Chargement du contenu de la page d'accueil...");
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3001"
                }/api/home-content`
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Réponse API complète:", result);
                const data = result.data; // L'API retourne { success: true, data: {...} }
                console.log("Données reçues:", data);
                console.log("Images du carrousel reçues:", data.carouselImages);

                const contentData = {
                    title: data.title || "",
                    description: data.description || "",
                    carouselImages: data.carouselImages || [], // Utiliser carouselImages de l'API
                    openingHours: data.openingHours || "", // Corriger le mapping
                    contact: data.contact || "",
                    practicalInfo: data.practicalInfo || "", // Mapper practicalInfo
                    location: data.location || "", // Ajouter le champ location
                    members: data.members || "", // Ajouter le champ members
                    clubTitle: data.clubTitle || "Découvrez notre club", // Ajouter le champ clubTitle
                    clubDescription: data.clubDescription || "", // Ajouter le champ clubDescription
                    teamsContent: data.teamsContent || "", // Ajouter le champ teamsContent
                    animationsContent: data.animationsContent || "", // Ajouter le champ animationsContent
                    tournamentsContent: data.tournamentsContent || "", // Ajouter le champ tournamentsContent
                };

                console.log("🔍 Mapping des champs:");
                console.log("  title:", data.title, "->", contentData.title);
                console.log(
                    "  description:",
                    data.description?.substring(0, 50),
                    "->",
                    contentData.description?.substring(0, 50)
                );
                console.log(
                    "  openingHours:",
                    data.openingHours,
                    "->",
                    contentData.openingHours
                );
                console.log(
                    "  contact:",
                    data.contact,
                    "->",
                    contentData.contact
                );
                console.log(
                    "  practicalInfo:",
                    data.practicalInfo,
                    "->",
                    contentData.practicalInfo
                );
                console.log(
                    "  location:",
                    data.location,
                    "->",
                    contentData.location
                );
                console.log(
                    "  members:",
                    data.members,
                    "->",
                    contentData.members
                );
                console.log(
                    "  carouselImages count:",
                    data.carouselImages?.length,
                    "->",
                    contentData.carouselImages?.length
                );

                console.log("Contenu formaté:", contentData);
                console.log(
                    "Images existantes à définir:",
                    data.carouselImages || []
                );
                console.log(
                    "🔥 SETTING existingCarouselImages to:",
                    data.carouselImages || []
                );

                setHomeContent(contentData);
                setOriginalHomeContent(contentData); // Stocker les valeurs originales
                setExistingCarouselImages(data.carouselImages || []);
                console.log(
                    "🔥 AFTER SETTING - existingCarouselImages should be:",
                    data.carouselImages || []
                );

                console.log("États mis à jour avec succès");
            } else {
                console.error(
                    "Erreur de réponse:",
                    response.status,
                    response.statusText
                );
                toast.error("Erreur lors du chargement du contenu");
            }
        } catch (error) {
            console.error(
                "Erreur lors du chargement du contenu de la page d'accueil:",
                error
            );
            toast.error("Erreur lors du chargement du contenu");
        } finally {
            setHomeContentLoading(false);
        }
    };

    const handleCarouselImagesChange = (e) => {
        try {
            console.log("🔄 handleCarouselImagesChange - DÉBUT");
            console.log("📊 Event:", e);
            console.log("📊 Target:", e?.target);
            console.log("📊 Files:", e?.target?.files);

            // Vérification ultra-sécurisée de l'événement
            if (!e) {
                console.log("❌ Événement null ou undefined");
                return;
            }

            if (!e.target) {
                console.log("❌ Target null ou undefined");
                return;
            }

            if (!e.target.files) {
                console.log("❌ Files null ou undefined");
                return;
            }

            if (e.target.files.length === 0) {
                console.log("⚠️ Aucun fichier sélectionné");
                return;
            }

            console.log("✅ Validation initiale réussie");

            // Conversion sécurisée en array
            let files;
            try {
                files = Array.from(e.target.files);
                console.log(
                    "✅ Conversion en array réussie:",
                    files.length,
                    "fichiers"
                );
            } catch (arrayError) {
                console.error("❌ Erreur conversion array:", arrayError);
                toast.error("Erreur lors de la lecture des fichiers");
                return;
            }

            // Validation des fichiers avec logs détaillés
            const validFiles = [];
            files.forEach((file, index) => {
                console.log(`📁 Fichier ${index + 1}:`, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                });

                const isImage = file.type.startsWith("image/");
                const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

                console.log(`🔍 Validation fichier ${index + 1}:`, {
                    isImage,
                    isValidSize,
                    valid: isImage && isValidSize,
                });

                if (isImage && isValidSize) {
                    validFiles.push(file);
                }
            });

            console.log("✅ Fichiers valides:", validFiles.length);

            if (validFiles.length === 0) {
                console.log("❌ Aucun fichier valide");
                toast.error("Aucun fichier image valide sélectionné (max 5MB)");
                return;
            }

            // Mise à jour des états avec gestion d'erreur
            try {
                console.log("🔄 Mise à jour selectedCarouselFiles...");
                setSelectedCarouselFiles(validFiles);
                console.log("✅ selectedCarouselFiles mis à jour");
            } catch (stateError) {
                console.error(
                    "❌ Erreur mise à jour selectedCarouselFiles:",
                    stateError
                );
                toast.error("Erreur lors de la sélection des fichiers");
                return;
            }

            // Création des prévisualisations avec approche ultra-sécurisée
            console.log("🔄 Création des prévisualisations...");
            const previews = new Array(validFiles.length).fill(null);
            let loadedCount = 0;
            let hasError = false;

            const processFile = (file, index) => {
                return new Promise((resolve, reject) => {
                    try {
                        console.log(
                            `📖 Lecture fichier ${index + 1}: ${file.name}`
                        );
                        const reader = new FileReader();

                        reader.onload = (readerEvent) => {
                            try {
                                console.log(
                                    `✅ Fichier ${index + 1} lu avec succès`
                                );
                                previews[index] = readerEvent.target.result;
                                resolve();
                            } catch (onloadError) {
                                console.error(
                                    `❌ Erreur onload fichier ${index + 1}:`,
                                    onloadError
                                );
                                reject(onloadError);
                            }
                        };

                        reader.onerror = (readerError) => {
                            console.error(
                                `❌ Erreur lecture fichier ${index + 1}:`,
                                readerError
                            );
                            reject(readerError);
                        };

                        reader.readAsDataURL(file);
                    } catch (readerCreateError) {
                        console.error(
                            `❌ Erreur création reader fichier ${index + 1}:`,
                            readerCreateError
                        );
                        reject(readerCreateError);
                    }
                });
            };

            // Traitement séquentiel des fichiers
            const processAllFiles = async () => {
                try {
                    for (let i = 0; i < validFiles.length; i++) {
                        await processFile(validFiles[i], i);
                        loadedCount++;
                        console.log(
                            `✅ Progression: ${loadedCount}/${validFiles.length}`
                        );
                    }

                    console.log(
                        "✅ Tous les fichiers traités, mise à jour des prévisualisations..."
                    );
                    setCarouselPreviews([...previews]);
                    console.log("✅ Prévisualisations mises à jour");

                    toast.success(
                        `${validFiles.length} image(s) sélectionnée(s) avec succès`
                    );
                    console.log(
                        "✅ handleCarouselImagesChange - SUCCÈS COMPLET"
                    );
                } catch (processError) {
                    console.error(
                        "❌ Erreur traitement fichiers:",
                        processError
                    );
                    toast.error("Erreur lors du traitement des images");
                    hasError = true;
                }
            };

            // Lancer le traitement
            processAllFiles();

            // Réinitialiser l'input de manière sécurisée
            try {
                if (e.target && e.target.value !== undefined) {
                    e.target.value = "";
                    console.log("✅ Input réinitialisé");
                }
            } catch (resetError) {
                console.error("❌ Erreur réinitialisation input:", resetError);
            }
        } catch (globalError) {
            console.error(
                "❌ ERREUR GLOBALE handleCarouselImagesChange:",
                globalError
            );
            console.error("❌ Stack trace:", globalError.stack);
            toast.error("Erreur critique lors de la sélection des images");

            // Réinitialisation d'urgence
            try {
                setSelectedCarouselFiles([]);
                setCarouselPreviews([]);
                if (e?.target) {
                    e.target.value = "";
                }
            } catch (emergencyError) {
                console.error(
                    "❌ Erreur réinitialisation d'urgence:",
                    emergencyError
                );
            }
        }
    };

    // Fonction pour gérer les changements de titre des images existantes
    const handleExistingImageTitleChange = (index, newTitle) => {
        const updatedImages = existingCarouselImages.map((image, i) =>
            i === index ? { ...image, title: newTitle } : image
        );
        setExistingCarouselImages(updatedImages);
        setHomeContent((prev) => ({
            ...prev,
            carouselImages: updatedImages,
        }));
    };

    const removeCarouselImage = (index, isExisting = false) => {
        if (isExisting) {
            const updatedExisting = existingCarouselImages.filter(
                (_, i) => i !== index
            );
            setExistingCarouselImages(updatedExisting);
            setHomeContent((prev) => ({
                ...prev,
                carouselImages: updatedExisting,
            }));
        } else {
            const updatedFiles = selectedCarouselFiles.filter(
                (_, i) => i !== index
            );
            const updatedPreviews = carouselPreviews.filter(
                (_, i) => i !== index
            );
            setSelectedCarouselFiles(updatedFiles);
            setCarouselPreviews(updatedPreviews);
        }
    };

    const moveCarouselImage = (index, direction, isExisting = false) => {
        if (isExisting) {
            const images = [...existingCarouselImages];
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex >= 0 && newIndex < images.length) {
                // Échanger les positions
                [images[index], images[newIndex]] = [
                    images[newIndex],
                    images[index],
                ];

                // Mettre à jour les display_order
                images.forEach((img, idx) => {
                    img.display_order = idx + 1;
                });

                setExistingCarouselImages(images);
                setHomeContent((prev) => ({
                    ...prev,
                    carouselImages: images,
                }));
            }
        } else {
            const files = [...selectedCarouselFiles];
            const previews = [...carouselPreviews];
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex >= 0 && newIndex < files.length) {
                // Échanger les positions dans les deux tableaux
                [files[index], files[newIndex]] = [
                    files[newIndex],
                    files[index],
                ];
                [previews[index], previews[newIndex]] = [
                    previews[newIndex],
                    previews[index],
                ];

                setSelectedCarouselFiles(files);
                setCarouselPreviews(previews);
            }
        }
    };

    const validateHomeContent = () => {
        if (!homeContent.title.trim()) {
            toast.error("Le titre est obligatoire");
            return false;
        }
        if (!homeContent.description.trim()) {
            toast.error("La description est obligatoire");
            return false;
        }
        return true;
    };

    const handleSaveHomeContent = async () => {
        try {
            setHomeContentLoading(true);
            console.log(
                "🔄 Début de la sauvegarde du contenu de la page d'accueil"
            );
            console.log("📊 État actuel:", {
                homeContent,
                originalHomeContent,
                existingCarouselImages,
                selectedCarouselFiles: selectedCarouselFiles.length,
            });

            // Identifier les champs modifiés
            const changedFields = [];
            const formData = new FormData();

            // Vérifier chaque champ texte avec logs détaillés
            console.log("🔍 Comparaison des champs:");
            console.log("Titre actuel:", homeContent.title);
            console.log("Titre original:", originalHomeContent.title);
            console.log(
                "Titre différent?",
                homeContent.title !== originalHomeContent.title
            );

            if (homeContent.title !== originalHomeContent.title) {
                formData.append("title", homeContent.title);
                changedFields.push("titre");
                console.log("✏️ Titre modifié:", homeContent.title);
            }

            console.log(
                "Description actuelle:",
                homeContent.description?.substring(0, 50)
            );
            console.log(
                "Description originale:",
                originalHomeContent.description?.substring(0, 50)
            );
            console.log(
                "Description différente?",
                homeContent.description !== originalHomeContent.description
            );

            if (homeContent.description !== originalHomeContent.description) {
                formData.append("description", homeContent.description);
                changedFields.push("description");
                console.log(
                    "✏️ Description modifiée:",
                    homeContent.description.substring(0, 50) + "..."
                );
            }

            console.log("Horaires actuels:", homeContent.openingHours);
            console.log(
                "Horaires originaux:",
                originalHomeContent.openingHours
            );
            console.log(
                "Horaires différents?",
                homeContent.openingHours !== originalHomeContent.openingHours
            );

            if (homeContent.openingHours !== originalHomeContent.openingHours) {
                formData.append("openingHours", homeContent.openingHours);
                changedFields.push("horaires d'ouverture");
                console.log("✏️ Horaires modifiés:", homeContent.openingHours);
            }

            console.log("Contact actuel:", homeContent.contact);
            console.log("Contact original:", originalHomeContent.contact);
            console.log(
                "Contact différent?",
                homeContent.contact !== originalHomeContent.contact
            );

            if (homeContent.contact !== originalHomeContent.contact) {
                formData.append("contact", homeContent.contact);
                changedFields.push("contact");
                console.log("✏️ Contact modifié:", homeContent.contact);
            }

            console.log(
                "Infos pratiques actuelles:",
                homeContent.practicalInfo?.substring(0, 50)
            );
            console.log(
                "Infos pratiques originales:",
                originalHomeContent.practicalInfo?.substring(0, 50)
            );
            console.log(
                "Infos pratiques différentes?",
                homeContent.practicalInfo !== originalHomeContent.practicalInfo
            );

            if (
                homeContent.practicalInfo !== originalHomeContent.practicalInfo
            ) {
                formData.append("practicalInfo", homeContent.practicalInfo);
                changedFields.push("informations pratiques");
                console.log(
                    "✏️ Infos pratiques modifiées:",
                    homeContent.practicalInfo.substring(0, 50) + "..."
                );
            }

            console.log("Localisation actuelle:", homeContent.location);
            console.log(
                "Localisation originale:",
                originalHomeContent.location
            );
            console.log(
                "Localisation différente?",
                homeContent.location !== originalHomeContent.location
            );

            if (homeContent.location !== originalHomeContent.location) {
                formData.append("location", homeContent.location);
                changedFields.push("localisation");
                console.log("✏️ Localisation modifiée:", homeContent.location);
            }

            console.log("Membres actuels:", homeContent.members);
            console.log("Membres originaux:", originalHomeContent.members);
            console.log(
                "Membres différents?",
                homeContent.members !== originalHomeContent.members
            );

            if (homeContent.members !== originalHomeContent.members) {
                formData.append("members", homeContent.members);
                changedFields.push("membres");
                console.log("✏️ Membres modifiés:", homeContent.members);
            }

            console.log("Titre du club actuel:", homeContent.clubTitle);
            console.log(
                "Titre du club original:",
                originalHomeContent.clubTitle
            );
            console.log(
                "Titre du club différent?",
                homeContent.clubTitle !== originalHomeContent.clubTitle
            );

            if (homeContent.clubTitle !== originalHomeContent.clubTitle) {
                formData.append("clubTitle", homeContent.clubTitle);
                changedFields.push("titre du club");
                console.log("✏️ Titre du club modifié:", homeContent.clubTitle);
            }

            console.log(
                "Description du club actuelle:",
                homeContent.clubDescription
            );
            console.log(
                "Description du club originale:",
                originalHomeContent.clubDescription
            );
            console.log(
                "Description du club différente?",
                homeContent.clubDescription !==
                    originalHomeContent.clubDescription
            );

            if (
                homeContent.clubDescription !==
                originalHomeContent.clubDescription
            ) {
                formData.append("clubDescription", homeContent.clubDescription);
                changedFields.push("description du club");
                console.log(
                    "✏️ Description du club modifiée:",
                    homeContent.clubDescription
                );
            }

            console.log("Contenu équipes actuel:", homeContent.teamsContent);
            console.log(
                "Contenu équipes original:",
                originalHomeContent.teamsContent
            );
            console.log(
                "Contenu équipes différent?",
                homeContent.teamsContent !== originalHomeContent.teamsContent
            );

            if (homeContent.teamsContent !== originalHomeContent.teamsContent) {
                formData.append("teamsContent", homeContent.teamsContent);
                changedFields.push("contenu équipes");
                console.log(
                    "✏️ Contenu équipes modifié:",
                    homeContent.teamsContent
                );
            }

            console.log(
                "Contenu animations actuel:",
                homeContent.animationsContent
            );
            console.log(
                "Contenu animations original:",
                originalHomeContent.animationsContent
            );
            console.log(
                "Contenu animations différent?",
                homeContent.animationsContent !==
                    originalHomeContent.animationsContent
            );

            if (
                homeContent.animationsContent !==
                originalHomeContent.animationsContent
            ) {
                formData.append(
                    "animationsContent",
                    homeContent.animationsContent
                );
                changedFields.push("contenu animations");
                console.log(
                    "✏️ Contenu animations modifié:",
                    homeContent.animationsContent
                );
            }

            console.log(
                "Contenu tournois actuel:",
                homeContent.tournamentsContent
            );
            console.log(
                "Contenu tournois original:",
                originalHomeContent.tournamentsContent
            );
            console.log(
                "Contenu tournois différent?",
                homeContent.tournamentsContent !==
                    originalHomeContent.tournamentsContent
            );

            if (
                homeContent.tournamentsContent !==
                originalHomeContent.tournamentsContent
            ) {
                formData.append(
                    "tournamentsContent",
                    homeContent.tournamentsContent
                );
                changedFields.push("contenu tournois");
                console.log(
                    "✏️ Contenu tournois modifié:",
                    homeContent.tournamentsContent
                );
            }

            // Gérer les images du carrousel
            let hasImageChanges = false;

            // Vérifier si les titres des images existantes ont été modifiés
            const titlesChanged = existingCarouselImages.some((img, index) => {
                const originalImg = originalHomeContent.carouselImages[index];
                return originalImg && img.title !== originalImg.title;
            });

            if (titlesChanged) {
                hasImageChanges = true;
                changedFields.push("titres des images du carrousel");
                console.log("✏️ Titres des images modifiés");
            }

            // Si des images existantes ont été supprimées
            if (
                existingCarouselImages.length <
                originalHomeContent.carouselImages.length
            ) {
                hasImageChanges = true;
                changedFields.push("images du carrousel (suppression)");
                console.log(
                    "🗑️ Images supprimées. Avant:",
                    originalHomeContent.carouselImages.length,
                    "Après:",
                    existingCarouselImages.length
                );
            }

            // Si de nouvelles images ont été ajoutées
            console.log("🖼️ Vérification des nouvelles images:");
            console.log(
                "Nombre de fichiers sélectionnés:",
                selectedCarouselFiles.length
            );
            console.log(
                "Fichiers sélectionnés:",
                selectedCarouselFiles.map((f) => ({
                    name: f.name,
                    size: f.size,
                }))
            );

            if (selectedCarouselFiles.length > 0) {
                selectedCarouselFiles.forEach((file, index) => {
                    formData.append("carouselImages", file);
                    console.log(
                        `📷 Nouvelle image ${index + 1}:`,
                        file.name,
                        file.size,
                        "bytes"
                    );
                });
                hasImageChanges = true;
                changedFields.push("images du carrousel (ajout)");
                console.log("✅ Images ajoutées au FormData");
            } else {
                console.log("⚠️ Aucune nouvelle image à ajouter");
            }

            // Si aucun changement n'a été détecté
            if (changedFields.length === 0 && !hasImageChanges) {
                console.log("⚠️ Aucune modification détectée");
                toast.info("Aucune modification détectée");
                setHomeContentLoading(false);
                return;
            }

            // Envoyer existingImages si des images ont été supprimées ou si les titres ont été modifiés
            if (
                existingCarouselImages.length !==
                    originalHomeContent.carouselImages.length ||
                titlesChanged
            ) {
                formData.append(
                    "existingImages",
                    JSON.stringify(existingCarouselImages)
                );
                console.log(
                    "🔄 Ajout des images existantes car des images ont été supprimées ou des titres modifiés"
                );
            }

            console.log(
                "📤 Envoi des données à l'API. Champs modifiés:",
                changedFields
            );
            const apiUrl = `${
                import.meta.env.VITE_API_URL || "http://localhost:3001"
            }/api/home-content`;
            console.log("🌐 URL API:", apiUrl);

            // Afficher le contenu du FormData pour debug
            console.log("📋 Contenu du FormData:");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(
                        `  ${key}: [FILE] ${value.name} (${value.size} bytes)`
                    );
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            const response = await fetch(apiUrl, {
                method: "PUT",
                body: formData,
            });

            console.log(
                "📥 Réponse API reçue. Status:",
                response.status,
                response.statusText
            );
            console.log(
                "📥 Headers de réponse:",
                Object.fromEntries(response.headers.entries())
            );

            if (response.ok) {
                const result = await response.json();
                console.log("✅ Réponse API complète:", result);

                if (!result.success) {
                    throw new Error(
                        result.message || "Erreur inconnue de l'API"
                    );
                }

                const updatedData = result.data;
                console.log("📊 Données mises à jour reçues:", updatedData);

                const newContentData = {
                    title: updatedData.title || "",
                    description: updatedData.description || "",
                    carouselImages:
                        updatedData.carousel_images ||
                        updatedData.carouselImages ||
                        [],
                    openingHours:
                        updatedData.opening_hours ||
                        updatedData.openingHours ||
                        "",
                    contact: updatedData.contact || "",
                    practicalInfo:
                        updatedData.practical_info ||
                        updatedData.practicalInfo ||
                        "",
                };

                console.log("🔄 Mise à jour des états avec:", newContentData);

                // Recharger les données depuis la base pour s'assurer d'avoir les dernières images
                console.log("🔄 Rechargement des données depuis la base...");
                await loadHomeContent();

                setSelectedCarouselFiles([]);
                setCarouselPreviews([]);

                // Message de confirmation personnalisé
                const changedFieldsText = changedFields.join(", ");
                toast.success(
                    `Éléments mis à jour avec succès : ${changedFieldsText}`
                );
                console.log("✅ Sauvegarde terminée avec succès");
                setActiveModal(null);
            } else {
                const errorText = await response.text();
                console.error(
                    "❌ Erreur HTTP:",
                    response.status,
                    response.statusText
                );
                console.error("❌ Détails de l'erreur:", errorText);
                throw new Error(
                    `Erreur ${response.status}: ${response.statusText}. ${errorText}`
                );
            }
        } catch (error) {
            console.error("❌ Erreur lors de la sauvegarde du contenu:", error);
            toast.error(`Erreur lors de la sauvegarde: ${error.message}`);
        } finally {
            setHomeContentLoading(false);
            console.log("🏁 Fin de la fonction handleSaveHomeContent");
        }
    };

    const handleCancelHomeContent = () => {
        // Réinitialiser avec les valeurs originales
        setHomeContent({
            title: originalHomeContent.title,
            description: originalHomeContent.description,
            carouselImages: originalHomeContent.carouselImages,
            openingHours: originalHomeContent.openingHours,
            contact: originalHomeContent.contact,
            practicalInfo: originalHomeContent.practicalInfo,
            location: originalHomeContent.location,
            members: originalHomeContent.members,
            clubTitle: originalHomeContent.clubTitle,
            clubDescription: originalHomeContent.clubDescription,
            teamsContent: originalHomeContent.teamsContent,
            animationsContent: originalHomeContent.animationsContent,
            tournamentsContent: originalHomeContent.tournamentsContent,
        });
        setSelectedCarouselFiles([]);
        setCarouselPreviews([]);
        setExistingCarouselImages(originalHomeContent.carouselImages);
        setActiveModal(null);
    };

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
            await loadStats();
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
        if (!validateTeamForm()) return;

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
            await loadStats();
            setShowTeamModal(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'équipe:", error);
            toast.error("Erreur lors de la sauvegarde de l'équipe");
        }
    };

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

    // Fonctions de gestion des concours
    const handleAddConcours = () => {
        setConcoursModalMode("add");
        setSelectedConcours(null);
        setConcoursFormData({
            nom: "",
            date: "",
            description: "",
            prixInscription: "",
            prixAGagner: "",
            statut: "planifie",
        });
        setShowConcoursModal(true);
    };

    const handleEditConcours = (concours) => {
        setConcoursModalMode("edit");
        setSelectedConcours(concours);
        setConcoursFormData({
            nom: concours.nom,
            date: concours.date,
            description: concours.description,
            prixInscription: concours.prixInscription.toString(),
            prixAGagner: concours.prixAGagner.toString(),
            statut: concours.statut,
        });
        setShowConcoursModal(true);
    };

    const handleDeleteConcours = (concours) => {
        setConcoursToDelete(concours);
        setShowConcoursDeleteConfirm(true);
    };

    const confirmDeleteConcours = () => {
        setConcours(concours.filter((c) => c.id !== concoursToDelete.id));
        setShowConcoursDeleteConfirm(false);
        setConcoursToDelete(null);
        toast.success("Concours supprimé avec succès");
    };

    const handleSaveConcours = () => {
        if (!concoursFormData.nom.trim() || !concoursFormData.date) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const concoursData = {
            ...concoursFormData,
            prixInscription: parseFloat(concoursFormData.prixInscription) || 0,
            prixAGagner: parseFloat(concoursFormData.prixAGagner) || 0,
        };

        if (concoursModalMode === "add") {
            const newConcours = {
                ...concoursData,
                id: Math.max(...concours.map((c) => c.id), 0) + 1,
            };
            setConcours([...concours, newConcours]);
            toast.success("Concours ajouté avec succès");
        } else {
            setConcours(
                concours.map((c) =>
                    c.id === selectedConcours.id
                        ? { ...concoursData, id: selectedConcours.id }
                        : c
                )
            );
            toast.success("Concours modifié avec succès");
        }

        setShowConcoursModal(false);
    };



    // Fonctions de gestion des événements
    const handleAddEvent = () => {
        // Ouvrir directement le modal principal des événements ET le modal d'ajout
        setActiveModal("evenement");
        setEventModalMode("add");
        setSelectedEvent(null);
        setEventFormData({
            titre: "",
            date: "",
            heure: "",
            lieu: "",
            publicCible: "",
            description: "",
            photos: [],
        });
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
        setShowEventModal(true);
    };

    const handleEditEvent = async (event) => {
        // Ouvrir directement le modal principal des événements ET le modal de modification
        setActiveModal("evenement");
        setEventModalMode("edit");
        setSelectedEvent(event);
        setEventFormData({
            titre: event.titre || event.title, // Support des deux formats
            date: event.date,
            heure: event.heure || "",
            lieu: event.lieu || "",
            publicCible: event.publicCible || "",
            description: event.description,
            photos: [],
        });
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);

        // Charger les photos existantes
        try {
            const response = await fetch(`/api/events/${event.id}/photos`);
            if (response.ok) {
                const photos = await response.json();
                setExistingEventPhotos(photos);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des photos:", error);
        }

        setShowEventModal(true);
    };

    const handleDeleteEvent = (event) => {
        // Ouvrir directement le modal principal des événements ET le modal de suppression
        setActiveModal("evenement");
        setEventToDelete(event);
        setShowEventDeleteConfirm(true);
    };

    const confirmDeleteEvent = async () => {
        try {
            await eventsAPI.delete(eventToDelete.id);
            toast.success("Événement supprimé avec succès");

            // Recharger les événements et les statistiques
            await loadEvents();
            await loadStats();
        } catch (error) {
            console.error(
                "Erreur lors de la suppression de l'événement:",
                error
            );
            toast.error("Erreur lors de la suppression de l'événement");
        }

        setShowEventDeleteConfirm(false);
        setEventToDelete(null);
    };

    const handleEventPhotosChange = (e) => {
        const files = Array.from(e.target.files);

        // Vérifier le nombre total de photos (existantes + nouvelles + déjà sélectionnées)
        const totalPhotos =
            (existingEventPhotos?.length || 0) +
            selectedEventPhotos.length +
            files.length;
        if (totalPhotos > 10) {
            toast.error(
                `Vous ne pouvez avoir que 10 photos maximum au total. Actuellement: ${
                    (existingEventPhotos?.length || 0) +
                    selectedEventPhotos.length
                } photos.`
            );
            return;
        }

        if (files.length > 0) {
            const validFiles = files.filter((file) => {
                if (!file.type.startsWith("image/")) {
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    // 5MB limit
                    toast.error(
                        `Le fichier ${file.name} est trop volumineux (max 5MB)`
                    );
                    return false;
                }
                return true;
            });

            if (validFiles.length !== files.length) {
                toast.error(
                    "Seuls les fichiers image de moins de 5MB sont acceptés"
                );
            }

            // Ajouter les nouvelles photos aux existantes au lieu de les remplacer
            setSelectedEventPhotos((prev) => [...prev, ...validFiles]);

            // Créer les prévisualisations pour les nouvelles photos
            const previews = [];
            validFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previews.push({
                        file: file,
                        preview: e.target.result,
                        name: file.name,
                    });
                    if (previews.length === validFiles.length) {
                        setEventPhotosPreviews((prev) => [
                            ...prev,
                            ...previews,
                        ]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        // Réinitialiser l'input pour permettre de nouveaux ajouts
        e.target.value = "";
    };

    const removeEventPhoto = (index) => {
        setEventPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
        if (index < selectedEventPhotos.length) {
            setSelectedEventPhotos((prev) =>
                prev.filter((_, i) => i !== index)
            );
        }
    };

    const deleteExistingEventPhoto = async (photoId) => {
        if (!selectedEvent) return;

        try {
            await fetch(`/api/events/${selectedEvent.id}/photos/${photoId}`, {
                method: "DELETE",
            });

            // Recharger les photos de l'événement
            const response = await fetch(
                `/api/events/${selectedEvent.id}/photos`
            );
            const photos = await response.json();
            setExistingEventPhotos(photos);

            toast.success("Photo supprimée avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression de la photo:", error);
            toast.error("Erreur lors de la suppression de la photo");
        }
    };

    const handleSaveEvent = async () => {
        if (!eventFormData.titre.trim() || !eventFormData.date) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const eventData = {
            ...eventFormData,
            photos: [], // On ne stocke plus les photos en base64
        };

        try {
            let eventId;
            if (eventModalMode === "add") {
                const newEvent = await eventsAPI.create(eventData);
                eventId = newEvent.id;
                toast.success("Événement ajouté avec succès");
            } else {
                await eventsAPI.update(selectedEvent.id, eventData);
                eventId = selectedEvent.id;
                toast.success("Événement modifié avec succès");
            }

            // Upload des photos si il y en a
            if (selectedEventPhotos.length > 0) {
                const formData = new FormData();
                selectedEventPhotos.forEach((file) => {
                    formData.append("photos", file);
                });

                try {
                    await fetch(`/api/events/${eventId}/photos`, {
                        method: "POST",
                        body: formData,
                    });
                    toast.success("Photos uploadées avec succès");
                } catch (photoError) {
                    console.error(
                        "Erreur lors de l'upload des photos:",
                        photoError
                    );
                    toast.error("Erreur lors de l'upload des photos");
                }
            }

            // Recharger les événements et les statistiques
            await loadEvents();
            await loadStats();
        } catch (error) {
            console.error(
                "Erreur lors de la sauvegarde de l'événement:",
                error
            );
            toast.error("Erreur lors de la sauvegarde de l'événement");
        }

        setShowEventModal(false);
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
    };

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

    const handleAdjustStock = async (drinkId, change) => {
        const drink = drinks.find((d) => d.id === drinkId);
        if (drink) {
            const newStock = Math.max(0, drink.stock + change);
            try {
                await updateDrink(drinkId, { ...drink, stock: newStock });
            } catch (error) {
                toast.error("Erreur lors de la mise à jour du stock");
            }
        }
    };

    const filteredDrinks = drinks.filter((drink) => {
        const matchesSearch = drink.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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
                className="p-6 bg-white rounded-lg shadow-md transition-all duration-200 transform cursor-pointer hover:shadow-lg hover:scale-105"
                onClick={handleCardClick}
                style={{ pointerEvents: "auto" }}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[var(--primary-color)] bg-opacity-10 rounded-lg">
                            <Icon className="w-6 h-6 text-[var(--primary-color)]" />
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
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--primary-color)]">
                            {count}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center py-2">
                    <span className="text-sm text-[var(--primary-color)] font-medium">
                        Cliquer pour gérer →
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary-color)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">
                        Administration
                    </h1>
                    <p className="text-lg text-gray-600">
                        Gérez tous les aspects de votre club de pétanque depuis
                        cette interface centralisée
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ManagementCard
                        title="Page d'Accueil"
                        icon={Home}
                        count={1}
                        description="Gestion du contenu de la page d'accueil"
                        modalKey="pageAccueil"
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
                        modalKey="loto"
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
                    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slideIn">
                        {/* Header de la modale */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeModal === "pageAccueil" &&
                                    "Gestion de la Page d'Accueil"}
                                {activeModal === "bar" && "Gestion du Bar"}
                                {activeModal === "membre" &&
                                    "Gestion des Membres"}
                                {activeModal === "typeMembre" &&
                                    "Gestion des Types de Membre"}
                                {activeModal === "droits" &&
                                    "Gestion des Droits"}
                                {activeModal === "evenement" &&
                                    "Gestion des Événements"}
                                {activeModal === "equipe" &&
                                    "Gestion des Équipes"}
                                {activeModal === "resultat" &&
                                    "Gestion des Résultats"}

                                {activeModal === "concours" &&
                                    "Gestion des Concours"}
                                {activeModal === "loto" && "Gestion des Lotos"}
                            </h2>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Contenu de la modale */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {activeModal === "pageAccueil" && (
                                <div className="space-y-6">
                                    {console.log(
                                        "🏠 MODAL PAGE ACCUEIL OUVERTE - existingCarouselImages:",
                                        existingCarouselImages,
                                        "length:",
                                        existingCarouselImages?.length
                                    ) || null}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center mb-2 space-x-2">
                                            <Home className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-blue-900">
                                                Configuration de la Page
                                                d'Accueil
                                            </h3>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            Gérez le contenu principal de votre
                                            page d'accueil : titre, description,
                                            images du carrousel et sections
                                            d'information.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-white rounded-lg border border-gray-200">
                                            <h4 className="mb-4 text-lg font-semibold text-gray-900">
                                                Contenu Principal
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                                        Titre Principal
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Bienvenue au Club de Pétanque"
                                                        value={
                                                            homeContent.title ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setHomeContent(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    title: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                                        Sous-titre
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Description de votre club de pétanque..."
                                                        value={
                                                            homeContent.description ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setHomeContent(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    description:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white rounded-lg border border-gray-200">
                                            <h4 className="mb-4 text-lg font-semibold text-gray-900">
                                                Carrousel d'Images
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="p-6 text-center rounded-lg border-2 border-gray-300 border-dashed">
                                                    <Camera className="mx-auto mb-2 w-12 h-12 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-600">
                                                        Glissez vos images ici
                                                        ou cliquez pour
                                                        sélectionner
                                                    </p>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={
                                                            handleCarouselImagesChange
                                                        }
                                                        className="hidden"
                                                        id="carousel-images"
                                                    />
                                                    <label
                                                        htmlFor="carousel-images"
                                                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors text-sm cursor-pointer inline-block"
                                                    >
                                                        Choisir des images
                                                    </label>
                                                </div>

                                                {/* Images existantes */}
                                                {console.log(
                                                    "🔍 DEBUG - existingCarouselImages:",
                                                    existingCarouselImages
                                                ) || true}
                                                {existingCarouselImages.length >
                                                    0 && (
                                                    <div className="mb-6">
                                                        <h4 className="flex items-center mb-3 text-sm font-medium text-gray-700">
                                                            <span className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            Images actuelles (
                                                            {
                                                                existingCarouselImages.length
                                                            }
                                                            )
                                                        </h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {existingCarouselImages.map(
                                                                (
                                                                    image,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`existing-${
                                                                            image.id ||
                                                                            index
                                                                        }`}
                                                                        className="flex flex-col gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-[120px]"
                                                                    >
                                                                        {/* Position */}
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="mb-1 text-xs font-medium text-gray-500">
                                                                                Position
                                                                            </span>
                                                                            <span className="bg-blue-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[28px] text-center">
                                                                                {index +
                                                                                    1}
                                                                            </span>
                                                                        </div>

                                                                        {/* Image */}
                                                                        <div className="relative">
                                                                            <img
                                                                                src={`${
                                                                                    import.meta
                                                                                        .env
                                                                                        .VITE_API_URL ||
                                                                                    "http://localhost:3001"
                                                                                }/${
                                                                                    image.image_url
                                                                                }`}
                                                                                alt={`Carrousel ${
                                                                                    index +
                                                                                    1
                                                                                }`}
                                                                                className="object-cover w-20 h-20 rounded-lg border-2 border-blue-200"
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    e.target.src =
                                                                                        "https://via.placeholder.com/150x80?text=Image+non+trouvée";
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        {/* Contrôles de position */}
                                                                        <div className="flex flex-col gap-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    moveCarouselImage(
                                                                                        index,
                                                                                        "up",
                                                                                        true
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    index ===
                                                                                    0
                                                                                }
                                                                                className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                                                title="Monter"
                                                                            >
                                                                                <ChevronUp className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    moveCarouselImage(
                                                                                        index,
                                                                                        "down",
                                                                                        true
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    index ===
                                                                                    existingCarouselImages.length -
                                                                                        1
                                                                                }
                                                                                className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                                                title="Descendre"
                                                                            >
                                                                                <ChevronDown className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Bouton supprimer */}
                                                                        <div>
                                                                            <button
                                                                                onClick={() =>
                                                                                    removeCarouselImage(
                                                                                        index,
                                                                                        true
                                                                                    )
                                                                                }
                                                                                className="flex justify-center items-center w-8 h-8 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                                                                                title="Supprimer cette image"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Input titre */}
                                                                        <div className="mt-2 w-full">
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    image.title ||
                                                                                    `Image ${
                                                                                        index +
                                                                                        1
                                                                                    }`
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const updatedImages =
                                                                                        [
                                                                                            ...existingCarouselImages,
                                                                                        ];
                                                                                    updatedImages[
                                                                                        index
                                                                                    ] =
                                                                                        {
                                                                                            ...updatedImages[
                                                                                                index
                                                                                            ],
                                                                                            title: e
                                                                                                .target
                                                                                                .value,
                                                                                        };
                                                                                    setExistingCarouselImages(
                                                                                        updatedImages
                                                                                    );
                                                                                }}
                                                                                className="px-2 py-1 w-full text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                                placeholder="Titre de l'image"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Nouvelles images */}
                                                {carouselPreviews.length >
                                                    0 && (
                                                    <div className="mb-4">
                                                        <h4 className="flex items-center mb-3 text-sm font-medium text-gray-700">
                                                            <span className="mr-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                                            Nouvelles images (
                                                            {
                                                                carouselPreviews.length
                                                            }
                                                            )
                                                        </h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {carouselPreviews.map(
                                                                (
                                                                    preview,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`new-${index}`}
                                                                        className="flex flex-col gap-2 items-center p-3 bg-green-50 rounded-lg border border-gray-200 min-w-[120px]"
                                                                    >
                                                                        {/* Position */}
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="mb-1 text-xs font-medium text-gray-500">
                                                                                Position
                                                                            </span>
                                                                            <span className="bg-green-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[28px] text-center">
                                                                                {existingCarouselImages.length +
                                                                                    index +
                                                                                    1}
                                                                            </span>
                                                                        </div>

                                                                        {/* Image */}
                                                                        <div className="relative">
                                                                            <img
                                                                                src={
                                                                                    preview
                                                                                }
                                                                                alt={`Nouveau ${
                                                                                    index +
                                                                                    1
                                                                                }`}
                                                                                className="object-cover w-20 h-20 rounded-lg border-2 border-green-200"
                                                                            />
                                                                            {selectedCarouselFiles[
                                                                                index
                                                                            ] && (
                                                                                <div className="absolute top-1 right-1 px-1 text-xs text-white bg-black bg-opacity-50 rounded">
                                                                                    {Math.round(
                                                                                        selectedCarouselFiles[
                                                                                            index
                                                                                        ]
                                                                                            .size /
                                                                                            1024
                                                                                    )}
                                                                                    KB
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Contrôles de position */}
                                                                        <div className="flex flex-col gap-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    moveCarouselImage(
                                                                                        index,
                                                                                        "up",
                                                                                        false
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    index ===
                                                                                    0
                                                                                }
                                                                                className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                                                title="Monter"
                                                                            >
                                                                                <ChevronUp className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    moveCarouselImage(
                                                                                        index,
                                                                                        "down",
                                                                                        false
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    index ===
                                                                                    carouselPreviews.length -
                                                                                        1
                                                                                }
                                                                                className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                                                title="Descendre"
                                                                            >
                                                                                <ChevronDown className="w-4 h-4" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Bouton supprimer */}
                                                                        <div>
                                                                            <button
                                                                                onClick={() =>
                                                                                    removeCarouselImage(
                                                                                        index,
                                                                                        false
                                                                                    )
                                                                                }
                                                                                className="flex justify-center items-center w-8 h-8 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                                                                                title="Supprimer cette image"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-500">
                                                    Formats acceptés : JPG, PNG,
                                                    WebP. Taille max : 5MB par
                                                    image.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white rounded-lg border border-gray-200">
                                        <h4 className="mb-4 text-lg font-semibold text-gray-900">
                                            Sections d'Information
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h5 className="mb-2 font-medium text-gray-900">
                                                    Notre Localisation
                                                </h5>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Adresse du club\nVille, Code postal\nInformations d'accès"
                                                    value={
                                                        homeContent.location ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setHomeContent(
                                                            (prev) => ({
                                                                ...prev,
                                                                location:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                />
                                            </div>
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h5 className="mb-2 font-medium text-gray-900">
                                                    Horaires d'Ouverture
                                                </h5>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Lundi - Vendredi: 14h - 18h\nSamedi - Dimanche: 9h - 19h"
                                                    value={
                                                        homeContent.openingHours ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setHomeContent(
                                                            (prev) => ({
                                                                ...prev,
                                                                openingHours:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                />
                                            </div>
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h5 className="mb-2 font-medium text-gray-900">
                                                    Nos Membres
                                                </h5>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Informations sur les membres\nNombre de licenciés\nActivités des membres"
                                                    value={
                                                        homeContent.members ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        setHomeContent(
                                                            (prev) => ({
                                                                ...prev,
                                                                members:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Section séparée pour la description du club */}
                                        <div className="mt-6">
                                            <div className="p-4 rounded-lg border border-gray-200">
                                                <h5 className="mb-4 font-medium text-gray-900">
                                                    Découvrez notre club
                                                </h5>

                                                {/* Champ pour le titre du club */}
                                                <div className="mb-4">
                                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                                        Titre du Club
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Découvrez notre club"
                                                        value={
                                                            homeContent.clubTitle ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setHomeContent(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    clubTitle:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                {/* Champ pour la description du club */}
                                                <div>
                                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                                        Description du Club
                                                    </label>
                                                    <textarea
                                                        rows={4}
                                                        placeholder="Description du club\nActivités proposées\nAmbiance et valeurs"
                                                        value={
                                                            homeContent.clubDescription ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setHomeContent(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    clubDescription:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                {/* Champs pour les trois sections sur la même ligne */}
                                                <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                                                    {/* Champ Nos Équipes */}
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Nos Équipes
                                                        </label>
                                                        <textarea
                                                            rows={4}
                                                            placeholder="Contenu de la section Nos Équipes..."
                                                            value={
                                                                homeContent.teamsContent ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setHomeContent(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        teamsContent:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                        />
                                                    </div>

                                                    {/* Champ Nos Animations */}
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Nos Animations
                                                        </label>
                                                        <textarea
                                                            rows={4}
                                                            placeholder="Contenu de la section Nos Animations..."
                                                            value={
                                                                homeContent.animationsContent ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setHomeContent(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        animationsContent:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                        />
                                                    </div>

                                                    {/* Champ Nos Tournois */}
                                                    <div>
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Nos Tournois
                                                        </label>
                                                        <textarea
                                                            rows={4}
                                                            placeholder="Contenu de la section Nos Tournois..."
                                                            value={
                                                                homeContent.tournamentsContent ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setHomeContent(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        tournamentsContent:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={handleCancelHomeContent}
                                            className="px-4 py-2 text-gray-700 rounded-lg border border-gray-300 transition-colors hover:bg-gray-50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSaveHomeContent}
                                            disabled={homeContentLoading}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {homeContentLoading && (
                                                <div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                                            )}
                                            <span>Sauvegarder</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeModal === "bar" && (
                                <div className="space-y-6">
                                    {/* Barre de recherche et filtres */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher une boisson..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddDrink}
                                                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Ajouter</span>
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {filteredDrinks.length} boisson
                                            {filteredDrinks.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            trouvée
                                            {filteredDrinks.length > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Tableau des boissons */}
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Boisson
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prix
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Stock
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredDrinks.map(
                                                        (drink) => (
                                                            <tr
                                                                key={drink.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="flex-shrink-0 w-10 h-10">
                                                                            <img
                                                                                className="object-cover w-10 h-10 rounded-full"
                                                                                src={
                                                                                    drink.image_url
                                                                                }
                                                                                alt={
                                                                                    drink.name
                                                                                }
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    e.target.src =
                                                                                        "https://via.placeholder.com/40x40?text=?";
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="ml-4">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                {
                                                                                    drink.name
                                                                                }
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {
                                                                                    drink.description
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        drink.price
                                                                    }
                                                                    €
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleAdjustStock(
                                                                                    drink.id,
                                                                                    -1
                                                                                )
                                                                            }
                                                                            className="p-1 text-gray-400 transition-colors hover:text-red-600"
                                                                            disabled={
                                                                                drink.stock <=
                                                                                0
                                                                            }
                                                                        >
                                                                            <Minus className="w-4 h-4" />
                                                                        </button>
                                                                        <span
                                                                            className={`text-sm font-medium px-2 py-1 rounded ${
                                                                                drink.stock <=
                                                                                5
                                                                                    ? "bg-red-100 text-red-800"
                                                                                    : drink.stock <=
                                                                                      10
                                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                                    : "bg-green-100 text-green-800"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                drink.stock
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleAdjustStock(
                                                                                    drink.id,
                                                                                    1
                                                                                )
                                                                            }
                                                                            className="p-1 text-gray-400 transition-colors hover:text-green-600"
                                                                        >
                                                                            <Plus className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditDrink(
                                                                                    drink
                                                                                )
                                                                            }
                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteDrink(
                                                                                    drink
                                                                                )
                                                                            }
                                                                            className="text-red-600 transition-colors hover:text-red-800"
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
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Ajouter/Modifier événement */}
                            {activeModal === "evenement" && showEventModal && (
                                <div className="flex fixed inset-0 z-[70] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {eventModalMode === "add"
                                                        ? "Ajouter un événement"
                                                        : "Modifier l'événement"}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowEventModal(false)
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                                        Titre de l'événement *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            eventFormData.titre
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                titre: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Titre de l'événement"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                                        Date de l'événement *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            eventFormData.date
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Heure de l'événement
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={
                                                            eventFormData.heure
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                heure: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <MapPin className="inline mr-1 w-4 h-4" />
                                                        Lieu de l'événement
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            eventFormData.lieu
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                lieu: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Lieu de l'événement"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Public cible
                                                    </label>
                                                    <select
                                                        value={
                                                            eventFormData.publicCible
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                publicCible:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    >
                                                        <option value="">
                                                            Sélectionner le
                                                            public
                                                        </option>
                                                        <option value="Ouvert à tous">
                                                            Ouvert à tous
                                                        </option>
                                                        <option value="Membres uniquement">
                                                            Membres uniquement
                                                        </option>
                                                        <option value="Licenciés uniquement">
                                                            Licenciés uniquement
                                                        </option>
                                                        <option value="Comité uniquement">
                                                            Comité uniquement
                                                        </option>
                                                        <option value="Réservation obligatoire">
                                                            Réservation
                                                            obligatoire
                                                        </option>
                                                        <option value="Réservation conseillée">
                                                            Réservation
                                                            conseillée
                                                        </option>
                                                        <option value="Sur invitation">
                                                            Sur invitation
                                                        </option>
                                                        <option value="Sur demande">
                                                            Sur demande
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={
                                                            eventFormData.description
                                                        }
                                                        onChange={(e) =>
                                                            setEventFormData({
                                                                ...eventFormData,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        rows="4"
                                                        placeholder="Description de l'événement..."
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <Camera className="inline mr-1 w-4 h-4" />
                                                        Photos de l'événement
                                                    </label>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={
                                                            handleEventPhotosChange
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Vous pouvez sélectionner
                                                        plusieurs photos
                                                    </p>
                                                </div>

                                                {/* Photos existantes */}
                                                {existingEventPhotos.length >
                                                    0 && (
                                                    <div className="md:col-span-2">
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Photos existantes
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                            {existingEventPhotos.map(
                                                                (photo) => (
                                                                    <div
                                                                        key={
                                                                            photo.id
                                                                        }
                                                                        className="relative group"
                                                                    >
                                                                        <img
                                                                            src={`${
                                                                                import.meta
                                                                                    .env
                                                                                    .VITE_API_URL ||
                                                                                "http://localhost:3001"
                                                                            }/api/events/photos/${
                                                                                photo.filename
                                                                            }`}
                                                                            alt={
                                                                                photo.filename
                                                                            }
                                                                            className="object-cover w-full h-24 rounded-lg border border-gray-200"
                                                                        />
                                                                        <button
                                                                            onClick={() =>
                                                                                deleteExistingEventPhoto(
                                                                                    photo.id
                                                                                )
                                                                            }
                                                                            className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                                                            title="Supprimer cette photo"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Prévisualisation des nouvelles photos */}
                                                {eventPhotosPreviews.length >
                                                    0 && (
                                                    <div className="md:col-span-2">
                                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                                            Nouvelles photos à
                                                            ajouter
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                            {eventPhotosPreviews.map(
                                                                (
                                                                    photo,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="relative group"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                photo.preview
                                                                            }
                                                                            alt={
                                                                                photo.name
                                                                            }
                                                                            className="object-cover w-full h-24 rounded-lg border border-gray-200"
                                                                        />
                                                                        <button
                                                                            onClick={() =>
                                                                                removeEventPhoto(
                                                                                    index
                                                                                )
                                                                            }
                                                                            className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                                                            title="Supprimer cette photo"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end mt-6 space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowEventModal(false)
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSaveEvent}
                                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>
                                                        {eventModalMode ===
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

                            {/* Modal de confirmation de suppression événement */}
                            {activeModal === "evenement" &&
                                showEventDeleteConfirm && (
                                    <div className="flex fixed inset-0 z-[70] justify-center items-center p-4 bg-black bg-opacity-50">
                                        <div className="w-full max-w-md bg-white rounded-lg">
                                            <div className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Confirmer la suppression
                                                    </h3>
                                                    <button
                                                        onClick={() =>
                                                            setShowEventDeleteConfirm(
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
                                                    supprimer l'événement "
                                                    {eventToDelete?.titre}" ?
                                                    Cette action est
                                                    irréversible.
                                                </p>

                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() =>
                                                            setShowEventDeleteConfirm(
                                                                false
                                                            )
                                                        }
                                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={
                                                            confirmDeleteEvent
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

                            {activeModal === "evenement" && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    Gestion des Événements
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setActiveModal(null)
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Barre de recherche et bouton d'ajout */}
                                                <div className="flex flex-col gap-4 justify-between items-start mb-6 sm:flex-row sm:items-center">
                                                    <div className="relative flex-1 max-w-md">
                                                        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                        <input
                                                            type="text"
                                                            placeholder="Rechercher un événement..."
                                                            value={
                                                                eventSearchTerm
                                                            }
                                                            onChange={(e) =>
                                                                setEventSearchTerm(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleAddEvent}
                                                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span>
                                                            Ajouter un événement
                                                        </span>
                                                    </button>
                                                </div>

                                                {/* Tableau des événements */}
                                                <div className="overflow-hidden bg-white rounded-lg shadow">
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                        Titre
                                                                    </th>
                                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                        Date
                                                                    </th>
                                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                        Description
                                                                    </th>
                                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                        Photos
                                                                    </th>
                                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                        Actions
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {filteredEvents.length >
                                                                0 ? (
                                                                    filteredEvents.map(
                                                                        (
                                                                            event
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    event.id
                                                                                }
                                                                                className="hover:bg-gray-50"
                                                                            >
                                                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                                                    {
                                                                                        event.titre
                                                                                    }
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                                    {new Date(
                                                                                        event.date
                                                                                    ).toLocaleDateString(
                                                                                        "fr-FR"
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-6 py-4 max-w-xs text-sm text-gray-900 truncate">
                                                                                    {
                                                                                        event.description
                                                                                    }
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                                    {event.photos &&
                                                                                    event
                                                                                        .photos
                                                                                        .length >
                                                                                        0 ? (
                                                                                        <span className="text-blue-600">
                                                                                            {
                                                                                                event
                                                                                                    .photos
                                                                                                    .length
                                                                                            }{" "}
                                                                                            photo
                                                                                            {event
                                                                                                .photos
                                                                                                .length >
                                                                                            1
                                                                                                ? "s"
                                                                                                : ""}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-gray-400">
                                                                                            Aucune
                                                                                            photo
                                                                                        </span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                                    <div className="flex space-x-2">
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleEditEvent(
                                                                                                    event
                                                                                                )
                                                                                            }
                                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                                            title="Modifier"
                                                                                        >
                                                                                            <Edit className="w-4 h-4" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleDeleteEvent(
                                                                                                    event
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
                                                                    )
                                                                ) : (
                                                                    <tr>
                                                                        <td
                                                                            colSpan="5"
                                                                            className="px-6 py-8 text-center text-gray-500"
                                                                        >
                                                                            Aucun
                                                                            événement
                                                                            trouvé
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Gestion des Lotos */}
                            {activeModal === "loto" && (
                                <LotoManagement onClose={() => setActiveModal(null)} />
                            )}
                                                                                    className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                                                                                    title="Supprimer"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="px-4 py-8 text-center text-gray-500 border border-gray-200"
                                                                >
                                                                    Aucun loto
                                                                    trouvé
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Ajouter/Modifier Loto */}
                            {showLotoModal && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {lotoModalMode === "add"
                                                        ? "Ajouter un loto"
                                                        : "Modifier le loto"}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowLotoModal(false)
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Nom du loto *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={lotoFormData.nom}
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                nom: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Nom du loto"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Date *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            lotoFormData.date
                                                        }
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                date: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Statut
                                                    </label>
                                                    <select
                                                        value={
                                                            lotoFormData.statut
                                                        }
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                statut: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    >
                                                        <option value="en_attente">
                                                            En attente
                                                        </option>
                                                        <option value="actif">
                                                            Actif
                                                        </option>
                                                        <option value="termine">
                                                            Terminé
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Prix du carton (€) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            lotoFormData.prixCarton
                                                        }
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                prixCarton:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Lots à gagner *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            lotoFormData.lotsAGagner
                                                        }
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                lotsAGagner:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Ex: Jambon, Bouteilles de vin..."
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={
                                                            lotoFormData.description
                                                        }
                                                        onChange={(e) =>
                                                            setLotoFormData({
                                                                ...lotoFormData,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        rows="3"
                                                        placeholder="Description du loto..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-6 space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowLotoModal(false)
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSaveLoto}
                                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>
                                                        {lotoModalMode === "add"
                                                            ? "Ajouter"
                                                            : "Modifier"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal de confirmation de suppression loto */}
                            {showLotoDeleteConfirm && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="w-full max-w-md bg-white rounded-lg">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Confirmer la suppression
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowLotoDeleteConfirm(
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
                                                supprimer le loto "
                                                {lotoToDelete?.nom}" ? Cette
                                                action est irréversible.
                                            </p>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowLotoDeleteConfirm(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={confirmDeleteLoto}
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

                            {activeModal === "concours" && (
                                <div className="space-y-6">
                                    {/* Barre de recherche et bouton d'ajout */}
                                    <div className="flex flex-col gap-4 justify-between items-start mb-6 sm:flex-row sm:items-center">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher un concours..."
                                                value={concoursSearchTerm}
                                                onChange={(e) =>
                                                    setConcoursSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddConcours}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Ajouter un concours</span>
                                        </button>
                                    </div>

                                    {/* Tableau des concours */}
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Nom
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prix inscription
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prix à gagner
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredConcours.length >
                                                    0 ? (
                                                        filteredConcours.map(
                                                            (concours) => (
                                                                <tr
                                                                    key={
                                                                        concours.id
                                                                    }
                                                                    className="hover:bg-gray-50"
                                                                >
                                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                                        {
                                                                            concours.nom
                                                                        }
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                        {new Date(
                                                                            concours.date
                                                                        ).toLocaleDateString(
                                                                            "fr-FR"
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                        {
                                                                            concours.prixInscription
                                                                        }
                                                                        €
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                        {
                                                                            concours.prixAGagner
                                                                        }
                                                                        €
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                                                concours.statut ===
                                                                                "termine"
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : concours.statut ===
                                                                                      "en_cours"
                                                                                    ? "bg-blue-100 text-blue-800"
                                                                                    : "bg-yellow-100 text-yellow-800"
                                                                            }`}
                                                                        >
                                                                            {concours.statut ===
                                                                            "termine"
                                                                                ? "Terminé"
                                                                                : concours.statut ===
                                                                                  "en_cours"
                                                                                ? "En cours"
                                                                                : "Planifié"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleEditConcours(
                                                                                        concours
                                                                                    )
                                                                                }
                                                                                className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                                title="Modifier"
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeleteConcours(
                                                                                        concours
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
                                                        )
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan="6"
                                                                className="px-6 py-8 text-center text-gray-500"
                                                            >
                                                                Aucun concours
                                                                trouvé
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Ajouter/Modifier concours */}
                            {showConcoursModal && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {concoursModalMode === "add"
                                                        ? "Ajouter un concours"
                                                        : "Modifier le concours"}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowConcoursModal(
                                                            false
                                                        )
                                                    }
                                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <Trophy className="inline mr-1 w-4 h-4" />
                                                        Nom du concours *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            concoursFormData.nom
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    nom: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="Nom du concours"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                                        Date du concours *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            concoursFormData.date
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    date: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Statut
                                                    </label>
                                                    <select
                                                        value={
                                                            concoursFormData.statut
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    statut: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                    >
                                                        <option value="en_attente">
                                                            En attente
                                                        </option>
                                                        <option value="actif">
                                                            Actif
                                                        </option>
                                                        <option value="termine">
                                                            Terminé
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <Euro className="inline mr-1 w-4 h-4" />
                                                        Prix d'inscription (€)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            concoursFormData.prixInscription
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    prixInscription:
                                                                        e.target
                                                                            .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        <Gift className="inline mr-1 w-4 h-4" />
                                                        Prix à gagner (€)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={
                                                            concoursFormData.prixGagner
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    prixGagner:
                                                                        e.target
                                                                            .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={
                                                            concoursFormData.description
                                                        }
                                                        onChange={(e) =>
                                                            setConcoursFormData(
                                                                {
                                                                    ...concoursFormData,
                                                                    description:
                                                                        e.target
                                                                            .value,
                                                                }
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                        rows="3"
                                                        placeholder="Description du concours, règles, conditions..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-6 space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowConcoursModal(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={handleSaveConcours}
                                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>
                                                        {concoursModalMode ===
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

                            {/* Modal de confirmation de suppression concours */}
                            {showConcoursDeleteConfirm && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="w-full max-w-md bg-white rounded-lg">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Confirmer la suppression
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        setShowConcoursDeleteConfirm(
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
                                                supprimer le concours "
                                                {concoursToDelete?.nom}" ? Cette
                                                action est irréversible.
                                            </p>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() =>
                                                        setShowConcoursDeleteConfirm(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    onClick={
                                                        confirmDeleteConcours
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

                            {/* Modale de gestion des concours */}
                            {activeModal === "concours" && (
                                <div className="space-y-6">
                                    {/* Barre de recherche et bouton d'ajout */}
                                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un concours..."
                                                    value={concoursSearchTerm}
                                                    onChange={(e) =>
                                                        setConcoursSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddConcours}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Ajouter un concours
                                        </button>
                                    </div>

                                    {/* Tableau des concours */}
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Nom
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prix inscription
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prix à gagner
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredConcours.map(
                                                        (concours) => (
                                                            <tr
                                                                key={
                                                                    concours.id
                                                                }
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            concours.nom
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            concours.description
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {new Date(
                                                                        concours.date
                                                                    ).toLocaleDateString(
                                                                        "fr-FR"
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        concours.prixInscription
                                                                    }
                                                                    €
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        concours.prixGagner
                                                                    }
                                                                    €
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span
                                                                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                                            concours.statut ===
                                                                            "actif"
                                                                                ? "bg-green-100 text-green-800"
                                                                                : concours.statut ===
                                                                                  "termine"
                                                                                ? "bg-gray-100 text-gray-800"
                                                                                : "bg-yellow-100 text-yellow-800"
                                                                        }`}
                                                                    >
                                                                        {concours.statut ===
                                                                        "actif"
                                                                            ? "Actif"
                                                                            : concours.statut ===
                                                                              "termine"
                                                                            ? "Terminé"
                                                                            : "En attente"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditConcours(
                                                                                    concours
                                                                                )
                                                                            }
                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteConcours(
                                                                                    concours
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
                                            {filteredConcours.length === 0 && (
                                                <div className="py-8 text-center text-gray-500">
                                                    Aucun concours trouvé
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Ajouter/Modifier type de membre */}
                            {showTypeMemberModal && (
                                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                                                                            className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
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
                                <div className="space-y-6">
                                    {/* Barre de recherche et filtres */}
                                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un membre..."
                                                    value={memberSearchTerm}
                                                    onChange={(e) =>
                                                        setMemberSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <select
                                            value={selectedMemberType}
                                            onChange={(e) =>
                                                setSelectedMemberType(
                                                    e.target.value
                                                )
                                            }
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        >
                                            <option value="">
                                                Tous les types
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
                                        <button
                                            onClick={handleAddMember}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Ajouter un membre
                                        </button>
                                    </div>

                                    {/* Tableau des membres */}
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 w-16 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                                            Photo
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Nom
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Prénom
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Email
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Téléphone
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Type
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            N° Licence
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            ANNIV
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredMembers.map(
                                                        (member) => (
                                                            <tr
                                                                key={member.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                                    <div className="flex justify-center">
                                                                        {member.photo_url ? (
                                                                            <img
                                                                                src={
                                                                                    member.photo_url.startsWith(
                                                                                        "/uploads/"
                                                                                    ) ||
                                                                                    member.photo_url.startsWith(
                                                                                        "uploads/"
                                                                                    )
                                                                                        ? `${
                                                                                              import.meta
                                                                                                  .env
                                                                                                  .VITE_API_URL ||
                                                                                              "http://localhost:3001"
                                                                                          }/api/members/photos/${member.photo_url
                                                                                              .split(
                                                                                                  "/"
                                                                                              )
                                                                                              .pop()}`
                                                                                        : member.photo_url
                                                                                }
                                                                                alt={`Photo de ${member.prenom} ${member.nom}`}
                                                                                className="object-cover w-10 h-10 rounded-full border-2 border-gray-200"
                                                                                onError={(
                                                                                    e
                                                                                ) => {
                                                                                    // En cas d'erreur, remplacer par l'avatar généré
                                                                                    const avatar =
                                                                                        generateAvatar(
                                                                                            member.prenom,
                                                                                            member.nom
                                                                                        );
                                                                                    const avatarDiv =
                                                                                        document.createElement(
                                                                                            "div"
                                                                                        );
                                                                                    avatarDiv.className =
                                                                                        "flex justify-center items-center w-10 h-10 text-sm font-semibold text-white rounded-full border-2 border-gray-200";
                                                                                    avatarDiv.style.backgroundColor =
                                                                                        avatar.backgroundColor;
                                                                                    avatarDiv.textContent =
                                                                                        avatar.initials;
                                                                                    e.target.parentNode.replaceChild(
                                                                                        avatarDiv,
                                                                                        e.target
                                                                                    );
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className="flex justify-center items-center w-10 h-10 text-sm font-semibold text-white rounded-full border-2 border-gray-200"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        generateAvatar(
                                                                                            member.prenom,
                                                                                            member.nom
                                                                                        )
                                                                                            .backgroundColor,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    generateAvatar(
                                                                                        member.prenom,
                                                                                        member.nom
                                                                                    )
                                                                                        .initials
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {member.nom}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        member.prenom
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        member.email
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {
                                                                        member.telephone
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-2 py-1 bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] rounded-full text-sm font-medium">
                                                                        {getMemberTypeName(
                                                                            member.type_membre_id
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {member.numero_licence ||
                                                                        "Non renseigné"}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {getBirthdayDisplay(
                                                                        member.date_naissance
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditMember(
                                                                                    member
                                                                                )
                                                                            }
                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteMember(
                                                                                    member
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
                                            {filteredMembers.length === 0 && (
                                                <div className="py-8 text-center text-gray-500">
                                                    Aucun membre trouvé
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === "typeMembre" && (
                                <div
                                    className="space-y-6"
                                    style={{
                                        minHeight: "200px",
                                        padding: "20px",
                                    }}
                                >
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
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
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
                                                                                        className="px-2 py-1 bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] rounded-full text-xs font-medium"
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
                                <div
                                    className="space-y-6"
                                    style={{
                                        minHeight: "200px",
                                        padding: "20px",
                                    }}
                                >
                                    {/* Barre de recherche et filtres */}
                                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher une équipe..."
                                                    value={teamSearchTerm}
                                                    onChange={(e) =>
                                                        setTeamSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedTeamCategory}
                                                onChange={(e) =>
                                                    setSelectedTeamCategory(
                                                        e.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                            >
                                                <option value="">
                                                    Toutes les catégories
                                                </option>
                                                <option value="Senior">
                                                    Senior
                                                </option>
                                                <option value="Vétéran">
                                                    Vétéran
                                                </option>
                                                <option value="Jeune">
                                                    Jeune
                                                </option>
                                                <option value="Mixte">
                                                    Mixte
                                                </option>
                                            </select>
                                            <button
                                                onClick={handleAddTeam}
                                                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                                            >
                                                <Trophy className="w-4 h-4" />
                                                Ajouter une équipe
                                            </button>
                                        </div>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="mb-6">
                                        <div className="text-sm text-gray-600">
                                            {filteredTeams.length} équipe
                                            {filteredTeams.length > 1
                                                ? "s"
                                                : ""}{" "}
                                            trouvée
                                            {filteredTeams.length > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Tableau des équipes */}
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
                                                            Description
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Compétition
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredTeams.map(
                                                        (team) => (
                                                            <tr
                                                                key={team.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        {team.photo_url ? (
                                                                            <img
                                                                                className="mr-3 w-10 h-10 rounded-full"
                                                                                src={
                                                                                    team.photo_url
                                                                                }
                                                                                alt={
                                                                                    team.name
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <div className="h-10 w-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center mr-3">
                                                                                <Trophy className="w-5 h-5 text-white" />
                                                                            </div>
                                                                        )}
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                team.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-2 py-1 bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)] rounded-full text-xs font-medium">
                                                                        {team.category ||
                                                                            "Non définie"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm text-gray-900">
                                                                        {team.description ||
                                                                            "Aucune description"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="text-sm text-gray-900">
                                                                        {team.competition ||
                                                                            "Non définie"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditTeam(
                                                                                    team
                                                                                )
                                                                            }
                                                                            className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteTeam(
                                                                                    team
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
                                            {filteredTeams.length === 0 && (
                                                <div className="py-8 text-center text-gray-500">
                                                    Aucune équipe trouvée
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === "droits" && (
                                <div className="space-y-6">
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
                                        <div className="mx-auto mb-4 w-12 h-12 text-gray-400">
                                            {activeModal === "evenement" && (
                                                <Calendar className="w-12 h-12" />
                                            )}
                                            {activeModal === "resultat" && (
                                                <BarChart3 className="w-12 h-12" />
                                            )}
                                            {activeModal === "galerie" && (
                                                <Camera className="w-12 h-12" />
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajouter/Modifier boisson */}
            {showBarModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {modalMode === "add"
                                        ? "Ajouter une boisson"
                                        : "Modifier la boisson"}
                                </h3>
                                <button
                                    onClick={() => setShowBarModal(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Nom de la boisson"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Prix (€) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                stock:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        rows="3"
                                        placeholder="Description de la boisson"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Image de la boisson
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
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>

                                        {imagePreview && (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Prévisualisation"
                                                    className="object-cover w-full h-32 rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setSelectedImageFile(
                                                            null
                                                        );
                                                        setFormData({
                                                            ...formData,
                                                            image: "",
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
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowBarModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveDrink}
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {modalMode === "add"
                                            ? "Ajouter"
                                            : "Modifier"}
                                    </span>
                                </button>
                            </div>
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

            {/* Modal d'ajout/modification d'équipe */}
            {showTeamModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl bg-white rounded-lg max-h-[90vh] overflow-y-auto">
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
                    <div className="w-full max-w-md bg-white rounded-lg">
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
    );
};

export default Admin;
