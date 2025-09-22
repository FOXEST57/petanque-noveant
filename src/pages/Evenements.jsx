import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { eventsAPI } from '../lib/api'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'

const Evenements = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const { user, userProfile } = useAuth()
  
  // Récupérer l'ID de l'événement depuis l'URL
  const urlParams = new URLSearchParams(location.search)
  const eventId = urlParams.get('id')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    // Scroll vers l'événement spécifique si un ID est fourni
    if (eventId && events.length > 0) {
      const eventElement = document.getElementById(`event-${eventId}`)
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Ajouter une classe de surbrillance temporaire
        eventElement.classList.add('highlight-event')
        setTimeout(() => {
          eventElement.classList.remove('highlight-event')
        }, 3000)
      }
    }
  }, [eventId, events])

  const fetchEvents = async () => {
    try {
      const data = await eventsAPI.getAll()
      setEvents(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.slice(0, 5) // Format HH:MM
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Événements du Club</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez tous nos événements, tournois et animations organisés par le club de pétanque de Noveant-sur-Moselle.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun événement programmé</h3>
            <p className="text-gray-600">Revenez bientôt pour découvrir nos prochains événements !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-12">
            {events.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-green-600" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        
                        {event.time && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-5 w-5 mr-3 text-green-600" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-5 w-5 mr-3 text-green-600" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.max_participants && (
                          <div className="flex items-center text-gray-600">
                            <Users className="h-5 w-5 mr-3 text-green-600" />
                            <span>Max {event.max_participants} participants</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed">{event.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {event.image_url && (
                      <div className="lg:w-80 lg:flex-shrink-0">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-48 lg:h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Evenements