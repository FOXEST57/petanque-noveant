import express, { Request, Response } from 'express';
import { getDrinks, createDrink, updateDrink, deleteDrink } from '../../src/lib/database.js';

const router = express.Router();

// GET /api/drinks - Récupérer toutes les boissons
router.get('/', async (req: Request, res: Response) => {
  try {
    const drinks = await getDrinks();
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Erreur lors de la récupération des boissons:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/drinks - Créer une nouvelle boisson
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, description, image_url, stock } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le nom et le prix sont requis' 
      });
    }

    // Nettoyer les données pour éviter les valeurs undefined
    const cleanData = {
      name,
      price,
      description: description !== undefined ? description : null,
      image_url: image_url !== undefined ? image_url : null,
      stock: stock !== undefined ? stock : null
    };

    const result = await createDrink(cleanData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la création de la boisson:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/drinks/:id - Mettre à jour une boisson
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, image_url, stock } = req.body;
    
    // Nettoyer les données pour éviter les valeurs undefined
    const cleanData = {
      name: name !== undefined ? name : null,
      price: price !== undefined ? price : null,
      description: description !== undefined ? description : null,
      image_url: image_url !== undefined ? image_url : null,
      stock: stock !== undefined ? stock : null
    };
    
    const result = await updateDrink(parseInt(id), cleanData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la boisson:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// DELETE /api/drinks/:id - Supprimer une boisson
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteDrink(parseInt(id));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la suppression de la boisson:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;