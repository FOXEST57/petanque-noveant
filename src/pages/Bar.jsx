import { ShoppingCart, Coffee, Wine, Zap } from 'lucide-react'
import DrinkCard from '../components/DrinkCard'
import CartSummary from '../components/CartSummary'
import { useDrinks } from '../contexts/DrinksContext'

export default function Bar() {
  const { drinks } = useDrinks();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#425e9b] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Bar du Club</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Venez vous détendre et partager un moment convivial dans notre bar après vos parties de pétanque
            </p>
          </div>
        </div>
      </div>

      {/* Drinks Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Boissons</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de boissons pour accompagner vos moments de détente
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
          </div>
        </div>
      </div>

      {/* Bon à savoir Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Bon à savoir :</strong> Le bar est accessible aux membres du club et à leurs invités. 
                Pensez à réserver pour les groupes de plus de 10 personnes !
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cart Summary */}
      <CartSummary />
    </div>
  )
}