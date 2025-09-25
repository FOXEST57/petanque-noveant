interface Event {
  id: string;
  date: string;
  photos?: any[];
  [key: string]: any;
}

/**
 * Utilitaires pour la gestion et le tri des événements
 */
export class EventUtils {
  /**
   * Obtient les 3 événements les plus pertinents, en priorisant ceux avec des photos
   * @param events - Liste des événements
   * @returns Les 3 événements les plus pertinents
   */
  static getRelevantEvents(events: Event[]): Event[] {
    console.log('🔍 getRelevantEvents - input events:', events);
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      console.log('🔍 getRelevantEvents - no events, returning empty array');
      return [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('🔍 getRelevantEvents - today:', today);
    
    // Séparer les événements avec et sans photos
    const eventsWithPhotos = events.filter(event => event.photos && event.photos.length > 0);
    const eventsWithoutPhotos = events.filter(event => !event.photos || event.photos.length === 0);
    
    console.log('🔍 getRelevantEvents - eventsWithPhotos:', eventsWithPhotos);
    console.log('🔍 getRelevantEvents - eventsWithoutPhotos:', eventsWithoutPhotos);
    
    // Trier les événements par pertinence de date
    const sortedEventsWithPhotos = this.sortEventsByRelevance(eventsWithPhotos);
    const sortedEventsWithoutPhotos = this.sortEventsByRelevance(eventsWithoutPhotos);
    
    console.log('🔍 getRelevantEvents - sortedEventsWithPhotos:', sortedEventsWithPhotos);
    console.log('🔍 getRelevantEvents - sortedEventsWithoutPhotos:', sortedEventsWithoutPhotos);
    
    // Combiner : événements avec photos en premier, puis événements sans photos
    const sortedEvents = [...sortedEventsWithPhotos, ...sortedEventsWithoutPhotos];
    
    console.log('🔍 getRelevantEvents - sortedEvents:', sortedEvents);
    
    // Retourner les 3 premiers événements
    const result = sortedEvents.slice(0, 3);
    console.log('🔍 getRelevantEvents - final result:', result);
    
    return result;
  }

  /**
   * Trie les événements par pertinence de date (futurs en premier par date croissante, puis passés par date décroissante)
   * @param eventsList - Liste des événements à trier
   * @returns Événements triés par pertinence
   */
  static sortEventsByRelevance(eventsList: Event[]): Event[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureEvents = eventsList.filter(event => new Date(event.date) >= today);
    const pastEvents = eventsList.filter(event => new Date(event.date) < today);
    
    // Trier les événements futurs par date (croissant - le plus proche en premier)
    futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Trier les événements passés par date (décroissant - le plus récent en premier)
    pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return [...futureEvents, ...pastEvents];
  }

  /**
   * Filtre les événements selon le rôle utilisateur
   * @param events - Liste des événements
   * @param userRole - Rôle de l'utilisateur ('public', 'licencie', 'comite', 'admin')
   * @param isConnected - Si l'utilisateur est connecté
   * @returns Événements filtrés selon les permissions
   */
  static filterEventsByUserRole(events: Event[], userRole: string, isConnected: boolean): Event[] {
    if (!events || !Array.isArray(events)) return [];
    
    // Si l'utilisateur n'est pas connecté, ne montrer que les événements publics
    if (!isConnected) {
      return events.filter(event => event.visibility === 'public' || !event.visibility);
    }
    
    // Filtrage selon le rôle
    switch (userRole) {
      case 'admin':
        // Les admins voient tous les événements
        return events;
      
      case 'comite':
        // Les membres du comité voient tous les événements sauf ceux réservés aux admins
        return events.filter(event => 
          !event.visibility || 
          event.visibility !== 'admin_only'
        );
      
      case 'licencie':
        // Les licenciés voient les événements publics et ceux pour licenciés
        return events.filter(event => 
          !event.visibility || 
          event.visibility === 'public' || 
          event.visibility === 'licencie'
        );
      
      default:
        // Par défaut, ne montrer que les événements publics
        return events.filter(event => event.visibility === 'public' || !event.visibility);
    }
  }

  /**
   * Obtient les événements à venir
   * @param events - Liste des événements
   * @returns Événements futurs triés par date
   */
  static getUpcomingEvents(events: Event[]): Event[] {
    if (!events || !Array.isArray(events)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Obtient les événements passés
   * @param events - Liste des événements
   * @returns Événements passés triés par date décroissante
   */
  static getPastEvents(events: Event[]): Event[] {
    if (!events || !Array.isArray(events)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => new Date(event.date) < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Obtient les événements avec photos
   * @param events - Liste des événements
   * @returns Événements ayant des photos
   */
  static getEventsWithPhotos(events: Event[]): Event[] {
    if (!events || !Array.isArray(events)) return [];
    
    return events.filter(event => event.photos && event.photos.length > 0);
  }

  /**
   * Formate une date d'événement pour l'affichage
   * @param dateString - Date au format string
   * @returns Date formatée pour l'affichage
   */
  static formatEventDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return dateString;
    }
  }

  /**
   * Vérifie si un événement est à venir
   * @param dateString - Date de l'événement
   * @returns true si l'événement est à venir
   */
  static isUpcomingEvent(dateString: string): boolean {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    } catch (error) {
      console.error('Erreur lors de la vérification de la date:', error);
      return false;
    }
  }
}