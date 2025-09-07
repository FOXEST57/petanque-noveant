import React, { useState, useEffect } from 'react';
import { 
  getMembers, 
  createMember, 
  updateMember, 
  deleteMember,
  getMemberTypes,
  createMemberType,
  updateMemberType,
  deleteMemberType,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getConcours,
  createConcours,
  updateConcours,
  deleteConcours,
  getLotos,
  createLoto,
  updateLoto,
  deleteLoto,
  getDrinks,
  createDrink,
  updateDrink,
  deleteDrink,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam
} from '../lib/database.js';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('membres');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [membres, setMembres] = useState([]);
  const [memberTypes, setMemberTypes] = useState([]);
  const [events, setEvents] = useState([]);
  const [concours, setConcours] = useState([]);
  const [lotos, setLotos] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // États pour les formulaires
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Charger les données selon l'onglet actif
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'membres':
          const membersData = await getMembers();
          setMembres(membersData);
          const typesData = await getMemberTypes();
          setMemberTypes(typesData);
          break;
        case 'types':
          const types = await getMemberTypes();
          setMemberTypes(types);
          break;
        case 'evenements':
          const eventsData = await getEvents();
          setEvents(eventsData);
          break;
        case 'concours':
          const concoursData = await getConcours();
          setConcours(concoursData);
          break;
        case 'lotos':
          const lotosData = await getLotos();
          setLotos(lotosData);
          break;
        case 'boissons':
          const drinksData = await getDrinks();
          setDrinks(drinksData);
          break;
        case 'equipes':
          const teamsData = await getTeams();
          setTeams(teamsData);
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'membres':
          await createMember(data);
          break;
        case 'types':
          await createMemberType(data);
          break;
        case 'evenements':
          await createEvent(data);
          break;
        case 'concours':
          await createConcours(data);
          break;
        case 'lotos':
          await createLoto(data);
          break;
        case 'boissons':
          await createDrink(data);
          break;
        case 'equipes':
          await createTeam(data);
          break;
      }
      setShowForm(false);
      setFormData({});
      await loadData();
    } catch (err) {
      setError('Erreur lors de la création: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'membres':
          await updateMember(id, data);
          break;
        case 'types':
          await updateMemberType(id, data);
          break;
        case 'evenements':
          await updateEvent(id, data);
          break;
        case 'concours':
          await updateConcours(id, data);
          break;
        case 'lotos':
          await updateLoto(id, data);
          break;
        case 'boissons':
          await updateDrink(id, data);
          break;
        case 'equipes':
          await updateTeam(id, data);
          break;
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      await loadData();
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'membres':
          await deleteMember(id);
          break;
        case 'types':
          await deleteMemberType(id);
          break;
        case 'evenements':
          await deleteEvent(id);
          break;
        case 'concours':
          await deleteConcours(id);
          break;
        case 'lotos':
          await deleteLoto(id);
          break;
        case 'boissons':
          await deleteDrink(id);
          break;
        case 'equipes':
          await deleteTeam(id);
          break;
      }
      await loadData();
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      handleUpdate(editingItem.id, formData);
    } else {
      handleCreate(formData);
    }
  };

  const renderMembersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {membres.map((membre) => (
            <tr key={membre.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{membre.nom}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membre.prenom}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membre.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membre.telephone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{membre.type_nom}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit(membre)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(membre.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMemberForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            value={formData.nom || ''}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            value={formData.prenom || ''}
            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input
          type="tel"
          value={formData.telephone || ''}
          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse</label>
        <textarea
          value={formData.adresse || ''}
          onChange={(e) => setFormData({...formData, adresse: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro de licence</label>
          <input
            type="text"
            value={formData.numero_licence || ''}
            onChange={(e) => setFormData({...formData, numero_licence: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type de membre</label>
          <select
            value={formData.type_membre_id || ''}
            onChange={(e) => setFormData({...formData, type_membre_id: parseInt(e.target.value)})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Sélectionner un type</option>
            {memberTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.nom}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date d'entrée</label>
          <input
            type="date"
            value={formData.date_entree || ''}
            onChange={(e) => setFormData({...formData, date_entree: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
          <input
            type="date"
            value={formData.date_naissance || ''}
            onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormData({});
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (editingItem ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );

  const renderTeamForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom de l'équipe</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            value={formData.category || ''}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Seniors">Seniors</option>
            <option value="Vétérans">Vétérans</option>
            <option value="Juniors">Juniors</option>
            <option value="Mixte">Mixte</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Compétition</label>
        <input
          type="text"
          value={formData.competition || ''}
          onChange={(e) => setFormData({...formData, competition: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Ex: Championnat Départemental, Coupe Vétérans..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
          placeholder="Description de l'équipe..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">URL de la photo</label>
        <input
          type="url"
          value={formData.photo_url || ''}
          onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="https://exemple.com/photo.jpg"
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormData({});
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (editingItem ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );

  const renderGenericTable = (data, columns, actions = true) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const getTableConfig = () => {
    switch (activeTab) {
      case 'membres':
        return { data: membres, render: renderMembersTable };
      case 'types':
        return {
          data: memberTypes,
          columns: [
            { key: 'nom', label: 'Nom' },
            { key: 'description', label: 'Description' }
          ]
        };
      case 'evenements':
        return {
          data: events,
          columns: [
            { key: 'title', label: 'Titre' },
            { key: 'description', label: 'Description' },
            { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleDateString() }
          ]
        };
      case 'concours':
        return {
          data: concours,
          columns: [
            { key: 'nom', label: 'Nom' },
            { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
            { key: 'prix_inscription', label: 'Prix inscription', render: (prix) => `${prix}€` },
            { key: 'statut', label: 'Statut' }
          ]
        };
      case 'lotos':
        return {
          data: lotos,
          columns: [
            { key: 'nom', label: 'Nom' },
            { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleDateString() },
            { key: 'prix_carton', label: 'Prix carton', render: (prix) => `${prix}€` },
            { key: 'statut', label: 'Statut' }
          ]
        };
      case 'boissons':
        return {
          data: drinks,
          columns: [
            { key: 'name', label: 'Nom' },
            { key: 'price', label: 'Prix', render: (prix) => `${prix}€` },
            { key: 'stock', label: 'Stock' },
            { key: 'description', label: 'Description' }
          ]
        };
      case 'equipes':
        return {
          data: teams,
          columns: [
            { key: 'name', label: 'Nom' },
            { key: 'category', label: 'Catégorie' },
            { key: 'competition', label: 'Compétition' },
            { key: 'member_count', label: 'Membres', render: (count) => `${count || 0} membre(s)` },
            { key: 'description', label: 'Description' }
          ]
        };
      default:
        return { data: [], columns: [] };
    }
  };

  const tabs = [
    { id: 'membres', label: 'Membres' },
    { id: 'types', label: 'Types de membres' },
    { id: 'evenements', label: 'Événements' },
    { id: 'concours', label: 'Concours' },
    { id: 'lotos', label: 'Lotos' },
    { id: 'boissons', label: 'Boissons' },
    { id: 'equipes', label: 'Équipes' }
  ];

  const tableConfig = getTableConfig();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Administration</h1>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Onglets */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Bouton d'ajout */}
          <div className="mb-6">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingItem(null);
                setFormData({});
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Ajouter {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
            </button>
          </div>
          
          {/* Formulaire */}
          {showForm && (
            <div className="mb-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Modifier' : 'Ajouter'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </h2>
              {activeTab === 'membres' ? renderMemberForm() : 
               activeTab === 'equipes' ? renderTeamForm() : (
                <div className="text-gray-500">Formulaire générique à implémenter pour {activeTab}</div>
              )}
            </div>
          )}
          
          {/* Tableau */}
          <div className="bg-white shadow rounded-lg">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : tableConfig.render ? (
              tableConfig.render()
            ) : (
              renderGenericTable(tableConfig.data, tableConfig.columns)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;