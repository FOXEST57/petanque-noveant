import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Animations = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'past'

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === 'upcoming') {
      return eventDate >= today
    } else if (filter === 'past') {
      return eventDate < today
    }
    return true
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des animations...</p>
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
              Animations & Événements
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Découvrez tous les événements, tournois et animations organisés par notre club
            </p>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous les événements
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                filter === 'past'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Passés
            </button>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-gray-600">
                {filter === 'upcoming' 
                  ? 'Aucun événement à venir pour le moment.'
                  : filter === 'past'
                  ? 'Aucun événement passé trouvé.'
                  : 'Aucun événement disponible.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.event_date)
                const today = new Date()
                const isUpcoming = eventDate >= today
                
                return (
                  <div key={event.id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                    isUpcoming ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'
                  }`}>
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 mr-3">
                              {event.title}
                            </h3>
                            {isUpcoming && (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                À venir
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-lg">
                            {event.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-green-600" />
                              <span>{formatDate(event.event_date)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-green-600" />
                              <span>{formatTime(event.event_date)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-green-600" />
                              <span>{event.location || 'Terrain du club'}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-green-600" />
                              <span>
                                {event.max_participants 
                                  ? `Max ${event.max_participants} participants`
                                  : 'Ouvert à tous'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isUpcoming && (
                          <div className="mt-4 lg:mt-0 lg:ml-6">
                            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">
                              S'inscrire
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Participez à nos événements !
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Rejoignez-nous pour des moments conviviaux et sportifs. Tous les niveaux sont les bienvenus !
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

export default Animations