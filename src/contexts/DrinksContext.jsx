import React, { createContext, useContext, useState, useEffect } from 'react';
import { drinksAPI } from '../api/drinks.js';

const DrinksContext = createContext();

export const useDrinks = () => {
  const context = useContext(DrinksContext);
  if (!context) {
    throw new Error('useDrinks must be used within a DrinksProvider');
  }
  return context;
};

export const DrinksProvider = ({ children }) => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les boissons depuis la base de données
  useEffect(() => {
    const loadDrinks = async () => {
      try {
        const response = await drinksAPI.getAll();
        console.log('🔍 Drinks API Response:', response);
        
        // Vérifier si la réponse a une structure avec data
        const drinksData = response?.data || response;
        
        // S'assurer que c'est un tableau
        if (Array.isArray(drinksData)) {
          setDrinks(drinksData);
        } else {
          console.warn('⚠️ Drinks data is not an array:', drinksData);
          setDrinks([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des boissons:', error);
        // En cas d'erreur, laisser la liste vide
        setDrinks([]);
      } finally {
        setLoading(false);
      }
    };
    loadDrinks();
  }, []);

  const addDrink = async (drinkData) => {
    try {
      const newDrink = await drinksAPI.create(drinkData);
      // Recharger les données depuis la base
      const response = await drinksAPI.getAll();
      const drinksData = response?.data || response;
      
      if (Array.isArray(drinksData)) {
        setDrinks(drinksData);
      } else {
        console.warn('⚠️ Drinks data is not an array after add:', drinksData);
        setDrinks([]);
      }
      return newDrink;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la boisson:', error);
      throw error;
    }
  };

  const updateDrink = async (drinkId, drinkData) => {
    try {
      console.log('=== DEBUG CONTEXT UPDATE DRINK ===');
      console.log('DrinkId:', drinkId);
      console.log('DrinkData:', drinkData);
      
      await drinksAPI.update(drinkId, drinkData);
      
      console.log('API update successful, reloading drinks...');
      // Recharger les données depuis la base
      const response = await drinksAPI.getAll();
      const drinksData = response?.data || response;
      
      if (Array.isArray(drinksData)) {
        setDrinks(drinksData);
        console.log('Updated drinks loaded:', drinksData.length, 'items');
      } else {
        console.warn('⚠️ Drinks data is not an array after update:', drinksData);
        setDrinks([]);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la boisson:', error);
      throw error;
    }
  };

  const deleteDrink = async (drinkId) => {
    try {
      await drinksAPI.delete(drinkId);
      // Recharger les données depuis la base
      const response = await drinksAPI.getAll();
      const drinksData = response?.data || response;
      
      if (Array.isArray(drinksData)) {
        setDrinks(drinksData);
      } else {
        console.warn('⚠️ Drinks data is not an array after delete:', drinksData);
        setDrinks([]);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la boisson:', error);
      throw error;
    }
  };

  const adjustStock = (drinkId, change) => {
    setDrinks(drinks.map(d => 
      d.id === drinkId 
        ? { ...d, stock: Math.max(0, d.stock + change) }
        : d
    ));
  };

  const value = {
    drinks,
    loading,
    addDrink,
    updateDrink,
    deleteDrink,
    adjustStock
  };

  return (
    <DrinksContext.Provider value={value}>
      {children}
    </DrinksContext.Provider>
  );
};