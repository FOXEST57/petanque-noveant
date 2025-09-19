import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSiteSettings } from '../contexts/SiteSettingsContext.jsx'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, userProfile, signOut, isAdmin, isMembre } = useAuth()
  const { siteSettings } = useSiteSettings()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const closeMenus = () => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    closeMenus()
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navigationItems = [
    { path: '/', label: 'Accueil' },
    { path: '/equipes', label: 'Équipes' },
    { path: '/animations', label: 'Événements' },

    { path: '/bar', label: 'Bar' },
    { path: '/contact', label: 'Contact' }
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenus}>
            <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">{siteSettings.siteName}</h1>
              <p className="text-sm text-gray-600">{siteSettings.siteSubtitle}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-[var(--primary-color)] bg-blue-50'
                : 'text-gray-700 hover:text-[var(--primary-color)] hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              to="/admin" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/admin')
                  ? 'text-[var(--primary-color)] bg-gradient-to-br from-blue-50 to-blue-100'
                  : 'text-gray-700 hover:text-[var(--primary-color)] hover:from-blue-50 hover:to-blue-100'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-[var(--primary-color)] transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user.email}
                  </span>
                  {userProfile?.role && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      userProfile.role === 'admin' ? 'bg-red-100 text-red-800' :
                      userProfile.role === 'responsable' ? 'bg-blue-100 text-blue-800' :
                      userProfile.role === 'membre' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userProfile.role}
                    </span>
                  )}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {isMembre() && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        Tableau de bord
                      </Link>
                    )}
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors duration-200"
              >
                Connexion
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-[var(--primary-color)] hover:bg-gray-100 transition-colors duration-200"
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-[var(--primary-color)] bg-gradient-to-br from-blue-50 to-blue-100'
                  : 'text-gray-700 hover:text-[var(--primary-color)] hover:from-blue-50 hover:to-blue-100'
                  }`}
                  onClick={closeMenus}
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                to="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/admin')
                    ? 'text-[var(--primary-color)] bg-blue-50'
                    : 'text-gray-700 hover:text-[var(--primary-color)] hover:bg-blue-50'
                }`} 
                onClick={closeMenus}
              >
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={closeMenus}
        />
      )}
    </header>
  )
}

export default Header