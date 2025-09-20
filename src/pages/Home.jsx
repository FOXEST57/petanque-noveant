import { Link } from 'react-router-dom'
import { Calendar, Users, Trophy, MapPin, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Carousel from '../components/Carousel'
import EventCarousel from '../components/EventCarousel'

const Home = () => {
  const [homeContent, setHomeContent] = useState(null)
  const [events, setEvents] = useState([])
  const [eventPhotos, setEventPhotos] = useState({})
  const [loading, setLoading] = useState(true)
  const { user, userProfile } = useAuth()

  // Function to get the 3 most relevant events
  const getRelevantEvents = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Separate future and past events
    const futureEvents = events.filter(event => new Date(event.date) >= today)
    const pastEvents = events.filter(event => new Date(event.date) < today)
    
    // Sort future events by date (ascending - closest first)
    futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Sort past events by date (descending - most recent first)
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Select events according to the logic
    const selectedEvents = []
    
    // First, add future events (max 3)
    const futureToAdd = Math.min(3, futureEvents.length)
    selectedEvents.push(...futureEvents.slice(0, futureToAdd))
    
    // If we need more events, add past events
    const remainingSlots = 3 - selectedEvents.length
    if (remainingSlots > 0 && pastEvents.length > 0) {
      selectedEvents.push(...pastEvents.slice(0, remainingSlots))
    }
    
    return selectedEvents
  }

  // Function to fetch photos for an event
  const fetchEventPhotos = async (eventId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/photos`)
      if (response.ok) {
        const photos = await response.json()
        return photos || []
      }
    } catch (error) {
      console.error(`Error fetching photos for event ${eventId}:`, error)
    }
    return []
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home content
        const homeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/home-content`)
        if (homeResponse.ok) {
          const homeData = await homeResponse.json()
          // Extract data from API response structure
          if (homeData.success && homeData.data) {
            setHomeContent(homeData.data)
          } else {
            setHomeContent(homeData)
          }
        }

        // Determine user role and connection status for event filtering
        const isConnected = !!user
        let userRole = 'public'
        
        if (userProfile?.role === 'admin') {
          userRole = 'admin'
        } else if (userProfile?.role === 'responsable' || userProfile?.role === 'comite') {
          userRole = 'comite'
        } else if (userProfile?.role === 'membre') {
          userRole = 'licencie'
        }

        // Fetch events with filtering
        const params = new URLSearchParams({
          isConnected: isConnected.toString(),
          userRole: userRole
        })
        
        const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events?${params}`)
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          
          // Handle the API response structure
          let validEvents = []
          if (eventsData && eventsData.success && Array.isArray(eventsData.data)) {
            validEvents = eventsData.data
          } else if (Array.isArray(eventsData)) {
            validEvents = eventsData
          }
          
          setEvents(validEvents)
          
          // Fetch photos for relevant events
          const relevantEvents = getRelevantEvents(validEvents)
          
          const photosPromises = relevantEvents.map(async (event) => {
            const photos = await fetchEventPhotos(event.id)
            return { eventId: event.id, photos }
          })
          
          const photosResults = await Promise.all(photosPromises)
          const photosMap = {}
          photosResults.forEach(({ eventId, photos }) => {
            photosMap[eventId] = photos
          })
          setEventPhotos(photosMap)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, userProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <Carousel />
        
        {/* Welcome overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {homeContent?.title || 'Bienvenue au Club de Pétanque'}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {homeContent?.description || 'Noveant-sur-Moselle'}
            </p>
            <div className="space-x-4">
              <Link
                to="/equipes"
                className="bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
              >
                Découvrir nos équipes
              </Link>
              <Link
                to="/membership-request"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
              >
                Nous rejoindre
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[var(--primary-color)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notre Localisation</h3>
              <p className="text-gray-600">
                {homeContent?.location || 'Veloroute Charles le téméraire\n57680 Novéant-sur-Moselle, France'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--primary-color)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Horaires d'ouverture</h3>
              <p className="text-gray-600">
                {homeContent?.openingHours || 'Ouvert tous les jours'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--primary-color)]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nos Membres</h3>
              <p className="text-gray-600">
                {homeContent?.members || 'Plus de 80 licenciés\nToutes catégories d\'âge\nAmbiance conviviale'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {homeContent?.clubTitle || 'Découvrez notre club'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {homeContent?.clubDescription || 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:justify-around">
            {/* Équipes */}
            <Link to="/equipes" className="group w-full sm:w-80 md:w-72 lg:w-80">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-200 mx-auto">
                  <Users className="w-6 h-6 text-[var(--primary-color)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary-color)] transition-colors duration-200">
                    Nos Équipes
                  </h3>
                  <p className="text-gray-600">
                    {homeContent?.teamsContent || 'Découvrez nos équipes et leurs performances dans les différents championnats.'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Animations */}
            <Link to="/animations" className="group w-full sm:w-80 md:w-72 lg:w-80">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-200 mx-auto">
                  <Calendar className="w-6 h-6 text-[var(--primary-color)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary-color)] transition-colors duration-200">
                     Nos Animations
                  </h3>
                  <p className="text-gray-600">
                    {homeContent?.animationsContent || 'Tournois, événements spéciaux et animations pour tous les âges.'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Compétitions */}
            <Link to="/competitions" className="group w-full sm:w-80 md:w-72 lg:w-80">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200 mx-auto">
                  <Trophy className="w-6 h-6 text-[var(--primary-color)]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary-color)] transition-colors duration-200">
                     Nos Tournois
                  </h3>
                  <p className="text-gray-600">
                    {homeContent?.tournamentsContent || 'Suivez nos résultats et classements dans les championnats régionaux.'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Activités du club Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Activités du club</h2>
            <p className="text-lg text-gray-600">Découvrez nos événements les plus récents et à venir</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getRelevantEvents(events).length > 0 ? (
              getRelevantEvents(events).map((event, index) => {
                const eventDate = new Date(event.date)
                const isUpcoming = eventDate >= new Date()
                const eventImages = eventPhotos[event.id] || []
                
                return (
                  <article key={event.id || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <EventCarousel 
                      images={eventImages}
                      eventTitle={event.title}
                    />
                    <div className="p-6">
                      <div className="flex items-center text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className={isUpcoming ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {eventDate.toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                        {isUpcoming && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            À venir
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {event.description || 'Découvrez les détails de cet événement du club.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/animations?id=${event.id}`} 
                          className="text-[var(--primary-color)] hover:text-[var(--primary-dark)] font-medium transition-colors duration-200"
                        >
                          Lire la suite →
                        </Link>
                        {eventImages.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {eventImages.length} photo{eventImages.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement disponible</h3>
                <p className="text-gray-600">Les prochains événements seront bientôt annoncés.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--primary-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Rejoignez notre club !
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Que vous soyez débutant ou joueur confirmé, notre club vous accueille dans une ambiance conviviale et sportive.
          </p>
          <Link
            to="/contact"
            className="bg-white text-[var(--primary-color)] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home