import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { DrinksProvider } from './contexts/DrinksContext.jsx'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.jsx'
import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Bar from './pages/Bar'
import Admin from './pages/Admin'
import Animations from './pages/Animations'
import Contact from './pages/Contact'
import Equipes from './pages/Equipes'
import Evenements from './pages/Evenements.jsx'
import Login from './pages/Login'
import TestTeamManagement from './pages/TestTeamManagement'
import MembershipRequest from './pages/MembershipRequest'
import RegisterInvitation from './pages/RegisterInvitation'
import RegisterRedirect from './components/RegisterRedirect'
import ClubFinder from './pages/ClubFinder'

// Placeholder components for other pages
const Dashboard = () => <div className="min-h-screen bg-gray-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Tableau de bord</h1><p className="text-gray-600">Page en cours de développement...</p></div></div>

// Fonction pour charger les paramètres du site au démarrage
const loadSiteSettings = async () => {
  try {
    const response = await fetch('/api/site-settings/public');
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
  const [isMainDomain, setIsMainDomain] = useState(false);
  const [clubSubdomain, setClubSubdomain] = useState(null);

  useEffect(() => {
    // Detect subdomain and set state
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
    
    if (isLocalhost) {
      // Development mode: check for subdomain in localhost
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[1] === 'localhost') {
        // We have a subdomain like "toulouse.localhost"
        setClubSubdomain(parts[0]);
        setIsMainDomain(false);
        console.log('🏠 Mode développement - Sous-domaine détecté:', parts[0]);
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // We're on the main localhost domain
        setIsMainDomain(true);
        console.log('🏠 Mode développement - Domaine principal');
      }
    } else {
      // Production mode: check for subdomain in petanque-club.fr
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        setClubSubdomain(parts[0]);
        setIsMainDomain(false);
        console.log('🌐 Mode production - Sous-domaine détecté:', parts[0]);
      } else {
        setIsMainDomain(true);
        console.log('🌐 Mode production - Domaine principal');
      }
    }

    loadSiteSettings();
  }, []);

  // Si c'est le domaine principal, afficher la page de recherche de clubs
  if (isMainDomain) {
    return (
      <div className="min-h-screen">
        <ClubFinder />
        <Toaster position="top-right" richColors />
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppContent clubSubdomain={clubSubdomain} isMainDomain={isMainDomain} />
    </AuthProvider>
  );
}

// Composant interne qui utilise le contexte d'authentification
function AppContent({ clubSubdomain, isMainDomain }) {
  const { user, userProfile } = useAuth();

  // Auto-redirect authenticated users to their club subdomain
  useEffect(() => {
    if (user && userProfile && !isMainDomain) {
      // User is connected and we're on a club subdomain
      // Check if user belongs to this club
      const currentSubdomain = clubSubdomain;
      const userClubSubdomain = userProfile.club_subdomain;
      
      if (userClubSubdomain && userClubSubdomain !== currentSubdomain) {
        // User belongs to a different club, redirect to their club
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        if (isLocalhost) {
          window.location.href = `http://${userClubSubdomain}.localhost:5174`;
        } else {
          window.location.href = `https://${userClubSubdomain}.petanque-club.fr`;
        }
      }
    }
  }, [user, userProfile, isMainDomain, clubSubdomain]);

  return (
      <SiteSettingsProvider>
        <DrinksProvider>
          <CartProvider>
            <Router future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/equipes" element={<Equipes />} />
                <Route path="/evenements" element={<Evenements />} />
                <Route path="/animations" element={<Animations />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/test-team-management" element={<TestTeamManagement />} />
                <Route path="/membership-request" element={<MembershipRequest />} />
                <Route path="/register/:token" element={<RegisterInvitation />} />
              </Routes>
            </main>
            <Footer />
          </div>
            <Toaster position="top-right" richColors />
            </Router>
          </CartProvider>
        </DrinksProvider>
      </SiteSettingsProvider>
    );
}
