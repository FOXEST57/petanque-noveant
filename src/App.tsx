import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { DrinksProvider } from './contexts/DrinksContext.jsx'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.jsx'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Bar from './pages/Bar'
import Admin from './pages/Admin'
import Animations from './pages/Animations'
import Contact from './pages/Contact'
import Equipes from './pages/Equipes'
import Login from './pages/Login'
import TestTeamManagement from './pages/TestTeamManagement'

// Placeholder components for other pages
const Dashboard = () => <div className="min-h-screen bg-gray-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Tableau de bord</h1><p className="text-gray-600">Page en cours de développement...</p></div></div>

// Fonction pour charger les paramètres du site au démarrage
const loadSiteSettings = async () => {
  try {
    const response = await fetch('/api/site-settings');
    const result = await response.json();
    
    if (result.success && result.data) {
      const settings = result.data;
      const root = document.documentElement;
      
      // Appliquer la couleur principale si elle existe
      if (settings.primary_color) {
        // Fonction pour éclaircir une couleur
        const lightenColor = (color, percent) => {
          const num = parseInt(color.replace("#", ""), 16);
          const amt = Math.round(2.55 * percent);
          const R = (num >> 16) + amt;
          const G = (num >> 8 & 0x00FF) + amt;
          const B = (num & 0x0000FF) + amt;
          return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        };

        // Fonction pour assombrir une couleur
        const darkenColor = (color, percent) => {
          const num = parseInt(color.replace("#", ""), 16);
          const amt = Math.round(2.55 * percent);
          const R = (num >> 16) - amt;
          const G = (num >> 8 & 0x00FF) - amt;
          const B = (num & 0x0000FF) - amt;
          return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
        };
        
        // Calculer les variantes de couleur
        const lightColor = lightenColor(settings.primary_color, 20);
        const darkColor = darkenColor(settings.primary_color, 15);
        
        // Mettre à jour les variables CSS
        root.style.setProperty('--primary-color', settings.primary_color);
        root.style.setProperty('--primary-light', lightColor);
        root.style.setProperty('--primary-dark', darkColor);
      }

      // Mettre à jour le favicon si il existe
      if (settings.favicon_url) {
        let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!faviconLink) {
          faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          document.head.appendChild(faviconLink);
        }
        faviconLink.href = `/${settings.favicon_url}`;
      }

      // Mettre à jour le titre de la page avec le nom du club
      if (settings.club_name) {
        document.title = settings.club_name;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres du site:', error);
  }
};


export default function App() {
  useEffect(() => {
    // Charger les paramètres du site au démarrage
    loadSiteSettings();
  }, []);

  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <DrinksProvider>
          <CartProvider>
            <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/equipes" element={<Equipes />} />
                <Route path="/animations" element={<Animations />} />

                <Route path="/bar" element={<Bar />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/test-team-management" element={<TestTeamManagement />} />
              </Routes>
            </main>
            <Footer />
          </div>
            <Toaster position="top-right" richColors />
            </Router>
          </CartProvider>
        </DrinksProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  )
}
