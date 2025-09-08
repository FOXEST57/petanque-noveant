import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { DrinksProvider } from './contexts/DrinksContext.jsx'
import { Toaster } from 'sonner'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Bar from './pages/Bar'
import Admin from './pages/Admin'
import Animations from './pages/Animations'
import Contact from './pages/Contact'
import Equipes from './pages/Equipes'
import Login from './pages/Login'

// Placeholder components for other pages
const Dashboard = () => <div className="min-h-screen bg-gray-50 py-12"><div className="max-w-7xl mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Tableau de bord</h1><p className="text-gray-600">Page en cours de développement...</p></div></div>


export default function App() {
  return (
    <AuthProvider>
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
            </Routes>
          </main>
          <Footer />
        </div>
          <Toaster position="top-right" richColors />
          </Router>
        </CartProvider>
      </DrinksProvider>
    </AuthProvider>
  )
}
