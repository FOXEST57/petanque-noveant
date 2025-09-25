import { useState, useEffect } from 'react';
import { eventsAPI } from '../api/events.js';
import { useAuth } from './useAuth';
import { EventUtils } from '../utils/eventUtils.ts';
import { apiCall } from '../utils/apiCall.js';

interface Event {
  id: string;
  date: string;
  photos?: any[];
  [key: string]: any;
}

interface EventPhotos {
  [eventId: string]: any[];
}

export const useHomeEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventPhotos, setEventPhotos] = useState<EventPhotos>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  // Fonction pour récupérer les photos d'un événement depuis la base de données
  const fetchEventPhotos = async (eventId: string): Promise<any[]> => {
    try {
      console.log(`🔍 fetchEventPhotos - Récupération des photos pour l'événement ${eventId}`);
      // Utiliser apiCall pour inclure automatiquement le paramètre club
      const photos = await apiCall(`/events/${eventId}/photos`);
      console.log(`🔍 fetchEventPhotos - Photos récupérées pour événement ${eventId}:`, photos);
      // Les photos ont déjà les bonnes URLs construites par getEventPhotos dans database.js
      return photos || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des photos de l'événement ${eventId}:`, error);
    }
    return [];
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 useHomeEvents - Début de la récupération des événements');

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

        console.log('🔍 useHomeEvents - isConnected:', isConnected, 'userRole:', userRole);

        // Fetch events with filtering
        const eventsResponse = isConnected ? await eventsAPI.getAllAuth() : await eventsAPI.getAll();
        
        console.log('🔍 useHomeEvents - eventsResponse reçue:', eventsResponse);
        console.log('🔍 useHomeEvents - Type de eventsResponse:', typeof eventsResponse);
        
        // Extraire les événements de la réponse API
        let eventsData;
        if (eventsResponse?.success && eventsResponse?.data) {
          eventsData = eventsResponse.data;
        } else if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse;
        } else {
          eventsData = eventsResponse?.data || eventsResponse;
        }
        
        console.log('🔍 useHomeEvents - eventsData extraites:', eventsData);
        console.log('🔍 useHomeEvents - Est un array:', Array.isArray(eventsData));
        
        if (eventsData && Array.isArray(eventsData)) {
          console.log('🔍 useHomeEvents - Nombre d\'événements:', eventsData.length);
          
          // Sort events by date (most recent first)
          const sortedEvents = eventsData.sort((a: Event, b: Event) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          console.log('🔍 useHomeEvents - Événements triés:', sortedEvents);
          setEvents(sortedEvents);

          // Fetch photos for each event
          console.log('🔍 useHomeEvents - Début de la récupération des photos pour', sortedEvents.length, 'événements');
          const photosPromises = sortedEvents.map(async (event: Event) => {
            console.log(`🔍 useHomeEvents - Récupération des photos pour l'événement ${event.id} (${event.title})`);
            const photos = await fetchEventPhotos(event.id);
            console.log(`🔍 useHomeEvents - Photos récupérées pour événement ${event.id}:`, photos.length, 'photos');
            return { eventId: event.id, photos };
          });

          const photosResults = await Promise.all(photosPromises);
          console.log('🔍 useHomeEvents - Résultats de toutes les photos:', photosResults);
          
          const photosMap: EventPhotos = {};
          
          photosResults.forEach(({ eventId, photos }) => {
            console.log(`🔍 useHomeEvents - Ajout des photos pour événement ${eventId}:`, photos.length, 'photos');
            photosMap[eventId] = photos;
          });

          console.log('🔍 useHomeEvents - Photos récupérées (photosMap):', photosMap);
          setEventPhotos(photosMap);
        } else {
          console.log('🔍 useHomeEvents - Aucun événement trouvé ou données invalides');
          console.log('🔍 useHomeEvents - eventsData:', eventsData);
          setEvents([]);
          setEventPhotos({});
        }
      } catch (error) {
        console.error('🔍 useHomeEvents - Erreur lors de la récupération des événements:', error);
        setError('Erreur lors du chargement des événements');
        setEvents([]);
        setEventPhotos({});
      } finally {
        console.log('🔍 useHomeEvents - Fin du chargement');
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
    getRelevantEvents: EventUtils.getRelevantEvents,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-trigger the useEffect
      window.location.reload();
    }
  };
};