import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDrinks, createDrink, updateDrink, deleteDrink } from '../../src/lib/database.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Ensure uploads/drinks directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'drinks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}_${random}${extension}`;
};

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
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { name, price, description, stock } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le nom et le prix sont requis' 
      });
    }

    // Nettoyer les données pour éviter les valeurs undefined
    const cleanData: any = {
      name,
      price,
      description: description !== undefined ? description : null,
      stock: stock !== undefined ? stock : null
    };

    // Handle photo upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      cleanData.image_url = `uploads/drinks/${filename}`;
    }

    const result = await createDrink(cleanData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la création de la boisson:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/drinks/:id - Mettre à jour une boisson
router.put('/:id', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;
    
    // Nettoyer les données pour éviter les valeurs undefined
    const cleanData: any = {};
    
    if (name !== undefined && name !== null && name !== '') cleanData.name = name;
    if (price !== undefined && price !== null) cleanData.price = price;
    if (description !== undefined && description !== null) cleanData.description = description;
    if (stock !== undefined && stock !== null) cleanData.stock = stock;
    
    // Handle photo upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      cleanData.image_url = `uploads/drinks/${filename}`;
    }
    
    // Check if there are any fields to update
    if (Object.keys(cleanData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun champ valide à mettre à jour'
      });
    }
    
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