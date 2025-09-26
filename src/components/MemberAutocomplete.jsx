import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { apiCall } from '../utils/apiCall';

const MemberAutocomplete = ({ onSelect, selectedMember, placeholder = "Rechercher un membre..." }) => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Charger tous les membres au montage du composant
  useEffect(() => {
    loadMembers();
  }, []);

  // Filtrer les membres selon la requête
  useEffect(() => {
    if (query.length >= 2) {
      // Utiliser la recherche côté serveur
      loadMembers(query);
      setIsOpen(true);
    } else if (query.length === 0) {
      // Charger tous les membres si la recherche est vide
      loadMembers();
      setIsOpen(false);
    } else {
      // Moins de 2 caractères, vider les résultats
      setFilteredMembers([]);
      setIsOpen(false);
    }
  }, [query]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMembers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const url = searchQuery.length >= 2 
        ? `/api/members/search?q=${encodeURIComponent(searchQuery)}`
        : '/api/members/search';
      
      const data = await apiCall(url, {
        method: 'GET'
      });
      
      setMembers(data.members || []);
      setFilteredMembers(data.members || []);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleMemberSelect = (member) => {
    setQuery(`${member.prenom} ${member.nom}${member.surnom ? ` (${member.surnom})` : ''}`);
    setIsOpen(false);
    onSelect(member);
  };

  const clearSelection = () => {
    setQuery('');
    setIsOpen(false);
    onSelect(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        {selectedMember && (
          <button
            onClick={clearSelection}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Dropdown avec les résultats */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {loading ? (
            <div className="px-6 py-6 text-center text-gray-500 text-xl">
              Chargement...
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-xl">
                        {member.prenom} {member.nom}
                      </span>
                      {member.surnom && (
                        <span className="text-lg text-gray-500">
                          ({member.surnom})
                        </span>
                      )}
                    </div>
                    <div className="text-lg text-gray-500">
                      {member.email}
                    </div>
                    {member.solde !== undefined && (
                      <div className="text-lg text-green-600 font-medium">
                        Solde: {parseFloat(member.solde || 0).toFixed(2)}€
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-6 py-6 text-center text-gray-500 text-xl">
              Aucun membre trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberAutocomplete;