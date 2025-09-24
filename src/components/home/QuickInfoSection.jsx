import { MapPin, Clock, Users } from 'lucide-react';

/**
 * Section d'informations rapides (localisation, horaires, membres)
 */
const QuickInfoSection = ({ homeContent }) => {
  return (
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
  );
};

export default QuickInfoSection;