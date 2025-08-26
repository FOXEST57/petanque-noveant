import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Club Pétanque</h3>
                <p className="text-sm text-gray-400">Noveant-sur-Moselle</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Un club convivial et dynamique qui rassemble les passionnés de pétanque 
              de tous âges dans une ambiance chaleureuse et sportive.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/equipes" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Équipes
                </Link>
              </li>
              <li>
                <Link 
                  to="/animations" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Animations
                </Link>
              </li>
              <li>
                <Link 
                  to="/galerie" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>Terrain municipal</p>
                  <p>Rue des Sports</p>
                  <p>57680 Noveant-sur-Moselle</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">03 87 30 XX XX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">contact@petanque-noveant.fr</span>
              </li>
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horaires</h4>
            <div className="flex items-start space-x-3 mb-4">
              <Clock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-gray-400 text-sm">
                <p className="mb-1"><span className="font-medium">Mardi & Jeudi :</span> 14h - 18h</p>
                <p className="mb-1"><span className="font-medium">Samedi :</span> 14h - 19h</p>
                <p><span className="font-medium">Dimanche :</span> 9h - 12h</p>
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <h5 className="text-sm font-semibold mb-2 text-gray-300">Suivez-nous</h5>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Club de Pétanque Noveant-sur-Moselle. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link 
                to="/mentions-legales" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Mentions légales
              </Link>
              <Link 
                to="/politique-confidentialite" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
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