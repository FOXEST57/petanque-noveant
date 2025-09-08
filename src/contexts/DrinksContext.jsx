import React, { createContext, useContext, useState, useEffect } from 'react';
import { drinksAPI } from '../lib/api';

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
        const drinksData = await drinksAPI.getAll();
        setDrinks(drinksData);
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
      const updatedDrinks = await drinksAPI.getAll();
      setDrinks(updatedDrinks);
      return newDrink;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la boisson:', error);
      throw error;
    }
  };

  const updateDrink = async (drinkId, drinkData) => {
    try {
      await drinksAPI.update(drinkId, drinkData);
      // Recharger les données depuis la base
      const updatedDrinks = await drinksAPI.getAll();
      setDrinks(updatedDrinks);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la boisson:', error);
      throw error;
    }
  };

  const deleteDrink = async (drinkId) => {
    try {
      await drinksAPI.delete(drinkId);
      // Recharger les données depuis la base
      const updatedDrinks = await drinksAPI.getAll();
      setDrinks(updatedDrinks);
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