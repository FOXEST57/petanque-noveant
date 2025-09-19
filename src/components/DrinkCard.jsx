import React from 'react'
import { Plus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'

const DrinkCard = ({ drink }) => {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(drink)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="h-48 overflow-hidden">
        <img 
          src={drink.image_url || drink.image} 
          alt={drink.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center'
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{drink.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{drink.description}</p>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[var(--primary-color)]">
            {parseFloat(drink.price || 0).toFixed(2)}€
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-var(--primary-color) hover:bg-var(--primary-dark) text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrinkCard