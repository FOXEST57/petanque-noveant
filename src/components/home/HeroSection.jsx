import { Link } from 'react-router-dom';
import Carousel from '../Carousel';

/**
 * Section héro de la page d'accueil avec carousel et overlay de bienvenue
 */
const HeroSection = ({ homeContent, preserveUrlParams }) => {
  return (
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
              to={preserveUrlParams('/equipes')}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
            >
              Découvrir nos équipes
            </Link>
            <Link
              to={preserveUrlParams('/membership-request')}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
            >
              Nous rejoindre
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;