import React from 'react'
import { useCart } from '../contexts/CartContext'

const DrinkCard = ({ drink }) => {
  const { addItem, items } = useCart()

  const handleAddToCart = () => {
    addItem(drink)
  }

  // Trouver la quantité de cette boisson dans le panier
  const itemInCart = items.find(item => item.id === drink.id)
  const quantity = itemInCart ? itemInCart.quantity : 0

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={handleAddToCart}
    >
      {/* Image Section */}
      <div className="h-48 overflow-hidden">
        <img 
          src={drink.image_url ? `/${drink.image_url}` : (drink.image ? `/${drink.image}` : null)} 
          alt={drink.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center'
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{drink.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{drink.description}</p>
        
        {/* Price and Counter - Aligned at bottom */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-2xl font-bold text-[var(--primary-color)]">
            {parseFloat(drink.price || 0).toFixed(2)}€
          </div>
          {quantity > 0 && (
            <div className="bg-[var(--primary-color)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {quantity}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DrinkCard