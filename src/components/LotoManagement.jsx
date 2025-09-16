import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const LotoManagement = ({ onClose }) => {
  // États pour la gestion des lotos
  const [showLotoModal, setShowLotoModal] = useState(false);
  const [lotoModalMode, setLotoModalMode] = useState('add');
  const [selectedLoto, setSelectedLoto] = useState(null);
  const [lotos, setLotos] = useState([
    {
      id: 1,
      nom: "Loto de Noël",
      date: "2024-12-15",
      description: "Grand loto de fin d'année avec de nombreux lots",
      prixCarton: 5,
      lotsAGagner: "Jambon, Bouteilles de vin, Bons d'achat",
      statut: "actif"
    },
    {
      id: 2,
      nom: "Loto du Printemps",
      date: "2024-03-20",
      description: "Loto traditionnel du club",
      prixCarton: 3,
      lotsAGagner: "Électroménager, Produits du terroir",
      statut: "termine"
    }
  ]);
  const [lotoToDelete, setLotoToDelete] = useState(null);
  const [showLotoDeleteConfirm, setShowLotoDeleteConfirm] = useState(false);
  const [lotoSearchTerm, setLotoSearchTerm] = useState('');
  const [lotoFormData, setLotoFormData] = useState({
    nom: '',
    date: '',
    description: '',
    prixCarton: '',
    lotsAGagner: '',
    statut: 'en_attente'
  });

  // Variable calculée pour le filtrage
  const filteredLotos = lotos.filter(loto =>
    loto.nom.toLowerCase().includes(lotoSearchTerm.toLowerCase()) ||
    loto.lotsAGagner.toLowerCase().includes(lotoSearchTerm.toLowerCase())
  );

  // Fonctions de gestion
  const handleAddLoto = () => {
    setLotoModalMode('add');
    setSelectedLoto(null);
    setLotoFormData({
      nom: '',
      date: '',
      description: '',
      prixCarton: '',
      lotsAGagner: '',
      statut: 'en_attente'
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
        l.id === selectedLoto.id 
          ? { ...lotoData, id: selectedLoto.id }
          : l
      ));
      toast.success('Loto modifié avec succès');
    }

    setShowLotoModal(false);
  };

  return (
    <div className="flex fixed inset-0 z-[50] justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Gestion des Lotos
            </h3>
            <button
              onClick={onClose}
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
              onClick={handleAddLoto}
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
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">
                    Date
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">
                    Prix du carton
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">
                    Lots à gagner
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-900 border border-gray-200">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-center text-gray-900 border border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLotos.length > 0 ? (
                  filteredLotos.map((loto) => (
                    <tr key={loto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                        {loto.nom}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">
                        {new Date(loto.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">
                        {loto.prixCarton}€
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">
                        {loto.lotsAGagner}
                      </td>
                      <td className="px-4 py-3 border border-gray-200">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          loto.statut === 'actif'
                            ? 'bg-green-100 text-green-800'
                            : loto.statut === 'termine'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {loto.statut === 'actif'
                            ? 'Actif'
                            : loto.statut === 'termine'
                            ? 'Terminé'
                            : 'En attente'}
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
                Êtes-vous sûr de vouloir supprimer le loto "{lotoToDelete?.nom}" ? Cette action est irréversible.
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
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      nom: e.target.value
                    })}
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
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      date: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#425e9b] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    value={lotoFormData.statut}
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      statut: e.target.value
                    })}
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
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      prixCarton: e.target.value
                    })}
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
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      lotsAGagner: e.target.value
                    })}
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
                    onChange={(e) => setLotoFormData({
                      ...lotoFormData,
                      description: e.target.value
                    })}
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
    </div>
  );
};

export default LotoManagement;