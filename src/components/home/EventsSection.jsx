import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import EventCarousel from '../EventCarousel';

/**
 * Section des activités du club avec les événements
 */
const EventsSection = ({ events, eventPhotos, getRelevantEvents }) => {
  const relevantEvents = getRelevantEvents(events);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Activités du club</h2>
          <p className="text-lg text-gray-600">Découvrez nos événements les plus récents et à venir</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getRelevantEvents(events).length > 0 ? (
            getRelevantEvents(events).map((event, index) => {
              const eventDate = new Date(event.date);
              const isUpcoming = eventDate >= new Date();
              const eventImages = eventPhotos[event.id] || [];
              
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
              );
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
  );
};

export default EventsSection;