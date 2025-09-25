import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { DrinksProvider } from './contexts/DrinksContext';
import { CartProvider } from './contexts/CartContext';
import { useClubDetection } from './hooks/useClubDetection';
import { useSiteSettings } from './hooks/useSiteSettings';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Bar from './pages/Bar';
import Evenements from './pages/Evenements';
import Equipes from './pages/Equipes';
import Animations from './pages/Animations';
import Contact from './pages/Contact';
import ClubFinder from './pages/ClubFinder';
import MembershipRequest from './pages/MembershipRequest';
import RegisterInvitation from './pages/RegisterInvitation';
import TestTeamManagement from './pages/TestTeamManagement';

// Placeholder components for other pages
const Dashboard = () => <div className="min-h-screen bg-gray-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Tableau de bord</h1><p className="text-gray-600">Page en cours de développement...</p></div></div>

export default function App() {
  // Utiliser le hook de détection de club
  const { isMainDomain, clubSubdomain } = useClubDetection();
  
  // Charger et appliquer les paramètres du site
  useSiteSettings(clubSubdomain, isMainDomain);

  // Si c'est le domaine principal, afficher la page de recherche de clubs
  if (isMainDomain) {
    return (
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<ClubFinder />} />
            <Route path="/club-finder" element={<ClubFinder />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
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
          const port = window.location.port || '5175';
          // En mode développement, utiliser le paramètre club
          window.location.href = `http://localhost:${port}?club=${userClubSubdomain}`;
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
                <Route path="/club-finder" element={<ClubFinder />} />
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
