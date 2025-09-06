import React, { useState, useEffect } from "react";
import { Users, Calendar, Trophy, BarChart3, Camera, Wine, Plus, Minus, Edit, Trash2, Search, Filter, X, Save, UserPlus, Phone, Mail, MapPin, Calendar as CalendarIcon, CreditCard, Shield, Gift, Euro } from "lucide-react";
import { useDrinks } from "../contexts/DrinksContext";
import { toast } from "sonner";
import { eventsAPI, statsAPI } from "../lib/api";

// Styles pour les animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: scale(0.95) translateY(-10px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const Admin = () => {
    const { drinks, addDrink, updateDrink, deleteDrink } = useDrinks();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        teams: 0,
        events: 0,
        albums: 0,
        drinks: 0,
        results: 0
    });

    // État pour la gestion des modales
    const [activeModal, setActiveModal] = useState(null); // 'bar', 'membre', 'evenement', 'equipe', 'resultat', 'galerie'
    const [showBarModal, setShowBarModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' ou 'edit'
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [drinkToDelete, setDrinkToDelete] = useState(null);

    // États pour la gestion des membres
    const [members, setMembers] = useState([
        {
            id: 1,
            nom: 'Dupont',
            prenom: 'Jean',
            adresse: '123 Rue de la Paix, 75001 Paris',
            telephone: '0123456789',
            email: 'jean.dupont@email.com',
            numeroLicence: 'LIC001',
            dateEntree: '2023-01-15',
            dateNaissance: '1980-05-20',
            typeMembreId: 1
        },
        {
            id: 2,
            nom: 'Martin',
            prenom: 'Marie',
            adresse: '456 Avenue des Fleurs, 69000 Lyon',
            telephone: '0987654321',
            email: 'marie.martin@email.com',
            numeroLicence: 'LIC002',
            dateEntree: '2023-02-10',
            dateNaissance: '1975-08-12',
            typeMembreId: 2
        }
    ]);
    
    const [memberTypes, setMemberTypes] = useState([
        { id: 1, nom: 'Président', droits: ['admin', 'gestion', 'consultation'] },
        { id: 2, nom: 'Secrétaire', droits: ['gestion', 'consultation'] },
        { id: 3, nom: 'Trésorier', droits: ['gestion', 'consultation'] },
        { id: 4, nom: 'Membre actif', droits: ['consultation'] }
    ]);
    
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberModalMode, setMemberModalMode] = useState('add');
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [selectedMemberType, setSelectedMemberType] = useState('');
    const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [showTypeModal, setShowTypeModal] = useState(false);
    
    // États pour la gestion des types de membres
    const [showTypeMemberModal, setShowTypeMemberModal] = useState(false);
    const [typeMemberModalMode, setTypeMemberModalMode] = useState('add');
    const [selectedTypeMember, setSelectedTypeMember] = useState(null);
    const [typeMemberSearchTerm, setTypeMemberSearchTerm] = useState('');
    const [showTypeMemberDeleteConfirm, setShowTypeMemberDeleteConfirm] = useState(false);
    const [typeMemberToDelete, setTypeMemberToDelete] = useState(null);
    const [typeMemberFormData, setTypeMemberFormData] = useState({
        nom: '',
        description: '',
        droits: []
    });
    
    const [memberFormData, setMemberFormData] = useState({
        nom: '',
        prenom: '',
        adresse: '',
        telephone: '',
        email: '',
        numeroLicence: '',
        dateEntree: '',
        dateNaissance: '',
        typeMembreId: '',
        photo: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: 50
    });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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

    // Variables calculées pour le filtrage
    const filteredConcours = concours.filter(c => 
        c.nom.toLowerCase().includes(concoursSearchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(concoursSearchTerm.toLowerCase())
    );

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

    // Variables calculées pour le filtrage
    const filteredLotos = lotos.filter(l => 
        l.nom.toLowerCase().includes(lotoSearchTerm.toLowerCase()) ||
        l.description.toLowerCase().includes(lotoSearchTerm.toLowerCase())
    );

    // États pour la gestion des événements
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventModalMode, setEventModalMode] = useState('add');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showEventDeleteConfirm, setShowEventDeleteConfirm] = useState(false);
    const [eventSearchTerm, setEventSearchTerm] = useState('');
    const [eventFormData, setEventFormData] = useState({
        titre: '',
        date: '',
        description: '',
        photos: []
    });
    const [selectedEventPhotos, setSelectedEventPhotos] = useState([]);
    const [eventPhotosPreviews, setEventPhotosPreviews] = useState([]);
    const [existingEventPhotos, setExistingEventPhotos] = useState([]);

    // Variables calculées pour le filtrage des événements
    const filteredEvents = events.filter(e => 
        (e.titre && e.titre.toLowerCase().includes(eventSearchTerm.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(eventSearchTerm.toLowerCase()))
    );

    useEffect(() => {
        loadStats();
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const eventsData = await eventsAPI.getAll();
            
            // Mapper les champs et récupérer le nombre de photos pour chaque événement
            const eventsWithPhotos = await Promise.all(
                eventsData.map(async (event) => {
                    try {
                        // Récupérer les photos de l'événement
                        const response = await fetch(`http://localhost:5555/api/events/${event.id}/photos`);
                        const photos = response.ok ? await response.json() : [];
                        
                        return {
                            ...event,
                            titre: event.title, // Mapper title vers titre
                            photos: photos // Ajouter les photos
                        };
                    } catch (photoError) {
                        console.error(`Erreur lors du chargement des photos pour l'événement ${event.id}:`, photoError);
                        return {
                            ...event,
                            titre: event.title,
                            photos: []
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

    const loadStats = async () => {
        try {
            setLoading(true);
            const eventsCount = await eventsAPI.getCount();
            
            setStats({
                users: 0, // TODO: Implémenter l'API des utilisateurs
                teams: 0, // TODO: Implémenter l'API des équipes
                events: eventsCount,
                albums: 0, // TODO: Implémenter l'API des albums
                drinks: drinks.length,
                results: 0 // TODO: Implémenter l'API des résultats
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
        setModalMode('add');
        setFormData({
            name: '',
            price: '',
            description: '',
            image: '',
            stock: 50
        });
        setSelectedImageFile(null);
        setImagePreview(null);
        setShowBarModal(true);
    };

    const handleEditDrink = (drink) => {
        setModalMode('edit');
        setSelectedDrink(drink);
        setFormData({
            name: drink.name,
            price: drink.price.toString(),
            description: drink.description,
            image: drink.image,
            stock: drink.stock
        });
        setSelectedImageFile(null);
        setImagePreview(drink.image);
        setShowBarModal(true);
    };

    const handleDeleteDrink = (drink) => {
        setDrinkToDelete(drink);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        deleteDrink(drinkToDelete.id);
        setShowDeleteConfirm(false);
        setDrinkToDelete(null);
        toast.success('Boisson supprimée avec succès');
    };

    // Fonction pour gérer la sélection d'image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedImageFile(file);
                
                // Créer une prévisualisation
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target.result);
                    setFormData({...formData, image: e.target.result});
                };
                reader.readAsDataURL(file);
            } else {
                toast.error('Veuillez sélectionner un fichier image valide');
            }
        }
    };

    const handleSaveDrink = () => {
        if (!formData.name || !formData.price) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const drinkData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock)
        };

        if (modalMode === 'add') {
            addDrink(drinkData);
            toast.success('Boisson ajoutée avec succès');
        } else {
            updateDrink(selectedDrink.id, drinkData);
            toast.success('Boisson modifiée avec succès');
        }

        setShowBarModal(false);
        setSelectedImageFile(null);
        setImagePreview(null);
    };

    // Fonctions de gestion des membres
    const handleAddMember = () => {
        setMemberModalMode('add');
        setMemberFormData({
            nom: '',
            prenom: '',
            adresse: '',
            telephone: '',
            email: '',
            numeroLicence: '',
            dateEntree: new Date().toISOString().split('T')[0],
            dateNaissance: '',
            typeMembreId: ''
        });
        setShowMemberModal(true);
    };

    const handleEditMember = (member) => {
        setMemberModalMode('edit');
        setSelectedMember(member);
        setMemberFormData({
            nom: member.nom,
            prenom: member.prenom,
            adresse: member.adresse,
            telephone: member.telephone,
            email: member.email,
            numeroLicence: member.numeroLicence,
            dateEntree: member.dateEntree,
            dateNaissance: member.dateNaissance,
            typeMembreId: member.typeMembreId.toString()
        });
        setShowMemberModal(true);
    };

    const handleDeleteMember = (member) => {
        setMemberToDelete(member);
        setShowMemberDeleteConfirm(true);
    };

    const confirmDeleteMember = () => {
        setMembers(members.filter(m => m.id !== memberToDelete.id));
        setShowMemberDeleteConfirm(false);
        setMemberToDelete(null);
        toast.success('Membre supprimé avec succès');
    };

    const validateMemberForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        
        if (!memberFormData.nom || !memberFormData.prenom || !memberFormData.email) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return false;
        }
        
        if (!emailRegex.test(memberFormData.email)) {
            toast.error('Veuillez saisir un email valide');
            return false;
        }
        
        if (memberFormData.telephone && !phoneRegex.test(memberFormData.telephone.replace(/\s/g, ''))) {
            toast.error('Veuillez saisir un numéro de téléphone valide (10 chiffres)');
            return false;
        }
        
        return true;
    };

    const handleSaveMember = () => {
        if (!validateMemberForm()) {
            return;
        }

        const memberData = {
            ...memberFormData,
            typeMembreId: parseInt(memberFormData.typeMembreId)
        };

        if (memberModalMode === 'add') {
            const newMember = {
                ...memberData,
                id: Math.max(...members.map(m => m.id), 0) + 1
            };
            setMembers([...members, newMember]);
            toast.success('Membre ajouté avec succès');
        } else {
            setMembers(members.map(m => 
                m.id === selectedMember.id ? { ...memberData, id: selectedMember.id } : m
            ));
            toast.success('Membre modifié avec succès');
        }

        setShowMemberModal(false);
    };

    const getMemberTypeName = (typeId) => {
        const type = memberTypes.find(t => t.id === typeId);
        return type ? type.nom : 'Non défini';
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = 
            member.nom.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.prenom.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(memberSearchTerm.toLowerCase());
        
        const matchesType = selectedMemberType === '' || member.typeMembreId.toString() === selectedMemberType;
        
        return matchesSearch && matchesType;
    });

    // Fonctions de gestion des types de membres
    const handleAddTypeMember = () => {
        setTypeMemberModalMode('add');
        setSelectedTypeMember(null);
        setTypeMemberFormData({
            nom: '',
            description: '',
            droits: []
        });
        setShowTypeMemberModal(true);
    };

    const handleEditTypeMember = (typeMember) => {
        setTypeMemberModalMode('edit');
        setSelectedTypeMember(typeMember);
        setTypeMemberFormData({
            nom: typeMember.nom,
            description: typeMember.description,
            droits: [...typeMember.droits]
        });
        setShowTypeMemberModal(true);
    };

    const handleDeleteTypeMember = (typeMember) => {
        setTypeMemberToDelete(typeMember);
        setShowTypeMemberDeleteConfirm(true);
    };

    const confirmDeleteTypeMember = () => {
        setMemberTypes(memberTypes.filter(t => t.id !== typeMemberToDelete.id));
        setShowTypeMemberDeleteConfirm(false);
        setTypeMemberToDelete(null);
        toast.success('Type de membre supprimé avec succès');
    };

    const handleSaveTypeMember = () => {
        if (!typeMemberFormData.nom.trim()) {
            toast.error('Veuillez saisir un nom pour le type de membre');
            return;
        }

        if (typeMemberModalMode === 'add') {
            const newTypeMember = {
                ...typeMemberFormData,
                id: Math.max(...memberTypes.map(t => t.id), 0) + 1
            };
            setMemberTypes([...memberTypes, newTypeMember]);
            toast.success('Type de membre ajouté avec succès');
        } else {
            setMemberTypes(memberTypes.map(t => 
                t.id === selectedTypeMember.id ? { ...typeMemberFormData, id: selectedTypeMember.id } : t
            ));
            toast.success('Type de membre modifié avec succès');
        }

        setShowTypeMemberModal(false);
    };

    const toggleTypeMemberRight = (right) => {
        const currentRights = typeMemberFormData.droits;
        if (currentRights.includes(right)) {
            setTypeMemberFormData({
                ...typeMemberFormData,
                droits: currentRights.filter(r => r !== right)
            });
        } else {
            setTypeMemberFormData({
                ...typeMemberFormData,
                droits: [...currentRights, right]
            });
        }
    };

    const availableRights = [
        { id: 'admin', label: 'Administration complète', description: 'Accès total à toutes les fonctionnalités' },
        { id: 'manage_members', label: 'Gestion des membres', description: 'Créer, modifier et supprimer des membres' },
        { id: 'manage_events', label: 'Gestion des événements', description: 'Créer et gérer les événements' },
        { id: 'manage_bar', label: 'Gestion du bar', description: 'Gérer les boissons et le stock' },
        { id: 'view_stats', label: 'Consultation des statistiques', description: 'Accès aux rapports et statistiques' },
        { id: 'manage_teams', label: 'Gestion des équipes', description: 'Créer et gérer les équipes' }
    ];

    const filteredTypeMember = memberTypes.filter(type => 
        type.nom.toLowerCase().includes(typeMemberSearchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(typeMemberSearchTerm.toLowerCase())
    );

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
                c.id === selectedConcours.id ? { ...concoursData, id: selectedConcours.id } : c
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
                l.id === selectedLoto.id ? { ...lotoData, id: selectedLoto.id } : l
            ));
            toast.success('Loto modifié avec succès');
        }

        setShowLotoModal(false);
    };

    // Fonctions de gestion des événements
    const handleAddEvent = () => {
        console.log('handleAddEvent appelé, activeModal actuel:', activeModal);
        // Ouvrir directement le modal principal des événements ET le modal d'ajout
        setActiveModal('evenement');
        setEventModalMode('add');
        setSelectedEvent(null);
        setEventFormData({
            titre: '',
            date: '',
            description: '',
            photos: []
        });
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
        console.log("Ouverture du modal d'ajout d'événement");
        setShowEventModal(true);
    };

    const handleEditEvent = async (event) => {
        console.log('handleEditEvent appelé pour événement:', event.id, 'activeModal actuel:', activeModal);
        // Ouvrir directement le modal principal des événements ET le modal de modification
        setActiveModal('evenement');
        setEventModalMode('edit');
        setSelectedEvent(event);
        setEventFormData({
            titre: event.titre || event.title, // Support des deux formats
            date: event.date,
            description: event.description,
            photos: []
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
            console.error('Erreur lors du chargement des photos:', error);
        }
        
        console.log("Ouverture du modal de modification d'événement");
        setShowEventModal(true);
    };

    const handleDeleteEvent = (event) => {
        console.log('handleDeleteEvent appelé pour événement:', event.id, 'activeModal actuel:', activeModal);
        // Ouvrir directement le modal principal des événements ET le modal de suppression
        setActiveModal('evenement');
        setEventToDelete(event);
        console.log('Ouverture du modal de confirmation de suppression');
        setShowEventDeleteConfirm(true);
    };

    const confirmDeleteEvent = async () => {
        try {
            await eventsAPI.delete(eventToDelete.id);
            toast.success('Événement supprimé avec succès');
            
            // Recharger les événements et les statistiques
            await loadEvents();
            await loadStats();
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            toast.error('Erreur lors de la suppression de l\'événement');
        }
        
        setShowEventDeleteConfirm(false);
        setEventToDelete(null);
    };

    const handleEventPhotosChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            toast.error('Vous ne pouvez sélectionner que 10 photos maximum');
            return;
        }
        
        if (files.length > 0) {
            const validFiles = files.filter(file => {
                if (!file.type.startsWith('image/')) {
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    toast.error(`Le fichier ${file.name} est trop volumineux (max 5MB)`);
                    return false;
                }
                return true;
            });
            
            if (validFiles.length !== files.length) {
                toast.error('Seuls les fichiers image de moins de 5MB sont acceptés');
            }
            
            setSelectedEventPhotos(validFiles);
            
            // Créer les prévisualisations
            const previews = [];
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previews.push({
                        file: file,
                        preview: e.target.result,
                        name: file.name
                    });
                    if (previews.length === validFiles.length) {
                        setEventPhotosPreviews(prev => [...prev, ...previews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeEventPhoto = (index) => {
        setEventPhotosPreviews(prev => prev.filter((_, i) => i !== index));
        if (index < selectedEventPhotos.length) {
            setSelectedEventPhotos(prev => prev.filter((_, i) => i !== index));
        }
    };
    
    const deleteExistingEventPhoto = async (photoId) => {
        if (!selectedEvent) return;
        
        try {
            await fetch(`/api/events/${selectedEvent.id}/photos/${photoId}`, {
                method: 'DELETE'
            });
            
            // Recharger les photos de l'événement
            const response = await fetch(`/api/events/${selectedEvent.id}/photos`);
            const photos = await response.json();
            setExistingEventPhotos(photos);
            
            toast.success('Photo supprimée avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
            toast.error('Erreur lors de la suppression de la photo');
        }
    };

    const handleSaveEvent = async () => {
        if (!eventFormData.titre.trim() || !eventFormData.date) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const eventData = {
            ...eventFormData,
            photos: [] // On ne stocke plus les photos en base64
        };

        try {
            let eventId;
            if (eventModalMode === 'add') {
                const newEvent = await eventsAPI.create(eventData);
                eventId = newEvent.id;
                toast.success('Événement ajouté avec succès');
            } else {
                await eventsAPI.update(selectedEvent.id, eventData);
                eventId = selectedEvent.id;
                toast.success('Événement modifié avec succès');
            }
            
            // Upload des photos si il y en a
            if (selectedEventPhotos.length > 0) {
                const formData = new FormData();
                selectedEventPhotos.forEach(file => {
                    formData.append('photos', file);
                });
                
                try {
                    await fetch(`/api/events/${eventId}/photos`, {
                        method: 'POST',
                        body: formData
                    });
                    toast.success('Photos uploadées avec succès');
                } catch (photoError) {
                    console.error('Erreur lors de l\'upload des photos:', photoError);
                    toast.error('Erreur lors de l\'upload des photos');
                }
            }
            
            // Recharger les événements et les statistiques
            await loadEvents();
            await loadStats();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'événement:', error);
            toast.error('Erreur lors de la sauvegarde de l\'événement');
        }

        setShowEventModal(false);
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
    };

    // Gestion des événements clavier
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && activeModal) {
                setActiveModal(null);
            }
        };

        if (activeModal) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [activeModal]);

    const handleAdjustStock = (drinkId, change) => {
        const drink = drinks.find(d => d.id === drinkId);
        if (drink) {
            const newStock = Math.max(0, drink.stock + change);
            updateDrink(drinkId, { stock: newStock });
        }
    };

    const filteredDrinks = drinks.filter(drink => {
        const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const ManagementCard = ({ title, icon: Icon, count, description, modalKey }) => (
        <div 
            className="p-6 bg-white rounded-lg shadow-md transition-all duration-200 transform cursor-pointer hover:shadow-lg hover:scale-105"
            onClick={() => setActiveModal(modalKey)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#425e9b] bg-opacity-10 rounded-lg">
                        <Icon className="w-6 h-6 text-[#425e9b]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-[#425e9b]">{count}</div>
                </div>
            </div>
            <div className="flex justify-center items-center py-2">
                <span className="text-sm text-[#425e9b] font-medium">Cliquer pour gérer →</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#425e9b]"></div>
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
                        Gérez tous les aspects de votre club de pétanque depuis cette interface centralisée
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        title="Galerie"
                        icon={Camera}
                        count={stats.albums}
                        description="Gestion des photos et médias"
                        modalKey="galerie"
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
                                {activeModal === 'bar' && 'Gestion du Bar'}
                                {activeModal === 'membre' && 'Gestion des Membres'}
                                {activeModal === 'typeMembre' && 'Gestion des Types de Membre'}
                                {activeModal === 'evenement' && 'Gestion des Événements'}
                                {activeModal === 'equipe' && 'Gestion des Équipes'}
                                {activeModal === 'resultat' && 'Gestion des Résultats'}
                                {activeModal === 'galerie' && 'Gestion de la Galerie'}
                                {activeModal === 'concours' && 'Gestion des Concours'}
                                {activeModal === 'loto' && 'Gestion des Lotos'}
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
                            {activeModal === 'bar' && (
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
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddDrink}
                                                className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center space-x-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Ajouter</span>
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {filteredDrinks.length} boisson{filteredDrinks.length > 1 ? 's' : ''} trouvée{filteredDrinks.length > 1 ? 's' : ''}
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
                                                    {filteredDrinks.map((drink) => (
                                                        <tr key={drink.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="flex-shrink-0 w-10 h-10">
                                                                        <img
                                                                            className="object-cover w-10 h-10 rounded-full"
                                                                            src={drink.image}
                                                                            alt={drink.name}
                                                                            onError={(e) => {
                                                                                e.target.src = 'https://via.placeholder.com/40x40?text=?';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {drink.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {drink.description}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                {drink.price}€
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => handleAdjustStock(drink.id, -1)}
                                                                        className="p-1 text-gray-400 transition-colors hover:text-red-600"
                                                                        disabled={drink.stock <= 0}
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                                                                        drink.stock <= 5 
                                                                            ? 'bg-red-100 text-red-800' 
                                                                            : drink.stock <= 10 
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {drink.stock}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleAdjustStock(drink.id, 1)}
                                                                        className="p-1 text-gray-400 transition-colors hover:text-green-600"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditDrink(drink)}
                                                                        className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDrink(drink)}
                                                                        className="text-red-600 transition-colors hover:text-red-800"
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
                                    </div>
                                </div>
                            )}

            {/* Modal Ajouter/Modifier événement */}
            {activeModal === 'evenement' && showEventModal && (
                <div className="flex fixed inset-0 z-[70] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {eventModalMode === 'add' ? 'Ajouter un événement' : 'Modifier l\'événement'}
                                </h3>
                                <button
                                    onClick={() => setShowEventModal(false)}
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
                                        value={eventFormData.titre}
                                        onChange={(e) => setEventFormData({...eventFormData, titre: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        value={eventFormData.date}
                                        onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={eventFormData.description}
                                        onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={handleEventPhotosChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Vous pouvez sélectionner plusieurs photos</p>
                                </div>

                                {/* Photos existantes */}
                                {existingEventPhotos.length > 0 && (
                                    <div className="md:col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Photos existantes
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                            {existingEventPhotos.map((photo) => (
                                                <div key={photo.id} className="relative group">
                                                    <img
                                                        src={`http://localhost:5555/api/events/photos/${photo.filename}`}
                                                        alt={photo.filename}
                                                        className="object-cover w-full h-24 rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => deleteExistingEventPhoto(photo.id)}
                                                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                                        title="Supprimer cette photo"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Prévisualisation des nouvelles photos */}
                                {eventPhotosPreviews.length > 0 && (
                                    <div className="md:col-span-2">
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Nouvelles photos à ajouter
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                            {eventPhotosPreviews.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={photo.preview}
                                                        alt={photo.name}
                                                        className="object-cover w-full h-24 rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => removeEventPhoto(index)}
                                                        className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                                        title="Supprimer cette photo"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{eventModalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression événement */}
            {activeModal === 'evenement' && showEventDeleteConfirm && (
                <div className="flex fixed inset-0 z-[70] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md bg-white rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() => setShowEventDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.titre}" ?
                                Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowEventDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteEvent}
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

            {activeModal === 'evenement' && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Gestion des Événements</h3>
                                <button
                                    onClick={() => setActiveModal(null)}
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
                                            value={eventSearchTerm}
                                            onChange={(e) => setEventSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddEvent}
                                        className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Ajouter un événement</span>
                                    </button>
                                </div>

                                {/* Tableau des événements */}
                                <div className="overflow-hidden bg-white rounded-lg shadow">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Titre</th>
                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Photos</th>
                                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredEvents.length > 0 ? (
                                                    filteredEvents.map(event => (
                                                        <tr key={event.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{event.titre}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                {new Date(event.date).toLocaleDateString('fr-FR')}
                                                            </td>
                                                            <td className="px-6 py-4 max-w-xs text-sm text-gray-900 truncate">{event.description}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                {event.photos && event.photos.length > 0 ? (
                                                                    <span className="text-blue-600">{event.photos.length} photo{event.photos.length > 1 ? 's' : ''}</span>
                                                                ) : (
                                                                    <span className="text-gray-400">Aucune photo</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditEvent(event)}
                                                                        className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                        title="Modifier"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteEvent(event)}
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
                                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                            Aucun événement trouvé
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
            {activeModal === 'loto' && (
                <div className="flex fixed inset-0 z-[50] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Gestion des Lotos</h3>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

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
                                    onClick={() => handleAddLoto()}
                                    className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Ajouter un loto</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full bg-white border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">Nom</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">Date</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">Prix du carton</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">Lots à gagner</th>
                                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">Statut</th>
                                            <th className="px-4 py-3 text-sm font-medium text-center text-gray-900 border border-gray-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLotos.length > 0 ? (
                                            filteredLotos.map((loto) => (
                                                <tr key={loto.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">{loto.nom}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">
                                                        {new Date(loto.date).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{loto.prixCarton}€</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{loto.lotsAGagner}</td>
                                                    <td className="px-4 py-3 border border-gray-200">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                            loto.statut === 'actif' ? 'bg-green-100 text-green-800' :
                                                            loto.statut === 'termine' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {loto.statut === 'actif' ? 'Actif' :
                                                             loto.statut === 'termine' ? 'Terminé' : 'En attente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-200">
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditLoto(loto)}
                                                                className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLoto(loto)}
                                                                className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
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
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 border border-gray-200">
                                                    Aucun loto trouvé
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
                                    {lotoModalMode === 'add' ? 'Ajouter un loto' : 'Modifier le loto'}
                                </h3>
                                <button
                                    onClick={() => setShowLotoModal(false)}
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
                                        onChange={(e) => setLotoFormData({...lotoFormData, nom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Nom du loto"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={lotoFormData.date}
                                        onChange={(e) => setLotoFormData({...lotoFormData, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        value={lotoFormData.statut}
                                        onChange={(e) => setLotoFormData({...lotoFormData, statut: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    >
                                        <option value="en_attente">En attente</option>
                                        <option value="actif">Actif</option>
                                        <option value="termine">Terminé</option>
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
                                        value={lotoFormData.prixCarton}
                                        onChange={(e) => setLotoFormData({...lotoFormData, prixCarton: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Lots à gagner *
                                    </label>
                                    <input
                                        type="text"
                                        value={lotoFormData.lotsAGagner}
                                        onChange={(e) => setLotoFormData({...lotoFormData, lotsAGagner: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Ex: Jambon, Bouteilles de vin..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={lotoFormData.description}
                                        onChange={(e) => setLotoFormData({...lotoFormData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        rows="3"
                                        placeholder="Description du loto..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowLotoModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveLoto}
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{lotoModalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
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
                                    onClick={() => setShowLotoDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le loto "{lotoToDelete?.nom}" ?
                                Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowLotoDeleteConfirm(false)}
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

                            {activeModal === 'concours' && (
                                <div className="space-y-6">
                                    {/* Barre de recherche et bouton d'ajout */}
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
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
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
                                                        filteredConcours.map(concours => (
                                                            <tr key={concours.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{concours.nom}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                    {new Date(concours.date).toLocaleDateString('fr-FR')}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{concours.prixInscription}€</td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{concours.prixAGagner}€</td>
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

            {/* Modal Ajouter/Modifier concours */}
            {showConcoursModal && (
                <div className="flex fixed inset-0 z-[60] justify-center items-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {concoursModalMode === 'add' ? 'Ajouter un concours' : 'Modifier le concours'}
                                </h3>
                                <button
                                    onClick={() => setShowConcoursModal(false)}
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
                                        value={concoursFormData.nom}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, nom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        value={concoursFormData.date}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <select
                                        value={concoursFormData.statut}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, statut: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    >
                                        <option value="en_attente">En attente</option>
                                        <option value="actif">Actif</option>
                                        <option value="termine">Terminé</option>
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
                                        value={concoursFormData.prixInscription}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, prixInscription: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        value={concoursFormData.prixGagner}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, prixGagner: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={concoursFormData.description}
                                        onChange={(e) => setConcoursFormData({...concoursFormData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        rows="3"
                                        placeholder="Description du concours, règles, conditions..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowConcoursModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveConcours}
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{concoursModalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
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
                                    onClick={() => setShowConcoursDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le concours "{concoursToDelete?.nom}" ?
                                Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConcoursDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteConcours}
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
            {activeModal === 'concours' && (
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
                                    onChange={(e) => setConcoursSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddConcours}
                            className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
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
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prix inscription</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prix à gagner</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Statut</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredConcours.map(concours => (
                                        <tr key={concours.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{concours.nom}</div>
                                                <div className="text-sm text-gray-500">{concours.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {new Date(concours.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{concours.prixInscription}€</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{concours.prixGagner}€</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                    concours.statut === 'actif' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : concours.statut === 'termine'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {concours.statut === 'actif' ? 'Actif' : concours.statut === 'termine' ? 'Terminé' : 'En attente'}
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
                                    ))}
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
                                    {typeMemberModalMode === 'add' ? 'Ajouter un type de membre' : 'Modifier le type de membre'}
                                </h3>
                                <button
                                    onClick={() => setShowTypeMemberModal(false)}
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
                                        value={typeMemberFormData.nom}
                                        onChange={(e) => setTypeMemberFormData({...typeMemberFormData, nom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="Ex: Administrateur, Modérateur, Membre standard"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={typeMemberFormData.description}
                                        onChange={(e) => setTypeMemberFormData({...typeMemberFormData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        {availableRights.map(right => (
                                            <label key={right.id} className="flex items-center p-3 space-x-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={typeMemberFormData.droits.includes(right.id)}
                                                    onChange={() => toggleTypeMemberRight(right.id)}
                                                    className="w-4 h-4 text-[#425e9b] border-gray-300 rounded focus:ring-[#425e9b]"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{right.label}</div>
                                                    <div className="text-xs text-gray-500">{right.description}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {typeMemberFormData.droits.length > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="mb-2 text-sm font-medium text-blue-900">Aperçu des permissions accordées :</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {typeMemberFormData.droits.map(droitId => {
                                                const right = availableRights.find(r => r.id === droitId);
                                                return (
                                                    <span key={droitId} className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                                        {right ? right.label : droitId}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setShowTypeMemberModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveTypeMember}
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{typeMemberModalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
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
                                    onClick={() => setShowTypeMemberDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le type de membre "{typeMemberToDelete?.nom}" ?
                                Cette action est irréversible et pourrait affecter les membres existants.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowTypeMemberDeleteConfirm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDeleteTypeMember}
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

                            {activeModal === 'membre' && (
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
                                                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <select
                                            value={selectedMemberType}
                                            onChange={(e) => setSelectedMemberType(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        >
                                            <option value="">Tous les types</option>
                                            {memberTypes.map(type => (
                                                <option key={type.id} value={type.id.toString()}>{type.nom}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAddMember}
                                            className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
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
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prénom</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Téléphone</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">N° Licence</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date d'entrée</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredMembers.map(member => (
                                                        <tr key={member.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{member.nom}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{member.prenom}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{member.email}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{member.telephone}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="px-2 py-1 bg-[#425e9b] bg-opacity-10 text-[#425e9b] rounded-full text-sm font-medium">
                                                                    {getMemberTypeName(member.typeMembreId)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{member.numeroLicence}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                                {new Date(member.dateEntree).toLocaleDateString('fr-FR')}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditMember(member)}
                                                                        className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                        title="Modifier"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMember(member)}
                                                                        className="text-red-600 transition-colors hover:text-red-800"
                                                                        title="Supprimer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
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

                            {activeModal === 'typeMembre' && (
                                <div className="space-y-6">
                                    {/* Barre de recherche et bouton d'ajout */}
                                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un type de membre..."
                                                    value={typeMemberSearchTerm}
                                                    onChange={(e) => setTypeMemberSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddTypeMember}
                                            className="bg-[#425e9b] text-white px-4 py-2 rounded-lg hover:bg-[#364a82] transition-colors flex items-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Ajouter un type
                                        </button>
                                    </div>

                                    {/* Statistiques */}
                                    <div className="mb-6">
                                        <div className="text-sm text-gray-600">
                                            {filteredTypeMember.length} type{filteredTypeMember.length > 1 ? 's' : ''} de membre{filteredTypeMember.length > 1 ? 's' : ''} trouvé{filteredTypeMember.length > 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    {/* Tableau des types de membres */}
                                    <div className="overflow-hidden bg-white rounded-lg shadow">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nom du type</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Droits</th>
                                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredTypeMember.map(type => (
                                                        <tr key={type.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <Shield className="h-5 w-5 text-[#425e9b] mr-2" />
                                                                    <span className="text-sm font-medium text-gray-900">{type.nom}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-gray-900">{type.description}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {type.droits.map(droit => {
                                                                        const rightInfo = availableRights.find(r => r.id === droit);
                                                                        return (
                                                                            <span key={droit} className="px-2 py-1 bg-[#425e9b] bg-opacity-10 text-[#425e9b] rounded-full text-xs font-medium">
                                                                                {rightInfo ? rightInfo.label : droit}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                    {type.droits.length === 0 && (
                                                                        <span className="text-xs italic text-gray-500">Aucun droit défini</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditTypeMember(type)}
                                                                        className="text-[#425e9b] hover:text-[#364a82] transition-colors"
                                                                        title="Modifier"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteTypeMember(type)}
                                                                        className="text-red-600 transition-colors hover:text-red-800"
                                                                        title="Supprimer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredTypeMember.length === 0 && (
                                                <div className="py-8 text-center text-gray-500">
                                                    Aucun type de membre trouvé
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modales vides pour les autres sections */}
                            {activeModal !== 'bar' && activeModal !== 'membre' && activeModal !== 'typeMembre' && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 w-12 h-12 text-gray-400">
                                        {activeModal === 'evenement' && <Calendar className="w-12 h-12" />}
                                        {activeModal === 'equipe' && <Trophy className="w-12 h-12" />}
                                        {activeModal === 'resultat' && <BarChart3 className="w-12 h-12" />}
                                        {activeModal === 'galerie' && <Camera className="w-12 h-12" />}
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                                        Fonctionnalités à venir
                                    </h3>
                                    <p className="text-gray-600">
                                        Cette section sera bientôt disponible avec toutes les fonctionnalités de gestion.
                                    </p>
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
                                    {modalMode === 'add' ? 'Ajouter une boisson' : 'Modifier la boisson'}
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
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                                    <svg className="mb-4 w-8 h-8 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
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
                                                        setSelectedImageFile(null);
                                                        setFormData({...formData, image: ''});
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
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{modalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
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
                                Êtes-vous sûr de vouloir supprimer la boisson "{drinkToDelete?.name}" ?
                                Cette action est irréversible.
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
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {memberModalMode === 'add' ? 'Ajouter un membre' : 'Modifier le membre'}
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
                                        onChange={(e) => setMemberFormData({...memberFormData, nom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setMemberFormData({...memberFormData, prenom: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setMemberFormData({...memberFormData, telephone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setMemberFormData({...memberFormData, numeroLicence: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
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
                                        onChange={(e) => setMemberFormData({...memberFormData, adresse: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                        rows="2"
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                        Date de naissance
                                    </label>
                                    <input
                                        type="date"
                                        value={memberFormData.dateNaissance}
                                        onChange={(e) => setMemberFormData({...memberFormData, dateNaissance: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        <CalendarIcon className="inline mr-1 w-4 h-4" />
                                        Date d'entrée
                                    </label>
                                    <input
                                        type="date"
                                        value={memberFormData.dateEntree}
                                        onChange={(e) => setMemberFormData({...memberFormData, dateEntree: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Photo du membre
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex justify-center items-center w-full">
                                            <label className="flex flex-col justify-center items-center w-full h-32 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed transition-colors cursor-pointer hover:bg-gray-100">
                                                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                                                    <svg className="mb-4 w-8 h-8 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
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
                                                        setSelectedImageFile(null);
                                                        setMemberFormData({...memberFormData, photo: ''});
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
                                        onChange={(e) => setMemberFormData({...memberFormData, typeMembreId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                                    >
                                        <option value="">Sélectionner un type</option>
                                        {memberTypes.map(type => (
                                            <option key={type.id} value={type.id.toString()}>{type.nom}</option>
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
                                    className="px-4 py-2 bg-[#425e9b] text-white hover:bg-[#364a82] rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{memberModalMode === 'add' ? 'Ajouter' : 'Modifier'}</span>
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
                                    onClick={() => setShowMemberDeleteConfirm(false)}
                                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le membre "{memberToDelete?.prenom} {memberToDelete?.nom}" ?
                                Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowMemberDeleteConfirm(false)}
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
