import { Link } from 'react-router-dom';

/**
 * Section d'appel à l'action (Call-to-Action) pour rejoindre le club
 */
const CTASection = ({ preserveUrlParams }) => {
  return (
    <section className="py-16 bg-[var(--primary-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Rejoignez notre club !
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Que vous soyez débutant ou joueur confirmé, notre club vous accueille dans une ambiance conviviale et sportive.
        </p>
        <Link
          to={preserveUrlParams('/contact')}
          className="bg-white text-[var(--primary-color)] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
};

export default CTASection;