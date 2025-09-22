import React, { useState, useEffect } from 'react';
import { X, Building2, Search, Hash, Type } from 'lucide-react';

const ClubSelectionModal = ({ isOpen, onClose, onSelectClub, userEmail }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectionMode, setSelectionMode] = useState('list'); // 'list', 'id', 'name', 'number'
  const [searchValue, setSearchValue] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');

  // Charger la liste des clubs
  useEffect(() => {
    if (isOpen) {
      loadClubs();
    }
  }, [isOpen]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3002/api';
      const response = await fetch(`${API_BASE_URL}/clubs`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs || []);
      } else {
        throw new Error('Erreur lors du chargement des clubs');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des clubs:', err);
      setError('Impossible de charger la liste des clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClub = async () => {
    try {
      setError('');
      let clubToSelect = null;

      if (selectionMode === 'list') {
        clubToSelect = clubs.find(club => club.id === parseInt(selectedClubId));
      } else {
        // Recherche par ID, nom ou numéro
        const searchTerm = searchValue.trim().toLowerCase();
        if (!searchTerm) {
          setError('Veuillez saisir une valeur de recherche');
          return;
        }

        if (selectionMode === 'id') {
          clubToSelect = clubs.find(club => club.id === parseInt(searchTerm));
        } else if (selectionMode === 'name') {
          clubToSelect = clubs.find(club => 
            club.nom.toLowerCase().includes(searchTerm) || 
            club.ville.toLowerCase().includes(searchTerm)
          );
        } else if (selectionMode === 'number') {
          clubToSelect = clubs.find(club => 
            club.numero_ffpjp && club.numero_ffpjp.toLowerCase().includes(searchTerm)
          );
        }
      }

      if (!clubToSelect) {
        setError('Club non trouvé. Vérifiez votre saisie.');
        return;
      }

      // Appeler la fonction de sélection avec l'ID du club
      onSelectClub(clubToSelect.id);
      
    } catch (err) {
      console.error('Erreur lors de la sélection du club:', err);
      setError('Erreur lors de la sélection du club');
    }
  };

  const resetForm = () => {
    setSelectionMode('list');
    setSearchValue('');
    setSelectedClubId('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Sélection du club
            </h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Bonjour <span className="font-medium">{userEmail}</span>,<br />
              Veuillez choisir le club sur lequel vous souhaitez vous connecter :
            </p>
          </div>

          {/* Mode de sélection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de sélection
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectionMode('list')}
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectionMode === 'list'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building2 className="h-4 w-4 mr-1" />
                Liste
              </button>
              <button
                onClick={() => setSelectionMode('id')}
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectionMode === 'id'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Hash className="h-4 w-4 mr-1" />
                ID
              </button>
              <button
                onClick={() => setSelectionMode('name')}
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectionMode === 'name'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Type className="h-4 w-4 mr-1" />
                Nom
              </button>
              <button
                onClick={() => setSelectionMode('number')}
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectionMode === 'number'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search className="h-4 w-4 mr-1" />
                N° FFPJP
              </button>
            </div>
          </div>

          {/* Sélection par liste */}
          {selectionMode === 'list' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choisir un club
              </label>
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement des clubs...</p>
                </div>
              ) : (
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Sélectionnez un club --</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.nom} - {club.ville} (ID: {club.id})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Sélection par saisie */}
          {selectionMode !== 'list' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectionMode === 'id' && 'Saisir l\'ID du club'}
                {selectionMode === 'name' && 'Saisir le nom du club ou de la ville'}
                {selectionMode === 'number' && 'Saisir le numéro FFPJP'}
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  selectionMode === 'id' ? 'Ex: 1' :
                  selectionMode === 'name' ? 'Ex: Noveant ou Noveant-sur-Moselle' :
                  'Ex: FFPJP001'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSelectClub}
              disabled={loading || (selectionMode === 'list' && !selectedClubId) || (selectionMode !== 'list' && !searchValue.trim())}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSelectionModal;