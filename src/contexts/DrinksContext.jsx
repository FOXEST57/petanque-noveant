import React, { createContext, useContext, useState } from 'react';
import { drinks as initialDrinks } from '../data/drinks';

const DrinksContext = createContext();

export const useDrinks = () => {
  const context = useContext(DrinksContext);
  if (!context) {
    throw new Error('useDrinks must be used within a DrinksProvider');
  }
  return context;
};

export const DrinksProvider = ({ children }) => {
  const [drinks, setDrinks] = useState(
    initialDrinks.map(drink => ({ ...drink, stock: 50 }))
  );

  const addDrink = (drinkData) => {
    const newDrink = {
      ...drinkData,
      id: Math.max(...drinks.map(d => d.id)) + 1,
      stock: drinkData.stock || 50
    };
    setDrinks([...drinks, newDrink]);
    return newDrink;
  };

  const updateDrink = (drinkId, drinkData) => {
    setDrinks(drinks.map(d => 
      d.id === drinkId ? { ...d, ...drinkData } : d
    ));
  };

  const deleteDrink = (drinkId) => {
    setDrinks(drinks.filter(d => d.id !== drinkId));
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