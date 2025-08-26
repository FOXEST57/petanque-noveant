import { useState, useEffect } from 'react'
import { User, Calendar, Users, Trophy, Settings, LogOut, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase'

const Dashboard = () => {
  const { user, signOut, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [userEvents, setUserEvents] = useState([])
  const [userTeams, setUserTeams] = useState([])
  const [userMatches, setUserMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
      setProfileData({
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
        phone: user.user_metadata?.phone || ''
      })
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // Charger les événements de l'utilisateur
      const { data: events } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events(*)
        `)
        .eq('user_id', user.id)

      // Charger les équipes de l'utilisateur
      const { data: teams } = await supabase
        .from('team_members')
        .select(`
          *,
          teams(*)
        `)
        .eq('user_id', user.id)

      // Charger les matchs de l'utilisateur
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`team1_id.in.(${teams?.map(t => t.team_id).join(',')}),team2_id.in.(${teams?.map(t => t.team_id).join(',')})`)
        .order('match_date', { ascending: false })
        .limit(10)

      setUserEvents(events || [])
      setUserTeams(teams || [])
      setUserMatches(matches || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      await updateProfile(profileData)
      setEditingProfile(false)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user?.user_metadata?.firstName || user?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Mon Profil</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'events'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Mes Événements</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('teams')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'teams'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span>Mes Équipes</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'matches'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Mes Matchs</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Mon Profil
                    </h2>
                    {!editingProfile && (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        ) : (
                          <p className="text-gray-900">{user?.user_metadata?.firstName || 'Non renseigné'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        ) : (
                          <p className="text-gray-900">{user?.user_metadata?.lastName || 'Non renseigné'}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      {editingProfile ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.user_metadata?.phone || 'Non renseigné'}</p>
                      )}
                    </div>

                    {editingProfile && (
                      <div className="flex space-x-4">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={saving}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(false)
                            setProfileData({
                              firstName: user?.user_metadata?.firstName || '',
                              lastName: user?.user_metadata?.lastName || '',
                              phone: user?.user_metadata?.phone || ''
                            })
                          }}
                          className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Mes Événements
                  </h2>
                  
                  {userEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun événement inscrit</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userEvents.map((registration) => (
                        <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900">
                            {registration.events.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {registration.events.description}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500">
                              {formatDateTime(registration.events.event_date)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              registration.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {registration.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Teams Tab */}
              {activeTab === 'teams' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Mes Équipes
                  </h2>
                  
                  {userTeams.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune équipe rejointe</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userTeams.map((membership) => (
                        <div key={membership.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900">
                            {membership.teams.name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {membership.teams.description}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500">
                              Membre depuis {formatDate(membership.joined_at)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              membership.role === 'captain' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {membership.role === 'captain' ? 'Capitaine' : 'Membre'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Matches Tab */}
              {activeTab === 'matches' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Mes Matchs Récents
                  </h2>
                  
                  {userMatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun match enregistré</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userMatches.map((match) => (
                        <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Match du {formatDate(match.match_date)}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                Score: {match.team1_score} - {match.team2_score}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              match.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : match.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status === 'completed' ? 'Terminé' : 
                               match.status === 'in_progress' ? 'En cours' : 'Programmé'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard