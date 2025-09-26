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
      const filtered = members.filter(member => {
        const searchText = query.toLowerCase();
        return (
          member.prenom?.toLowerCase().includes(searchText) ||
          member.nom?.toLowerCase().includes(searchText) ||
          member.pseudo?.toLowerCase().includes(searchText) ||
          member.email?.toLowerCase().includes(searchText)
        );
      });
      setFilteredMembers(filtered);
      setIsOpen(true);
    } else {
      setFilteredMembers([]);
      setIsOpen(false);
    }
  }, [query, members]);

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

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/members/search', {
        method: 'GET'
      });
      
      setMembers(data.members || []);
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
    setQuery(`${member.prenom} ${member.nom}${member.pseudo ? ` (${member.pseudo})` : ''}`);
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown avec les résultats */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              Chargement...
            </div>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {member.prenom} {member.nom}
                      </span>
                      {member.pseudo && (
                        <span className="text-sm text-gray-500">
                          ({member.pseudo})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                    {member.solde !== undefined && (
                      <div className="text-sm text-green-600">
                        Solde: {member.solde}€
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              Aucun membre trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberAutocomplete;