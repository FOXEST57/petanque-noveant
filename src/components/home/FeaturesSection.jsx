import { Link } from 'react-router-dom';
import { Users, Calendar, Trophy } from 'lucide-react';

/**
 * Section des fonctionnalités du club (équipes, animations, tournois)
 */
const FeaturesSection = ({ homeContent, preserveUrlParams }) => {
  return (
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
          <Link to={preserveUrlParams('/equipes')} className="group w-full sm:w-80 md:w-72 lg:w-80">
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
          <Link to={preserveUrlParams('/animations')} className="group w-full sm:w-80 md:w-72 lg:w-80">
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
          <Link to={preserveUrlParams('/competitions')} className="group w-full sm:w-80 md:w-72 lg:w-80">
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
  );
};

export default FeaturesSection;