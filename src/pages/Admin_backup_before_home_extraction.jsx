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
        // loadLotos maintenant dans CompetitionManagement.jsx
        loadHomeContent(); // Charger le contenu de la page d'accueil
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

            setStats((prevStats) => ({
                ...prevStats,
                users: membersData.length, // Utiliser les données des membres passées en paramètre
                teams: teamsCount,
                events: eventsCount,
                albums: 0, // TODO: Implémenter l'API des albums
                // drinks: drinks.length, // Ne pas écraser le compteur de boissons ici
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

    // Fonction pour gérer la sélection d'image de membre


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
                    } catch (processError) {
                        console.error(
                            `❌ Erreur processFile ${index + 1}:`,
                            processError
                        );
                        reject(processError);
                    }
                });
            };

            // Traitement de tous les fichiers
            Promise.all(validFiles.map((file, index) => processFile(file, index)))
                .then(() => {
                    if (!hasError) {
                        console.log("✅ Toutes les prévisualisations créées");
                        console.log("📊 Previews:", previews);
                        setCarouselPreviews(previews);
                        console.log("✅ carouselPreviews mis à jour");
                    }
                })
                .catch((error) => {
                    console.error("❌ Erreur Promise.all:", error);
                    toast.error("Erreur lors de la création des prévisualisations");
                });
        } catch (globalError) {
            console.error("❌ Erreur globale handleCarouselImagesChange:", globalError);
            toast.error("Erreur inattendue lors de la sélection des images");
        }
    };

    const handleRemoveCarouselImage = (index) => {
        console.log("🗑️ Suppression image carrousel index:", index);
        console.log("📊 existingCarouselImages avant:", existingCarouselImages);

        const updatedImages = existingCarouselImages.filter((_, i) => i !== index);
        console.log("📊 existingCarouselImages après:", updatedImages);
        setExistingCarouselImages(updatedImages);
    };

    const handleRemoveNewCarouselImage = (index) => {
        console.log("🗑️ Suppression nouvelle image carrousel index:", index);
        console.log("📊 selectedCarouselFiles avant:", selectedCarouselFiles);
        console.log("📊 carouselPreviews avant:", carouselPreviews);

        const updatedFiles = selectedCarouselFiles.filter((_, i) => i !== index);
        const updatedPreviews = carouselPreviews.filter((_, i) => i !== index);

        console.log("📊 selectedCarouselFiles après:", updatedFiles);
        console.log("📊 carouselPreviews après:", updatedPreviews);

        setSelectedCarouselFiles(updatedFiles);
        setCarouselPreviews(updatedPreviews);
    };

    const saveHomeContent = async () => {
        try {
            setHomeContentLoading(true);
            console.log("💾 Début sauvegarde contenu page d'accueil");
            console.log("📊 homeContent:", homeContent);
            console.log("📊 selectedCarouselFiles:", selectedCarouselFiles);
            console.log("📊 existingCarouselImages:", existingCarouselImages);

            const formData = new FormData();

            // Ajouter les champs texte
            formData.append("title", homeContent.title || "");
            formData.append("description", homeContent.description || "");
            formData.append("openingHours", homeContent.openingHours || "");
            formData.append("contact", homeContent.contact || "");
            formData.append("practicalInfo", homeContent.practicalInfo || "");
            formData.append("location", homeContent.location || "");
            formData.append("members", homeContent.members || "");
            formData.append("clubTitle", homeContent.clubTitle || "");
            formData.append("clubDescription", homeContent.clubDescription || "");
            formData.append("teamsContent", homeContent.teamsContent || "");
            formData.append("animationsContent", homeContent.animationsContent || "");
            formData.append("tournamentsContent", homeContent.tournamentsContent || "");

            // Ajouter les images existantes à conserver
            formData.append("existingImages", JSON.stringify(existingCarouselImages));

            // Ajouter les nouvelles images
            selectedCarouselFiles.forEach((file, index) => {
                console.log(`📎 Ajout fichier ${index + 1}:`, file.name);
                formData.append("carouselImages", file);
            });

            console.log("📤 Envoi des données...");
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3001"
                }/api/home-content`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            console.log("📥 Réponse reçue:", response.status);

            if (response.ok) {
                const result = await response.json();
                console.log("✅ Sauvegarde réussie:", result);
                toast.success("Contenu de la page d'accueil sauvegardé avec succès");

                // Recharger le contenu pour avoir les URLs des nouvelles images
                await loadHomeContent();

                // Réinitialiser les fichiers sélectionnés
                setSelectedCarouselFiles([]);
                setCarouselPreviews([]);
            } else {
                const errorData = await response.text();
                console.error("❌ Erreur sauvegarde:", response.status, errorData);
                toast.error("Erreur lors de la sauvegarde du contenu");
            }
        } catch (error) {
            console.error("❌ Erreur lors de la sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde du contenu");
        } finally {
            setHomeContentLoading(false);
        }
    };

    const resetHomeContent = () => {
        console.log("🔄 Reset contenu page d'accueil");
        console.log("📊 originalHomeContent:", originalHomeContent);
        setHomeContent({ ...originalHomeContent });
        setSelectedCarouselFiles([]);
        setCarouselPreviews([]);
        setExistingCarouselImages(originalHomeContent.carouselImages || []);
        toast.success("Modifications annulées");
    };

    // Fonction pour vérifier si le contenu a été modifié
    const hasHomeContentChanged = () => {
        const contentChanged =
            JSON.stringify({
                title: homeContent.title,
                description: homeContent.description,
                openingHours: homeContent.openingHours,
                contact: homeContent.contact,
                practicalInfo: homeContent.practicalInfo,
                location: homeContent.location,
                members: homeContent.members,
                clubTitle: homeContent.clubTitle,
                clubDescription: homeContent.clubDescription,
                teamsContent: homeContent.teamsContent,
                animationsContent: homeContent.animationsContent,
                tournamentsContent: homeContent.tournamentsContent,
            }) !==
            JSON.stringify({
                title: originalHomeContent.title,
                description: originalHomeContent.description,
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

        const imagesChanged =
            JSON.stringify(existingCarouselImages) !==
            JSON.stringify(originalHomeContent.carouselImages || []);

        const newImagesAdded = selectedCarouselFiles.length > 0;

        console.log("🔍 Vérification changements:", {
            contentChanged,
            imagesChanged,
            newImagesAdded,
            hasChanged: contentChanged || imagesChanged || newImagesAdded,
        });

        return contentChanged || imagesChanged || newImagesAdded;
    };

    // Fonction pour gérer les changements de contenu
    const handleHomeContentChange = (field, value) => {
        console.log(`🔄 Changement ${field}:`, value);
        setHomeContent((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        setActiveModal(null);
        setSearchTerm("");
    };

    // Fonction pour ouvrir une modale
    const openModal = (modalType) => {
        setActiveModal(modalType);
    };

    // Fonction pour gérer la recherche
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    // Fonction pour gérer l'ajout d'un membre
    const handleAddMember = async (memberData) => {
        try {
            const newMember = await membersAPI.create(memberData);
            setMembers((prev) => [...prev, newMember]);
            toast.success("Membre ajouté avec succès");
            setShowMemberModal(false);
            // Recharger les membres pour mettre à jour les stats
            await loadMembers();
        } catch (error) {
            console.error("Erreur lors de l'ajout du membre:", error);
            toast.error("Erreur lors de l'ajout du membre");
        }
    };

    // Fonction pour gérer la modification d'un membre
    const handleUpdateMember = async (id, memberData) => {
        try {
            const updatedMember = await membersAPI.update(id, memberData);
            setMembers((prev) =>
                prev.map((member) => (member.id === id ? updatedMember : member))
            );
            toast.success("Membre modifié avec succès");
            setShowMemberModal(false);
            // Recharger les membres pour mettre à jour les stats
            await loadMembers();
        } catch (error) {
            console.error("Erreur lors de la modification du membre:", error);
            toast.error("Erreur lors de la modification du membre");
        }
    };

    // Fonction pour gérer la suppression d'un membre
    const handleDeleteMember = async (id) => {
        try {
            await membersAPI.delete(id);
            setMembers((prev) => prev.filter((member) => member.id !== id));
            toast.success("Membre supprimé avec succès");
            setShowMemberDeleteConfirm(false);
            setMemberToDelete(null);
            // Recharger les membres pour mettre à jour les stats
            await loadMembers();
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            toast.error("Erreur lors de la suppression du membre");
        }
    };

    // Fonction pour gérer l'ajout d'un type de membre
    const handleAddTypeMember = async (typeData) => {
        try {
            const newType = await membersAPI.createType(typeData);
            setMemberTypes((prev) => [...prev, newType]);
            toast.success("Type de membre ajouté avec succès");
            setShowTypeMemberModal(false);
            setTypeMemberFormData({ nom: "", description: "", droits: [] });
        } catch (error) {
            console.error("Erreur lors de l'ajout du type de membre:", error);
            toast.error("Erreur lors de l'ajout du type de membre");
        }
    };

    // Fonction pour gérer la modification d'un type de membre
    const handleUpdateTypeMember = async (id, typeData) => {
        try {
            const updatedType = await membersAPI.updateType(id, typeData);
            setMemberTypes((prev) =>
                prev.map((type) => (type.id === id ? updatedType : type))
            );
            toast.success("Type de membre modifié avec succès");
            setShowTypeMemberModal(false);
            setSelectedTypeMember(null);
            setTypeMemberFormData({ nom: "", description: "", droits: [] });
        } catch (error) {
            console.error("Erreur lors de la modification du type de membre:", error);
            toast.error("Erreur lors de la modification du type de membre");
        }
    };

    // Fonction pour gérer la suppression d'un type de membre
    const handleDeleteTypeMember = async (id) => {
        try {
            await membersAPI.deleteType(id);
            setMemberTypes((prev) => prev.filter((type) => type.id !== id));
            toast.success("Type de membre supprimé avec succès");
            setShowTypeMemberDeleteConfirm(false);
            setTypeMemberToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du type de membre:", error);
            toast.error("Erreur lors de la suppression du type de membre");
        }
    };

    // Fonction pour ouvrir la modale d'ajout de type de membre
    const openAddTypeMemberModal = () => {
        setTypeMemberModalMode("add");
        setSelectedTypeMember(null);
        setTypeMemberFormData({ nom: "", description: "", droits: [] });
        setShowTypeMemberModal(true);
    };

    // Fonction pour ouvrir la modale de modification de type de membre
    const openEditTypeMemberModal = (type) => {
        setTypeMemberModalMode("edit");
        setSelectedTypeMember(type);
        setTypeMemberFormData({
            nom: type.nom || "",
            description: type.description || "",
            droits: type.droits || [],
        });
        setShowTypeMemberModal(true);
    };

    // Fonction pour confirmer la suppression d'un type de membre
    const confirmDeleteTypeMember = (type) => {
        setTypeMemberToDelete(type);
        setShowTypeMemberDeleteConfirm(true);
    };

    // Fonction pour annuler la suppression d'un type de membre
    const cancelDeleteTypeMember = () => {
        setTypeMemberToDelete(null);
        setShowTypeMemberDeleteConfirm(false);
    };

    // Fonction pour soumettre le formulaire de type de membre
    const handleTypeMemberSubmit = async (e) => {
        e.preventDefault();
        if (typeMemberModalMode === "add") {
            await handleAddTypeMember(typeMemberFormData);
        } else {
            await handleUpdateTypeMember(selectedTypeMember.id, typeMemberFormData);
        }
    };

    // Fonction pour gérer les changements dans le formulaire de type de membre
    const handleTypeMemberFormChange = (field, value) => {
        setTypeMemberFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Fonction pour gérer les changements de droits
    const handleDroitsChange = (droit) => {
        setTypeMemberFormData((prev) => ({
            ...prev,
            droits: prev.droits.includes(droit)
                ? prev.droits.filter((d) => d !== droit)
                : [...prev.droits, droit],
        }));
    };

    // Fonction pour filtrer les membres
    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            member.nom?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.prenom?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(memberSearchTerm.toLowerCase());

        const matchesType =
            !selectedMemberType || member.type_id?.toString() === selectedMemberType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Administration
                    </h1>
                    <p className="text-gray-600">
                        Gérez votre club de pétanque en toute simplicité
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Membres
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "..." : stats.users}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Équipes
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "..." : stats.teams}
                                </p>
                            </div>
                            <Trophy className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Événements
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "..." : stats.events}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Boissons
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "..." : stats.drinks}
                                </p>
                            </div>
                            <Wine className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Résultats
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "..." : stats.results}
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Cartes de gestion */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Gestion du Bar */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-orange-500"
                        onClick={() => openModal("bar")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Gestion du Bar
                            </h3>
                            <Wine className="h-8 w-8 text-orange-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Gérez les boissons, les prix et les stocks
                        </p>
                        <div className="flex items-center text-orange-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>

                    {/* Gestion des Membres */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-blue-500"
                        onClick={() => openModal("membre")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Gestion des Membres
                            </h3>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Ajoutez, modifiez et gérez les membres du club
                        </p>
                        <div className="flex items-center text-blue-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>

                    {/* Gestion des Événements */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-purple-500"
                        onClick={() => openModal("evenement")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Gestion des Événements
                            </h3>
                            <Calendar className="h-8 w-8 text-purple-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Organisez et gérez les événements du club
                        </p>
                        <div className="flex items-center text-purple-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>

                    {/* Gestion des Équipes */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-green-500"
                        onClick={() => openModal("equipe")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Gestion des Équipes
                            </h3>
                            <Trophy className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Créez et gérez les équipes de compétition
                        </p>
                        <div className="flex items-center text-green-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>

                    {/* Gestion des Concours */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-red-500"
                        onClick={() => openModal("concours")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Gestion des Concours
                            </h3>
                            <Trophy className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Organisez les concours et gérez les résultats
                        </p>
                        <div className="flex items-center text-red-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>

                    {/* Gestion de la Page d'Accueil */}
                    <div
                        className="admin-card bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-indigo-500"
                        onClick={() => openModal("accueil")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Page d'Accueil
                            </h3>
                            <Home className="h-8 w-8 text-indigo-500" />
                        </div>
                        <p className="text-gray-600 mb-4">
                            Personnalisez le contenu de la page d'accueil
                        </p>
                        <div className="flex items-center text-indigo-500">
                            <span className="text-sm font-medium">Gérer</span>
                            <ChevronDown className="h-4 w-4 ml-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            {activeModal === "bar" && (
                <BarManagement
                    isOpen={true}
                    onClose={closeModal}
                    drinks={drinks}
                    onAddDrink={addDrink}
                    onUpdateDrink={updateDrink}
                    onDeleteDrink={deleteDrink}
                />
            )}

            {activeModal === "membre" && (
                <MemberManagement
                    isOpen={true}
                    onClose={closeModal}
                    members={filteredMembers}
                    memberTypes={memberTypes}
                    onAddMember={handleAddMember}
                    onUpdateMember={handleUpdateMember}
                    onDeleteMember={handleDeleteMember}
                    onAddTypeMember={handleAddTypeMember}
                    onUpdateTypeMember={handleUpdateTypeMember}
                    onDeleteTypeMember={handleDeleteTypeMember}
                />
            )}

            {activeModal === "evenement" && (
                <EventManagement
                    isOpen={true}
                    onClose={closeModal}
                    onStatsUpdate={handleStatsUpdate}
                />
            )}

            {activeModal === "equipe" && (
                <TeamManagement
                    isOpen={true}
                    onClose={closeModal}
                    onStatsUpdate={handleStatsUpdate}
                />
            )}

            {activeModal === "concours" && (
                <CompetitionManagement
                    isOpen={true}
                    onClose={closeModal}
                    onStatsUpdate={handleStatsUpdate}
                />
            )}

            {/* Modale de gestion de la page d'accueil */}
            {activeModal === "accueil" && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                        {/* En-tête de la modale */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                            <div className="flex items-center space-x-3">
                                <Home className="h-8 w-8 text-white" />
                                <h2 className="text-2xl font-bold text-white">
                                    Gestion de la Page d'Accueil
                                </h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Contenu de la modale */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {homeContentLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-gray-600">
                                        Chargement du contenu...
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Section Titre et Description */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Edit className="h-5 w-5 mr-2 text-indigo-500" />
                                            Contenu Principal
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Titre Principal
                                                </label>
                                                <input
                                                    type="text"
                                                    value={homeContent.title || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Titre de la page d'accueil"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={homeContent.description || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Description de votre club"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Carrousel d'Images */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Camera className="h-5 w-5 mr-2 text-indigo-500" />
                                            Carrousel d'Images
                                        </h3>

                                        {/* Images existantes */}
                                        {existingCarouselImages &&
                                            existingCarouselImages.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="text-md font-medium text-gray-700 mb-3">
                                                        Images actuelles
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {existingCarouselImages.map(
                                                            (image, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="relative group"
                                                                >
                                                                    <img
                                                                        src={`${
                                                                            import.meta.env
                                                                                .VITE_API_URL ||
                                                                            "http://localhost:3001"
                                                                        }${image}`}
                                                                        alt={`Carrousel ${index + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg shadow-md"
                                                                        onError={(e) => {
                                                                            console.error(
                                                                                "Erreur chargement image:",
                                                                                image
                                                                            );
                                                                            e.target.style.display =
                                                                                "none";
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRemoveCarouselImage(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Nouvelles images sélectionnées */}
                                        {carouselPreviews.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-md font-medium text-gray-700 mb-3">
                                                    Nouvelles images à ajouter
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {carouselPreviews.map((preview, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative group"
                                                        >
                                                            <img
                                                                src={preview}
                                                                alt={`Nouvelle image ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg shadow-md"
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveNewCarouselImage(
                                                                        index
                                                                    )
                                                                }
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sélection de nouvelles images */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ajouter des images au carrousel
                                            </label>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleCarouselImagesChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Sélectionnez plusieurs images (max 5MB chacune)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Section Informations Pratiques */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                                            Informations Pratiques
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Horaires d'ouverture
                                                </label>
                                                <textarea
                                                    value={homeContent.openingHours || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "openingHours",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Lundi - Vendredi: 9h - 18h..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Contact
                                                </label>
                                                <textarea
                                                    value={homeContent.contact || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "contact",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Téléphone, email, adresse..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Informations pratiques
                                                </label>
                                                <textarea
                                                    value={homeContent.practicalInfo || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "practicalInfo",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Informations utiles pour les visiteurs..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Contenu Supplémentaire */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Edit className="h-5 w-5 mr-2 text-indigo-500" />
                                            Contenu Supplémentaire
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Localisation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={homeContent.location || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "location",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Adresse du club"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Informations membres
                                                </label>
                                                <textarea
                                                    value={homeContent.members || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "members",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Informations sur les membres..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Titre du club
                                                </label>
                                                <input
                                                    type="text"
                                                    value={homeContent.clubTitle || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "clubTitle",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Titre de la section club"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description du club
                                                </label>
                                                <textarea
                                                    value={homeContent.clubDescription || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "clubDescription",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Description détaillée du club..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Contenu équipes
                                                </label>
                                                <textarea
                                                    value={homeContent.teamsContent || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "teamsContent",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Informations sur les équipes..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Contenu animations
                                                </label>
                                                <textarea
                                                    value={homeContent.animationsContent || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "animationsContent",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Informations sur les animations..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Contenu tournois
                                                </label>
                                                <textarea
                                                    value={homeContent.tournamentsContent || ""}
                                                    onChange={(e) =>
                                                        handleHomeContentChange(
                                                            "tournamentsContent",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Informations sur les tournois..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={resetHomeContent}
                                            disabled={!hasHomeContentChanged() || homeContentLoading}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={saveHomeContent}
                                            disabled={!hasHomeContentChanged() || homeContentLoading}
                                            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                        >
                                            {homeContentLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Sauvegarder
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;