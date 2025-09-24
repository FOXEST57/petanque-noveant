import { useLocation } from 'react-router-dom'
import { useHomeContent } from '../hooks/useHomeContent'
import { useHomeEvents } from '../hooks/useHomeEvents'
import HeroSection from '../components/home/HeroSection'
import QuickInfoSection from '../components/home/QuickInfoSection'
import FeaturesSection from '../components/home/FeaturesSection'
import EventsSection from '../components/home/EventsSection'
import CTASection from '../components/home/CTASection'

const Home = () => {
  const location = useLocation()
  const { homeContent, loading: contentLoading } = useHomeContent()
  const { events, eventPhotos, loading: eventsLoading, getRelevantEvents } = useHomeEvents()
  
  const loading = contentLoading || eventsLoading

  // Fonction pour préserver les paramètres d'URL (notamment le paramètre club)
  const preserveUrlParams = (path) => {
    const searchParams = new URLSearchParams(location.search)
    const clubParam = searchParams.get('club')
    if (clubParam) {
      return `${path}?club=${clubParam}`
    }
    return path
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection 
        homeContent={homeContent} 
        preserveUrlParams={preserveUrlParams} 
      />
      
      <QuickInfoSection homeContent={homeContent} />
      
      <FeaturesSection 
        homeContent={homeContent} 
        preserveUrlParams={preserveUrlParams} 
      />
      
      <EventsSection 
        events={events}
        eventPhotos={eventPhotos}
        getRelevantEvents={getRelevantEvents}
      />
      
      <CTASection preserveUrlParams={preserveUrlParams} />
    </div>
  )
}

export default Home