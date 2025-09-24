import React, { useState } from 'react';
import { Wine, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { useDrinks } from '../contexts/DrinksContext';
import { toast } from 'sonner';
import { apiCall } from '../lib/api';

const BarManagement = ({ onClose }) => {
    const { drinks, addDrink, updateDrink, deleteDrink } = useDrinks();
    
    // États pour la gestion du bar
    const [showBarModal, setShowBarModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' ou 'edit'
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [drinkToDelete, setDrinkToDelete] = useState(null);
    
    // États pour le formulaire
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: 50
    });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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
            price: (parseFloat(drink.price) || 0).toString(),
            description: drink.description,
            image: drink.image_url,
            stock: drink.stock
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
            toast.success('Boisson supprimée avec succès');
        } catch (error) {
            toast.error('Erreur lors de la suppression de la boisson');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La taille de l\'image ne doit pas dépasser 5MB');
                return;
            }
            
            setSelectedImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveDrink = async () => {
        if (!formData.name || !formData.price) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            if (modalMode === 'add') {
                let imageUrl = '';
                
                if (selectedImageFile) {
                    const formDataImage = new FormData();
                    formDataImage.append('image', selectedImageFile);
                    
                    const uploadResult = await apiCall('/api/upload-image', {
                        method: 'POST',
                        body: formDataImage
                    });
                    
                    imageUrl = uploadResult.imageUrl;
                }
                
                await addDrink({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description || '',
                    image_url: imageUrl,
                    stock: parseInt(formData.stock) || 50
                });
                toast.success('Boisson ajoutée avec succès');
            } else {
                let imageUrl = formData.image;
                
                if (selectedImageFile) {
                    const formDataImage = new FormData();
                    formDataImage.append('image', selectedImageFile);
                    
                    const uploadResult = await apiCall('/api/upload-image', {
                        method: 'POST',
                        body: formDataImage
                    });
                    
                    imageUrl = uploadResult.imageUrl;
                }
                
                if (imageUrl !== formData.image) {
                    await apiCall(`/api/drinks/${selectedDrink.id}/image`, {
                        method: 'PUT',
                        body: JSON.stringify({ image_url: imageUrl })
                    });
                }
                
                await updateDrink(selectedDrink.id, {
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description || '',
                    stock: parseInt(formData.stock) || 50
                });
                toast.success('Boisson modifiée avec succès');
            }

            setShowBarModal(false);
            setSelectedImageFile(null);
            setImagePreview(null);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la boisson:', error);
            toast.error('Erreur lors de la sauvegarde de la boisson');
        }
    };

    // Filtrage des boissons
    const filteredDrinks = drinks.filter(drink => {
        const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <>
            <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border">
                            <Wine className="w-6 h-6 text-[var(--primary-color)]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestion du Bar</h2>
                            <p className="text-gray-600">Gérez les boissons et le stock</p>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une boisson..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleAddDrink}
                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une boisson</span>
                    </button>
                </div>

                {/* Tableau des boissons */}
                <div className="bg-white rounded-lg shadow overflow-hidden max-h-[60vh]">
                    <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Boisson
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDrinks.map((drink) => (
                                        <tr key={drink.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={drink.image_url || '/api/placeholder/40/40'}
                                                            alt={drink.name}
                                                            onError={(e) => {
                                                                e.target.src = '/api/placeholder/40/40';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {drink.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {parseFloat(drink.price || 0).toFixed(2)} €
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    drink.stock > 10 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : drink.stock > 0 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {drink.stock} unités
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {drink.description || 'Aucune description'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditDrink(drink)}
                                                        className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDrink(drink)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
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
                            {filteredDrinks.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Aucune boisson trouvée
                                </div>
                            )}
                        </div>
                    </div>

                {/* Modal Ajouter/Modifier boisson */}
                {showBarModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border shadow-lg m-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {modalMode === 'add' ? 'Ajouter une boisson' : 'Modifier la boisson'}
                                </h3>
                                <button
                                    onClick={() => setShowBarModal(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="Nom de la boisson"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix (€) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                                        rows="3"
                                        placeholder="Description de la boisson"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image de la boisson
                                    </label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
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
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setSelectedImageFile(null);
                                                        setFormData({ ...formData, image: '' });
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowBarModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveDrink}
                                    className="px-4 py-2 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)] rounded-lg transition-colors flex items-center space-x-2"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-full max-w-lg border shadow-lg m-4">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Confirmer la suppression
                                    </h3>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Êtes-vous sûr de vouloir supprimer la boisson "{drinkToDelete?.name}" ? Cette action est irréversible.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
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
        </>
    );
};

export default BarManagement;