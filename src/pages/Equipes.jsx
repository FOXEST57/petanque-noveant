import { useState, useEffect } from 'react'
import { Users, Trophy, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Equipes = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(
            id,
            users(first_name, last_name)
          )
        `)
        .order('name')

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des équipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos Équipes
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Découvrez les équipes de notre club et leurs performances dans les différents championnats
            </p>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune équipe trouvée
              </h3>
              <p className="text-gray-600">
                Les équipes seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {team.description || 'Équipe de compétition du club'}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {team.team_members?.length || 0} membre{team.team_members?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="w-4 h-4 mr-2" />
                        <span>Championnat régional</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    
                    {team.team_members && team.team_members.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Membres de l'équipe :
                        </h4>
                        <div className="space-y-1">
                          {team.team_members.slice(0, 3).map((member) => (
                            <div key={member.id} className="text-sm text-gray-600">
                              {member.users?.first_name} {member.users?.last_name}
                            </div>
                          ))}
                          {team.team_members.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{team.team_members.length - 3} autre{team.team_members.length - 3 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Rejoignez une équipe !
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Que vous soyez débutant ou joueur confirmé, nos équipes vous accueillent pour partager la passion de la pétanque.
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 inline-block"
            >
              Nous contacter
            </a>
            <a
              href="/login"
              className="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Equipes