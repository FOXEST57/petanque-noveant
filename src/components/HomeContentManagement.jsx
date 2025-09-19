import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Home,
    Save,
    X,
    Camera,
    ChevronUp,
    ChevronDown,
    Trash2,
    MapPin,
    Edit,
} from "lucide-react";

const HomeContentManagement = ({ onClose }) => {
    // États pour la gestion de la page d'accueil
    const [homeContent, setHomeContent] = useState({
        title: "",
        description: "",
        carouselImages: [],
        openingHours: "",
        location: "",
        members: "",
        clubTitle: "",
        clubDescription: "",
        teamsContent: "",
        animationsContent: "",
        tournamentsContent: "",
    });
    const [originalHomeContent, setOriginalHomeContent] = useState({
        title: "",
        description: "",
        carouselImages: [],
        openingHours: "",
        location: "",
        members: "",
        clubTitle: "",
        clubDescription: "",
        teamsContent: "",
        animationsContent: "",
        tournamentsContent: "",
    });
    const [homeContentLoading, setHomeContentLoading] = useState(false);
    const [selectedCarouselFiles, setSelectedCarouselFiles] = useState([]);
    const [carouselPreviews, setCarouselPreviews] = useState([]);
    const [existingCarouselImages, setExistingCarouselImages] = useState([]);

    useEffect(() => {
        loadHomeContent();
    }, []);

    // Fonctions de gestion de la page d'accueil
    const loadHomeContent = async () => {
        try {
            setHomeContentLoading(true);
            console.log("Chargement du contenu de la page d'accueil...");
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3002"
                }/api/home-content`
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Réponse API complète:", result);
                const data = result.data;
                console.log("Données reçues:", data);
                console.log("Images du carrousel reçues:", data.carouselImages);

                const contentData = {
                    title: data.title || "",
                    description: data.description || "",
                    carouselImages: data.carouselImages || [],
                    openingHours: data.openingHours || "",
                    location: data.location || "",
                    members: data.members || "",
                    clubTitle: data.clubTitle || "Découvrez notre club",
                    clubDescription: data.clubDescription || "",
                    teamsContent: data.teamsContent || "",
                    animationsContent: data.animationsContent || "",
                    tournamentsContent: data.tournamentsContent || "",
                };

                setHomeContent(contentData);
                setOriginalHomeContent(contentData);
                setExistingCarouselImages(data.carouselImages || []);

                console.log("✅ Contenu de la page d'accueil chargé avec succès");
            } else {
                console.error(
                    "❌ Erreur HTTP lors du chargement:",
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

            if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
                console.log("❌ Aucun fichier sélectionné ou événement invalide");
                return;
            }

            console.log("✅ Validation initiale réussie");

            let files;
            try {
                files = Array.from(e.target.files);
                console.log("📊 Fichiers convertis en array:", files);
            } catch (conversionError) {
                console.error("❌ Erreur lors de la conversion des fichiers:", conversionError);
                toast.error("Erreur lors de la sélection des fichiers");
                return;
            }

            const validFiles = files.filter((file) => {
                const isValid = file.type.startsWith("image/");
                if (!isValid) {
                    console.log(`❌ Fichier invalide (pas une image): ${file.name}`);
                }
                return isValid;
            });

            console.log("📊 Fichiers valides:", validFiles);

            if (validFiles.length === 0) {
                console.log("❌ Aucun fichier image valide");
                toast.error("Veuillez sélectionner des fichiers image valides");
                return;
            }

            setSelectedCarouselFiles(validFiles);

            // Créer les aperçus
            const previews = validFiles.map((file) => {
                const url = URL.createObjectURL(file);
                console.log(`📊 Aperçu créé pour ${file.name}:`, url);
                return {
                    file,
                    url,
                    title: "",
                };
            });

            setCarouselPreviews(previews);
            console.log("✅ handleCarouselImagesChange - FIN");
        } catch (error) {
            console.error("❌ Erreur dans handleCarouselImagesChange:", error);
            toast.error("Erreur lors de la sélection des images");
        }
    };

    const handleExistingImageTitleChange = (index, newTitle) => {
        const updatedImages = [...existingCarouselImages];
        updatedImages[index] = { ...updatedImages[index], title: newTitle };
        setExistingCarouselImages(updatedImages);
        
        // Mettre à jour aussi homeContent.carouselImages
        setHomeContent(prev => ({
            ...prev,
            carouselImages: updatedImages
        }));
    };

    const handleNewImageTitleChange = (index, newTitle) => {
        const updatedPreviews = [...carouselPreviews];
        updatedPreviews[index] = { ...updatedPreviews[index], title: newTitle };
        setCarouselPreviews(updatedPreviews);
    };

    const moveCarouselImage = (index, direction, isExisting = false) => {
        if (isExisting) {
            const images = [...existingCarouselImages];
            const newIndex = direction === "up" ? index - 1 : index + 1;
            
            if (newIndex >= 0 && newIndex < images.length) {
                [images[index], images[newIndex]] = [images[newIndex], images[index]];
                setExistingCarouselImages(images);
                setHomeContent(prev => ({ ...prev, carouselImages: images }));
            }
        } else {
            const previews = [...carouselPreviews];
            const files = [...selectedCarouselFiles];
            const newIndex = direction === "up" ? index - 1 : index + 1;
            
            if (newIndex >= 0 && newIndex < previews.length) {
                [previews[index], previews[newIndex]] = [previews[newIndex], previews[index]];
                [files[index], files[newIndex]] = [files[newIndex], files[index]];
                setCarouselPreviews(previews);
                setSelectedCarouselFiles(files);
            }
        }
    };

    const removeCarouselImage = (index, isExisting = false) => {
        if (isExisting) {
            const updatedImages = existingCarouselImages.filter((_, i) => i !== index);
            setExistingCarouselImages(updatedImages);
            setHomeContent(prev => ({ ...prev, carouselImages: updatedImages }));
        } else {
            const updatedPreviews = carouselPreviews.filter((_, i) => i !== index);
            const updatedFiles = selectedCarouselFiles.filter((_, i) => i !== index);
            setCarouselPreviews(updatedPreviews);
            setSelectedCarouselFiles(updatedFiles);
        }
    };

    const handleSaveHomeContent = async () => {
        try {
            console.log("🚀 Début de la sauvegarde du contenu");
            setHomeContentLoading(true);

            const formData = new FormData();

            // Ajouter les données textuelles
            const textData = {
                title: homeContent.title || "",
                description: homeContent.description || "",
                openingHours: homeContent.openingHours || "",
                location: homeContent.location || "",
                members: homeContent.members || "",
                clubTitle: homeContent.clubTitle || "",
                clubDescription: homeContent.clubDescription || "",
                teamsContent: homeContent.teamsContent || "",
                animationsContent: homeContent.animationsContent || "",
                tournamentsContent: homeContent.tournamentsContent || "",
            };

            console.log("📊 Données textuelles à envoyer:", textData);
            formData.append("homeContent", JSON.stringify(textData));

            // Ajouter les images existantes mises à jour
            console.log("📊 Images existantes:", existingCarouselImages);
            formData.append("existingImages", JSON.stringify(existingCarouselImages));

            // Ajouter les nouvelles images
            if (selectedCarouselFiles.length > 0) {
                console.log("📊 Nouvelles images à uploader:", selectedCarouselFiles.length);
                selectedCarouselFiles.forEach((file, index) => {
                    formData.append("carouselImages", file);
                    const preview = carouselPreviews[index];
                    if (preview && preview.title) {
                        formData.append(`imageTitle_${index}`, preview.title);
                    }
                });
            }

            console.log("📤 Envoi de la requête de sauvegarde...");
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:3002"
                }/api/home-content`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log("✅ Réponse de sauvegarde:", result);
                toast.success("Contenu sauvegardé avec succès !");
                console.log("✅ Sauvegarde terminée avec succès");
                onClose();
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
        setHomeContent({
            title: originalHomeContent.title,
            description: originalHomeContent.description,
            carouselImages: originalHomeContent.carouselImages,
            openingHours: originalHomeContent.openingHours,
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
        onClose();
    };

    if (homeContentLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        <span className="text-lg font-medium text-gray-700">
                            Chargement du contenu...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* En-tête de la modale */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <Home className="w-6 h-6 text-[var(--primary-color)]" />
                            <span>Gestion de la Page d'Accueil</span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Gérez le contenu principal de votre page d'accueil : titre, description, images du carrousel et sections d'information.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Contenu de la modale */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Section Contenu Principal */}
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
                                        value={homeContent.title || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
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
                                        value={homeContent.description || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Carrousel d'Images */}
                        <div>
                            <h4 className="mb-4 text-lg font-medium text-gray-900">
                                Carrousel d'Images
                            </h4>

                            {/* Nouvelles images */}
                            <div className="mb-4">
                                <h5 className="mb-3 text-md font-medium text-gray-700">
                                    Ajouter de nouvelles images
                                </h5>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleCarouselImagesChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Formats acceptés : JPG, PNG, GIF. Taille maximale : 5MB par image.
                                </p>
                            </div>

                            {/* Aperçu des nouvelles images */}
                            {carouselPreviews.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="flex items-center mb-3 text-md font-medium text-gray-700">
                                        <span className="mr-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                        Nouvelles images ({carouselPreviews.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-3">
                                        {carouselPreviews.map((preview, index) => (
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
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                {/* Image */}
                                                <div className="relative">
                                                    <img
                                                        src={preview.url}
                                                        alt={`Nouveau ${index + 1}`}
                                                        className="object-cover w-20 h-20 rounded-lg border-2 border-green-200"
                                                    />
                                                </div>

                                                {/* Contrôles de position */}
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => moveCarouselImage(index, "up")}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                        title="Monter"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveCarouselImage(index, "down")}
                                                        disabled={index === carouselPreviews.length - 1}
                                                        className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                        title="Descendre"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Bouton supprimer */}
                                                <div>
                                                    <button
                                                        onClick={() => removeCarouselImage(index)}
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
                                                        value={preview.title || ""}
                                                        onChange={(e) => handleNewImageTitleChange(index, e.target.value)}
                                                        className="px-2 py-1 w-full text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Titre de l'image"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Images existantes */}
                            {existingCarouselImages.length > 0 && (
                                <div className="mb-6">
                                    <h5 className="flex items-center mb-3 text-md font-medium text-gray-700">
                                        <span className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Images actuelles ({existingCarouselImages.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-3">
                                        {existingCarouselImages.map((image, index) => (
                                            <div
                                                key={`existing-${image.id || index}`}
                                                className="flex flex-col gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-[120px]"
                                            >
                                                {/* Position */}
                                                <div className="flex flex-col items-center">
                                                    <span className="mb-1 text-xs font-medium text-gray-500">
                                                        Position
                                                    </span>
                                                    <span className="bg-blue-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[28px] text-center">
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                {/* Image */}
                                                <div className="relative">
                                                    <img
                                                        src={`${
                                                            import.meta.env.VITE_API_URL ||
                                                            "http://localhost:3002"
                                                        }/${image.image_url}`}
                                                        alt={`Carrousel ${index + 1}`}
                                                        className="object-cover w-20 h-20 rounded-lg border-2 border-blue-200"
                                                        onError={(e) => {
                                                            e.target.src = "https://via.placeholder.com/150x80?text=Image+non+trouvée";
                                                        }}
                                                    />
                                                </div>

                                                {/* Contrôles de position */}
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => moveCarouselImage(index, "up", true)}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                        title="Monter"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveCarouselImage(index, "down", true)}
                                                        disabled={index === existingCarouselImages.length - 1}
                                                        className="p-1 text-gray-700 bg-gray-200 rounded transition-colors hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                        title="Descendre"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Bouton supprimer */}
                                                <div>
                                                    <button
                                                        onClick={() => removeCarouselImage(index, true)}
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
                                                        value={image.title || `Image ${index + 1}`}
                                                        onChange={(e) => handleExistingImageTitleChange(index, e.target.value)}
                                                        className="px-2 py-1 w-full text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Titre de l'image"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sections d'Information */}
                        <div>
                            <h4 className="mb-4 text-lg font-medium text-gray-900">
                                Sections d'Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h5 className="mb-2 font-medium text-gray-900">
                                        Notre Localisation
                                    </h5>
                                    <textarea
                                        rows={3}
                                        placeholder="Adresse du club\nVille, Code postal\nInformations d'accès"
                                        value={homeContent.location || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                location: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h5 className="mb-2 font-medium text-gray-900">
                                        Horaires d'Ouverture
                                    </h5>
                                    <textarea
                                        rows={3}
                                        placeholder="Lundi - Vendredi: 14h - 18h\nSamedi - Dimanche: 9h - 19h"
                                        value={homeContent.openingHours || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                openingHours: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h5 className="mb-2 font-medium text-gray-900">
                                        Nos Membres
                                    </h5>
                                    <textarea
                                        rows={3}
                                        placeholder="Informations sur les membres\nNombre de licenciés\nActivités des membres"
                                        value={homeContent.members || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                members: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section séparée pour la description du club */}
                        <div>
                            <div className="p-4 border border-gray-200 rounded-lg">
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
                                        value={homeContent.clubTitle || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                clubTitle: e.target.value,
                                            }))
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
                                        value={homeContent.clubDescription || ""}
                                        onChange={(e) =>
                                            setHomeContent((prev) => ({
                                                ...prev,
                                                clubDescription: e.target.value,
                                            }))
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
                                            value={homeContent.teamsContent || ""}
                                            onChange={(e) =>
                                                setHomeContent((prev) => ({
                                                    ...prev,
                                                    teamsContent: e.target.value,
                                                }))
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
                                            value={homeContent.animationsContent || ""}
                                            onChange={(e) =>
                                                setHomeContent((prev) => ({
                                                    ...prev,
                                                    animationsContent: e.target.value,
                                                }))
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
                                            value={homeContent.tournamentsContent || ""}
                                            onChange={(e) =>
                                                setHomeContent((prev) => ({
                                                    ...prev,
                                                    tournamentsContent: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end p-6 space-x-4 border-t border-gray-200 flex-shrink-0 bg-white">
                    <button
                        onClick={handleCancelHomeContent}
                        className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSaveHomeContent}
                        disabled={homeContentLoading}
                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {homeContentLoading && (
                            <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                        )}
                        <span>Sauvegarder</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeContentManagement;