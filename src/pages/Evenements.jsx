import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { eventsAPI } from '../api/events.js'
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
      const response = await eventsAPI.getAll()
      const eventsData = response?.data || []
      
      // Charger les photos pour chaque événement
      const eventsWithPhotos = await Promise.all(
        eventsData.map(async (event) => {
          try {
            const photos = await eventsAPI.getPhotos(event.id)
            return {
              ...event,
              photos: photos || []
            }
          } catch (photoError) {
            console.error(`Erreur lors du chargement des photos pour l'événement ${event.id}:`, photoError)
            return {
              ...event,
              photos: []
            }
          }
        })
      )
      
      setEvents(eventsWithPhotos)
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
      <div className="py-12 min-h-screen bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-green-600 animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 min-h-screen bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Événements du Club</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Découvrez tous nos événements, tournois et animations organisés par le club de pétanque de Noveant-sur-Moselle.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Aucun événement programmé</h3>
            <p className="text-gray-600">Revenez bientôt pour découvrir nos prochains événements !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-12">
            {events.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className="overflow-hidden bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h3 className="mb-4 text-2xl font-bold text-gray-900">{event.title}</h3>
                      
                      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="mr-3 w-5 h-5 text-green-600" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        
                        {event.time && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="mr-3 w-5 h-5 text-green-600" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="mr-3 w-5 h-5 text-green-600" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.max_participants && (
                          <div className="flex items-center text-gray-600">
                            <Users className="mr-3 w-5 h-5 text-green-600" />
                            <span>Max {event.max_participants} participants</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <div className="max-w-none prose prose-gray">
                          <p className="leading-relaxed text-gray-700">{event.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {event.photos && event.photos.length > 0 && (
                      <div className="lg:w-80 lg:flex-shrink-0">
                        <img
                          src={event.photos[0].url}
                          alt={event.title}
                          className="object-cover w-full h-48 rounded-lg lg:h-64"
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