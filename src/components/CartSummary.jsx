import React, { useState } from 'react'
import { ShoppingCart, X, Plus, Minus, Trash2, User, CreditCard, Banknote } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import MemberAutocomplete from './MemberAutocomplete'
import { apiCall } from '../utils/apiCall'
import { toast } from 'sonner'

const CartSummary = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleOrder = () => {
    setShowPaymentModal(true)
  }

  const handleMemberPayment = async () => {
    if (!selectedMember) {
      toast.error('Veuillez sélectionner un membre')
      return
    }

    if (selectedMember.solde < total) {
      toast.error('Solde insuffisant pour cette commande')
      return
    }

    setIsProcessing(true)
    try {
      // Débiter le compte du membre
      await apiCall('/api/comptes-clients/debiter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          membreId: selectedMember.id,
          montantRaw: total.toString(),
          description: `Commande bar - ${items.map(item => `${item.quantity}x ${item.name}`).join(', ')}`,
          reference: `BAR-${Date.now()}`
        })
      })

      // Vider le panier et fermer les modals
      clearCart()
      setShowPaymentModal(false)
      setIsOpen(false)
      setSelectedMember(null)
      toast.success('Paiement effectué avec succès !')
    } catch (error) {
      console.error('Erreur lors du paiement:', error)
      toast.error('Erreur lors du paiement')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardPayment = () => {
    toast.info('Paiement par carte bancaire - Fonctionnalité à venir')
  }

  const handleCashPayment = () => {
    toast.info('Paiement en espèces - Fonctionnalité à venir')
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white p-4 rounded-full shadow-lg transition-colors duration-200 z-40"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[var(--primary-color)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Panier</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Votre panier est vide</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{parseFloat(item.price || 0).toFixed(2)}€</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total: {parseFloat(total || 0).toFixed(2)}€</span>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Vider le panier
                  </button>
                </div>
                
                <button 
                  onClick={handleOrder}
                  className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Commander
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 border-b">
              <h2 className="text-4xl font-bold text-gray-800">Choisir le mode de paiement</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedMember(null)
                }}
                className="absolute top-8 right-8 text-gray-500 hover:text-gray-700"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Payment Layout: Member Account on Left, Other Options on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Left Column: Member Account Payment */}
                <div className="space-y-4">
                  <div className="w-full p-6 text-left border-2 rounded-lg border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="text-2xl font-medium text-gray-800 mb-2">💳 Compte membre</div>
                    <div className="text-lg text-gray-600">Débiter le compte d'un membre</div>
                  </div>

                  <div className="space-y-4">
                    <MemberAutocomplete
                      onSelect={setSelectedMember}
                      selectedMember={selectedMember}
                      placeholder="Rechercher un membre..."
                    />
                    {selectedMember && (
                      <div className="p-6 bg-gray-50 rounded border-2 text-lg">
                        <div className="text-xl mb-2"><strong>{selectedMember.prenom} {selectedMember.nom}</strong></div>
                        <div className="mb-2">Email: {selectedMember.email}</div>
                        <div className={`text-xl font-medium ${selectedMember.solde >= total ? 'text-green-600' : 'text-red-600'}`}>
                          Solde: {parseFloat(selectedMember.solde || 0).toFixed(2)}€
                        </div>
                        <div className="text-xl font-medium text-gray-800 mt-2">
                          Total commande: {parseFloat(total || 0).toFixed(2)}€
                        </div>
                        {selectedMember.solde < total && (
                          <div className="mt-2 text-lg text-red-600">
                            ⚠️ Solde insuffisant
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Other Payment Options */}
                <div className="space-y-4">
                  {/* Card Payment */}
                  <div className="w-full p-6 text-left border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                    <div className="text-2xl font-medium text-gray-500 mb-2">💳 Carte bancaire</div>
                    <div className="text-lg text-gray-400">Bientôt disponible</div>
                  </div>

                  {/* Cash Payment */}
                  <div className="w-full p-6 text-left border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                    <div className="text-2xl font-medium text-gray-500 mb-2">💵 Espèces</div>
                    <div className="text-lg text-gray-400">Bientôt disponible</div>
                  </div>

                  {/* Bank Transfer Payment */}
                  <div className="w-full p-6 text-left border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                    <div className="text-2xl font-medium text-gray-500 mb-2">🏦 Virement</div>
                    <div className="text-lg text-gray-400">Bientôt disponible</div>
                  </div>

                  {/* Check Payment */}
                  <div className="w-full p-6 text-left border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                    <div className="text-2xl font-medium text-gray-500 mb-2">📝 Chèque</div>
                    <div className="text-lg text-gray-400">Bientôt disponible</div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t-2">
                <div className="flex justify-between items-center text-3xl font-bold">
                  <span>Total:</span>
                  <span>{parseFloat(total || 0).toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t-2 bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedMember(null)
                }}
                className="px-8 py-4 text-xl text-gray-600 border-2 border-gray-300 rounded hover:bg-gray-100"
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button
                onClick={handleMemberPayment}
                disabled={!selectedMember || selectedMember.solde < total || isProcessing}
                className={`px-10 py-4 text-xl rounded font-medium ${
                  selectedMember && selectedMember.solde >= total && !isProcessing
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CartSummary