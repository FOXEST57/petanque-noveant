import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { useAuth } from './useAuth';

interface Event {
  id: string;
  date: string;
  photos?: any[];
  [key: string]: any;
}

interface EventPhotos {
  [eventId: string]: any[];
}

/**
 * Hook personnalisé pour gérer les événements et leurs photos sur la page d'accueil
 * Responsable de la récupération des événements selon le rôle utilisateur et du chargement des photos
 */
export const useHomeEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventPhotos, setEventPhotos] = useState<EventPhotos>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // Function to get the 3 most relevant events, prioritizing events with photos
  const getRelevantEvents = (events: Event[]) => {
    if (!events || !Array.isArray(events) || events.length === 0) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Separate events with and without photos
    const eventsWithPhotos = events.filter(event => event.photos && event.photos.length > 0);
    const eventsWithoutPhotos = events.filter(event => !event.photos || event.photos.length === 0);
    
    // Function to sort events by date relevance
    const sortEventsByRelevance = (eventsList: Event[]) => {
      const futureEvents = eventsList.filter(event => new Date(event.date) >= today);
      const pastEvents = eventsList.filter(event => new Date(event.date) < today);
      
      // Sort future events by date (ascending - closest first)
      futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Sort past events by date (descending - most recent first)
      pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return [...futureEvents, ...pastEvents];
    };
    
    // Prioritize events with photos, then events without photos
    const sortedEventsWithPhotos = sortEventsByRelevance(eventsWithPhotos);
    const sortedEventsWithoutPhotos = sortEventsByRelevance(eventsWithoutPhotos);
    
    // Combine: events with photos first, then events without photos
    const sortedEvents = [...sortedEventsWithPhotos, ...sortedEventsWithoutPhotos];
    
    // Return the first 3 events
    return sortedEvents.slice(0, 3);
  };

  // Function to fetch photos for an event
  const fetchEventPhotos = async (eventId: string) => {
    try {
      const url = `/events/${eventId}/photos`;
      
      console.log('📸 useHomeEvents - Récupération photos:', {
        eventId,
        url
      });
      
      const response = await apiCall(url);
      
      console.log('📸 useHomeEvents - Photos récupérées:', {
        eventId,
        response,
        photosLength: response?.length
      });
      return response || [];
    } catch (error) {
      console.error(`📸 useHomeEvents - Erreur fetch photos event ${eventId}:`, error);
    }
    return [];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine user role and connection status for event filtering
        const isConnected = !!user;
        let userRole = 'public';
        
        if (userProfile?.role === 'admin') {
          userRole = 'admin';
        } else if (userProfile?.role === 'responsable' || userProfile?.role === 'comite') {
          userRole = 'comite';
        } else if (userProfile?.role === 'membre') {
          userRole = 'licencie';
        }

        // Fetch events with filtering
        // For public access (non-authenticated users), use the public endpoint
        const eventsEndpoint = isConnected ? '/events' : '/events/public';
        const params = isConnected ? new URLSearchParams({
          isConnected: isConnected.toString(),
          userRole: userRole
        }) : '';
        
        const eventsUrl = params ? `${eventsEndpoint}?${params}` : `${eventsEndpoint}`;
        
        try {
          const eventsData = await apiCall(eventsUrl);
          
          // Handle the API response structure
          let validEvents: Event[] = [];
          if (eventsData && eventsData.success && Array.isArray(eventsData.data)) {
            validEvents = eventsData.data;
          } else if (Array.isArray(eventsData)) {
            validEvents = eventsData;
          }
          
          setEvents(validEvents);
          
          // Fetch photos for relevant events (avec gestion d'erreur)
          const relevantEvents = getRelevantEvents(validEvents);
          
          console.log('🎯 useHomeEvents - Chargement des événements...');
          console.log('🎯 useHomeEvents - Événements récupérés:', {
            validEvents,
            eventsLength: validEvents?.length
          });
          
          try {
            const photosPromises = relevantEvents.map(async (event) => {
              try {
                const photos = await fetchEventPhotos(event.id);
                return { eventId: event.id, photos };
              } catch (error) {
                console.warn(`⚠️ Impossible de charger les photos pour l'événement ${event.id}:`, error);
                return { eventId: event.id, photos: [] };
              }
            });
            
            const photosResults = await Promise.all(photosPromises);
            console.log('🎯 useHomeEvents - Résultats photos:', photosResults);
            
            const photosMap: EventPhotos = {};
            photosResults.forEach(({ eventId, photos }) => {
              photosMap[eventId] = photos;
            });
            
            console.log('🎯 useHomeEvents - Map finale des photos:', photosMap);
            setEventPhotos(photosMap);
          } catch (error) {
            console.warn('⚠️ Erreur lors du chargement des photos d\'événements:', error);
            setEventPhotos({});
          }
        } catch (error) {
          console.warn('⚠️ Impossible de charger les événements:', error);
          setEvents([]);
          setError('Erreur lors du chargement des événements');
        }
      } catch (error) {
        console.error('🎯 useHomeEvents - Erreur générale:', error);
        setError('Erreur générale lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, userProfile]);

  return {
    events,
    eventPhotos,
    loading,
    error,
    getRelevantEvents
  };
};