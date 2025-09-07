import { Link } from 'react-router-dom'
import { Calendar, Users, Trophy, MapPin, Clock } from 'lucide-react'
import Carousel from '../components/Carousel'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <Carousel />
        
        {/* Welcome overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Bienvenue au Club de Pétanque
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Noveant-sur-Moselle
            </p>
            <div className="space-x-4">
              <Link
                to="/equipes"
                className="bg-[#425e9b] hover:bg-[#3a5287] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
              >
                Découvrir nos équipes
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
              >
                Nous rejoindre
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#425e9b]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notre Localisation</h3>
              <p className="text-gray-600">
                Veloroute Charles le téméraire<br />
                57680 Novéant-sur-Moselle, France
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#425e9b]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Horaires d'ouverture</h3>
              <p className="text-gray-600">
                Ouvert tous les jours
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#425e9b]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nos Membres</h3>
              <p className="text-gray-600">
                Plus de 80 licenciés<br />
                Toutes catégories d'âge<br />
                Ambiance conviviale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Découvrez notre club
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un club dynamique qui propose de nombreuses activités tout au long de l'année
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Équipes */}
            <Link to="/equipes" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-200">
                  <Users className="w-6 h-6 text-[#425e9b]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                    Nos Équipes
                  </h3>
                  <p className="text-gray-600">
                    Découvrez nos équipes et leurs performances dans les différents championnats.
                  </p>
                </div>
              </div>
            </Link>

            {/* Animations */}
            <Link to="/animations" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors duration-200">
                  <Calendar className="w-6 h-6 text-[#425e9b]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                     Nos Animations
                  </h3>
                  <p className="text-gray-600">
                    Tournois, événements spéciaux et animations pour tous les âges.
                  </p>
                </div>
              </div>
            </Link>

            {/* Compétitions */}
            <Link to="/competitions" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                  <Trophy className="w-6 h-6 text-[#425e9b]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                     Nos Tournois
                  </h3>
                  <p className="text-gray-600">
                    Suivez nos résultats et classements dans les championnats régionaux.
                  </p>
                </div>
              </div>
            </Link>


          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Actualités du club
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <article className="bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="/image/AdobeStock_133397076.jpeg" 
                alt="Tournoi d'été" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                  15 Juin 2024
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Grand Tournoi d'Été
                </h3>
                <p className="text-gray-600 mb-4">
                  Inscriptions ouvertes pour notre traditionnel tournoi d'été qui aura lieu le 20 juillet.
                </p>
                <Link 
                  to="/animations" 
                  className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                >
                  En savoir plus →
                </Link>
              </div>
            </article>

            {/* News Item 2 */}
            <article className="bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="/image/AdobeStock_114710176.jpeg" 
                alt="Nouveaux équipements" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                   20 Mai 2024
                 </div>
                <h3 className="text-xl font-semibold mb-3">
                  Nouveaux Équipements
                </h3>
                <p className="text-gray-600 mb-4">
                  Le club s'équipe de nouvelles boules de compétition pour améliorer les conditions de jeu.
                </p>
                <Link 
                  to="/contact" 
                  className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                >
                  En savoir plus →
                </Link>
              </div>
            </article>

            {/* News Item 3 */}
            <article className="bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src="/image/AdobeStock_645053.jpeg" 
                alt="Assemblée générale" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-[#425e9b] font-semibold mb-2">
                   10 Mai 2024
                 </div>
                <h3 className="text-xl font-semibold mb-3">
                  Assemblée Générale
                </h3>
                <p className="text-gray-600 mb-4">
                  Retour sur l'assemblée générale du club et présentation des projets pour la saison.
                </p>
                <Link 
                  to="/contact" 
                  className="text-[#425e9b] hover:text-[#3a5287] font-semibold"
                 >
                   En savoir plus →
                 </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#425e9b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Rejoignez notre club !
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Que vous soyez débutant ou joueur confirmé, notre club vous accueille dans une ambiance conviviale et sportive.
          </p>
          <Link
            to="/contact"
            className="bg-white text-[#425e9b] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home