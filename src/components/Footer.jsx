import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Club Info */}
          <div>
            <div className="flex items-center mb-4 space-x-2">
              <div className="flex justify-center items-center w-10 h-10 bg-[#425e9b] rounded-full">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Club Pétanque</h3>
                <p className="text-sm text-gray-400">Noveant-sur-Moselle</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Un club convivial et dynamique qui rassemble les passionnés de pétanque 
              de tous âges dans une ambiance chaleureuse et sportive.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/equipes" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Équipes
                </Link>
              </li>
              <li>
                <Link 
                  to="/animations" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Animations
                </Link>
              </li>
              <li>
                <Link 
                  to="/galerie" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>Veloroute Charles le téméraire</p>
                  <p>57680 Novéant-sur-Moselle, France</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="flex-shrink-0 w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">06 45 20 66 XX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="flex-shrink-0 w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">contact@petanque-noveant.fr</span>
              </li>
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Horaires</h4>
            <div className="flex items-start mb-4 space-x-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <p className="mb-1"><span className="font-medium">Mardi & Jeudi :</span> 14h - 18h</p>
                <p className="mb-1"><span className="font-medium">Samedi :</span> 14h - 19h</p>
                <p><span className="font-medium">Dimanche :</span> 9h - 12h</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <h5 className="mb-2 text-sm font-semibold text-gray-300">Suivez-nous</h5>
              <div className="flex space-x-3">
                <a 
                  href="https://www.facebook.com/profile.php?id=61554702581873&locale=fr_FR" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col justify-between items-center md:flex-row">
            <p className="mb-4 text-sm text-gray-400 md:mb-0">
              © 2024 Club de Pétanque Noveant-sur-Moselle. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link 
                to="/mentions-legales" 
                className="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                Mentions légales
              </Link>
              <Link 
                to="/politique-confidentialite" 
                className="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer