import { useState, useEffect } from 'react';
import { eventsAPI } from '../api/events.js';
import { useAuth } from './useAuth';
import { EventUtils } from '../utils/eventUtils';

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
      // Récupérer les métadonnées des photos depuis la base de données
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3007"}/api/events/${eventId}/photos`);
      if (response.ok) {
        const photos = await response.json();
        // Les photos ont déjà les bonnes URLs construites par getEventPhotos dans database.js
        return photos || [];
      }
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
        const eventsData = isConnected ? await eventsAPI.getAllAuth() : await eventsAPI.getAll();
        
        if (eventsData && Array.isArray(eventsData)) {
          // Sort events by date (most recent first)
          const sortedEvents = eventsData.sort((a: Event, b: Event) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });

          setEvents(sortedEvents);

          // Fetch photos for each event
          const photosPromises = sortedEvents.map(async (event: Event) => {
            const photos = await fetchEventPhotos(event.id);
            return { eventId: event.id, photos };
          });

          const photosResults = await Promise.all(photosPromises);
          const photosMap: EventPhotos = {};
          
          photosResults.forEach(({ eventId, photos }) => {
            photosMap[eventId] = photos;
          });

          setEventPhotos(photosMap);
        } else {
          setEvents([]);
          setEventPhotos({});
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        setError('Erreur lors du chargement des événements');
        setEvents([]);
        setEventPhotos({});
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
    getRelevantEvents: EventUtils.getRelevantEvents,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-trigger the useEffect
      window.location.reload();
    }
  };
};