import React, { useState, useEffect } from "react";
import {
    Calendar,
    Plus,
    Edit,
    Trash2,
    Search,
    Camera,
    X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { eventsAPI } from "../lib/api";

const EventManagement = ({ onStatsUpdate, onClose }) => {
    // États pour la gestion des événements
    const [events, setEvents] = useState([]);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showEventDeleteConfirm, setShowEventDeleteConfirm] = useState(false);
    const [eventSearchTerm, setEventSearchTerm] = useState("");
    
    // États pour le modal d'événement
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventModalMode, setEventModalMode] = useState("add");
    const [eventFormData, setEventFormData] = useState({
        titre: "",
        date: "",
        heure: "",
        lieu: "",
        publicCible: "",
        description: "",
        photos: []
    });
    
    // États pour la gestion des photos
    const [selectedEventPhotos, setSelectedEventPhotos] = useState([]);
    const [eventPhotosPreviews, setEventPhotosPreviews] = useState([]);
    const [existingEventPhotos, setExistingEventPhotos] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    useEffect(() => {
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
            
            // Mettre à jour les statistiques si la fonction est fournie
            if (onStatsUpdate) {
                onStatsUpdate({ events: eventsWithPhotos.length });
            }
        } catch (error) {
            console.error("Erreur lors du chargement des événements:", error);
            toast.error("Erreur lors du chargement des événements");
        }
    };

    const handleAddEvent = () => {
        setEventModalMode("add");
        setSelectedEvent(null);
        setEventFormData({
            titre: "",
            date: "",
            heure: "",
            lieu: "",
            publicCible: "",
            description: "",
            photos: []
        });
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
        setShowEventModal(true);
    };

    const handleEditEvent = async (event) => {
        setEventModalMode("edit");
        setSelectedEvent(event);
        setEventFormData({
            id: event.id,
            titre: event.titre || event.title,
            date: event.date,
            heure: event.heure || "",
            lieu: event.lieu || "",
            publicCible: event.publicCible || "",
            description: event.description || "",
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
            console.error("Erreur lors du chargement des photos:", error);
        }
        
        setShowEventModal(true);
    };

    const handleDeleteEvent = (event) => {
        setEventToDelete(event);
        setShowEventDeleteConfirm(true);
    };

    const confirmDeleteEvent = async () => {
        try {
            await eventsAPI.delete(eventToDelete.id);
            toast.success("Événement supprimé avec succès");

            // Recharger les événements
            await loadEvents();
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

    // Fonctions pour le modal d'événement
    const handleEventFormChange = (e) => {
        const { name, value } = e.target;
        setEventFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Fonctions pour la gestion des photos
    const handleEventPhotosChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedEventPhotos.length > 10) {
            toast.error("Vous ne pouvez pas ajouter plus de 10 photos");
            return;
        }
        
        const newPhotos = [...selectedEventPhotos, ...files];
        setSelectedEventPhotos(newPhotos);
        
        // Créer les previews
        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        setEventPhotosPreviews(prev => [...prev, ...newPreviews]);
    };
    
    const removeEventPhoto = (index) => {
        const newPhotos = selectedEventPhotos.filter((_, i) => i !== index);
        const newPreviews = eventPhotosPreviews.filter((_, i) => i !== index);
        
        // Libérer l'URL de l'objet
        URL.revokeObjectURL(eventPhotosPreviews[index].preview);
        
        setSelectedEventPhotos(newPhotos);
        setEventPhotosPreviews(newPreviews);
    };
    
    const removeExistingEventPhoto = async (photoId) => {
        try {
            await fetch(`/api/events/photos/${photoId}`, {
                method: 'DELETE'
            });
            setExistingEventPhotos(prev => prev.filter(photo => photo.id !== photoId));
            toast.success("Photo supprimée avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression de la photo:", error);
            toast.error("Erreur lors de la suppression de la photo");
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        
        if (!eventFormData.titre.trim() || !eventFormData.date) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }
        
        try {
            let eventId;
            if (eventModalMode === "add") {
                const newEvent = await eventsAPI.create(eventFormData);
                eventId = newEvent.id;
                toast.success("Événement ajouté avec succès");
            } else {
                await eventsAPI.update(eventFormData.id, eventFormData);
                eventId = eventFormData.id;
                toast.success("Événement modifié avec succès");
            }
            
            // Upload des nouvelles photos
            if (selectedEventPhotos.length > 0) {
                const formData = new FormData();
                selectedEventPhotos.forEach((file) => {
                    formData.append("photos", file);
                });
                
                try {
                    await fetch(`/api/events/${eventId}/photos`, {
                        method: "POST",
                        body: formData
                    });
                    toast.success("Photos uploadées avec succès");
                } catch (photoError) {
                    console.error("Erreur lors de l'upload des photos:", photoError);
                    toast.error("Erreur lors de l'upload des photos");
                }
            }
            
            setShowEventModal(false);
            setSelectedEventPhotos([]);
            setEventPhotosPreviews([]);
            setExistingEventPhotos([]);
            await loadEvents();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'événement:", error);
            toast.error("Erreur lors de la sauvegarde de l'événement");
        }
    };

    const closeEventModal = () => {
        setShowEventModal(false);
        setEventFormData({
            titre: "",
            date: "",
            heure: "",
            lieu: "",
            publicCible: "",
            description: "",
            photos: []
        });
        
        // Nettoyer les états des photos
        eventPhotosPreviews.forEach(preview => {
            URL.revokeObjectURL(preview.preview);
        });
        setSelectedEventPhotos([]);
        setEventPhotosPreviews([]);
        setExistingEventPhotos([]);
        setSelectedEvent(null);
    };

    return (
        <>
            {/* Modal de confirmation de suppression */}
            {showEventDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.titre}" ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
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
            )}

            {/* Modal d'événement */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-[1280px] w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {eventModalMode === "add" ? "Ajouter un événement" : "Modifier l'événement"}
                        </h3>
                        
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={eventFormData.titre}
                                    onChange={handleEventFormChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={eventFormData.date}
                                        onChange={handleEventFormChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Heure
                                    </label>
                                    <input
                                        type="time"
                                        name="heure"
                                        value={eventFormData.heure}
                                        onChange={handleEventFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lieu
                                </label>
                                <input
                                    type="text"
                                    name="lieu"
                                    value={eventFormData.lieu}
                                    onChange={handleEventFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Public cible
                                </label>
                                <input
                                    type="text"
                                    name="publicCible"
                                    value={eventFormData.publicCible}
                                    onChange={handleEventFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={eventFormData.description}
                                    onChange={handleEventFormChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Camera className="inline mr-1 w-4 h-4" />
                                    Photos de l'événement (max 10)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleEventPhotosChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                
                                {/* Photos existantes */}
                                {existingEventPhotos.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Photos actuelles:
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {existingEventPhotos.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={photo.url}
                                                        alt={`Photo ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingEventPhoto(photo.id)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Nouvelles photos à ajouter */}
                                {eventPhotosPreviews.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            Nouvelles photos à ajouter:
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {eventPhotosPreviews.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={photo.preview}
                                                        alt={photo.name}
                                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEventPhoto(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEventModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                                >
                                    {eventModalMode === "add" ? "Ajouter" : "Modifier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Interface principale de gestion des événements */}
            <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#425e9b] bg-opacity-10 rounded-lg">
                            <Calendar className="w-6 h-6 text-[#425e9b]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestion des Événements</h2>
                            <p className="text-gray-600">Gérez les événements et animations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Barre de recherche et bouton d'ajout */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Titre
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Lieu
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
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {event.titre || event.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(event.date).toLocaleDateString('fr-FR')}
                                                    {event.heure && (
                                                        <div className="text-xs text-gray-500">
                                                            {event.heure}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {event.lieu || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {event.description || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {event.photos?.length || 0} photo(s)
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            {eventSearchTerm
                                                ? "Aucun événement trouvé pour cette recherche"
                                                : "Aucun événement créé"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventManagement;