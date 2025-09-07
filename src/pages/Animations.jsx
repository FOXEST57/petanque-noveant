import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, AlertCircle, Image, X } from 'lucide-react'
import { eventsAPI } from '../lib/api'

const Animations = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'past'
  const [eventPhotos, setEventPhotos] = useState({}) // Store photos for each event
  const [selectedPhoto, setSelectedPhoto] = useState(null) // For modal display

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEventPhotos = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5556/api/events/${eventId}/photos`)
      if (response.ok) {
        const photos = await response.json()
        return photos
      }
      return []
    } catch (error) {
      console.error(`Erreur lors du chargement des photos pour l'événement ${eventId}:`, error)
      return []
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const eventsData = await eventsAPI.getAll()
      
      if (!eventsData || !Array.isArray(eventsData)) {
        setError('Format de données invalide')
        return
      }
      
      // Trier par date décroissante (le plus récent en haut)
      const sortedEvents = eventsData.sort((a, b) => new Date(b.date) - new Date(a.date))
      setEvents(sortedEvents)
      
      // Charger les photos pour chaque événement
      const photosData = {}
      for (const event of sortedEvents) {
        const photos = await fetchEventPhotos(event.id)
        if (photos.length > 0) {
          photosData[event.id] = photos
        }
      }
      setEventPhotos(photosData)
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      setError('Impossible de charger les événements')
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date)
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

  const PhotoGallery = ({ photos, eventTitle }) => {
    if (!photos || photos.length === 0) return null
    
    return (
      <div className="mt-4">
        <div className="flex items-center mb-3">
          <Image className="w-4 h-4 mr-2 text-[#425e9b]" />
          <span className="text-sm font-medium text-gray-700">
            Photos de l'événement ({photos.length})
          </span>
        </div>
        
        {/* Grid layout for photos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`http://localhost:5556/api/events/photos/${photo.filename}`}
                  alt={`${eventTitle} - Photo ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => setSelectedPhoto({
                    src: `http://localhost:5556/api/events/photos/${photo.filename}`,
                    alt: `${eventTitle} - Photo ${index + 1}`,
                    title: eventTitle
                  })}
                  onError={(e) => {
                    console.error('Erreur de chargement de l\'image:', photo.filename);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback en cas d'erreur de chargement */}
                <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500 ml-2">Image non disponible</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#425e9b] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des animations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="bg-[#425e9b] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#3a5287] transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#425e9b] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Animations & Événements
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
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
                  ? 'bg-[#425e9b] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous les événements
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                filter === 'upcoming'
                  ? 'bg-[#425e9b] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                filter === 'past'
                  ? 'bg-[#425e9b] text-white'
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
                const eventDate = new Date(event.date)
                const today = new Date()
                const isUpcoming = eventDate >= today
                
                return (
                  <div key={event.id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                    isUpcoming ? 'border-l-4 border-[#425e9b]' : 'border-l-4 border-gray-300'
                  }`}>
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 mr-3">
                              {event.title}
                            </h3>
                            {isUpcoming && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                À venir
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-lg">
                            {event.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-[#425e9b]" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-[#425e9b]" />
                              <span>{event.heure || formatTime(event.date)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-[#425e9b]" />
                              <span>{event.lieu || 'Terrain du club'}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-[#425e9b]" />
                              <span>
                                {event.publicCible || 'Ouvert à tous'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Photo Gallery */}
                          <PhotoGallery 
                            photos={eventPhotos[event.id]} 
                            eventTitle={event.title}
                          />
                        </div>
                        
                        {isUpcoming && (
                          <div className="mt-4 lg:mt-0 lg:ml-6">
                            <button className="bg-[#425e9b] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#3a5287] transition-colors duration-200">
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
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedPhoto.title && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {selectedPhoto.title}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Animations