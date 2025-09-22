import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getCarouselImages, 
  getAllCarouselImages, 
  getCarouselImageById, 
  addCarouselImage, 
  updateCarouselImage, 
  updateCarouselImageOrder, 
  deleteCarouselImage 
} from '../../src/lib/database.js';
import { authenticateToken, canManageEvents, ensureClubAccess } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for carousel images
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  }
});

// Ensure uploads/carousel directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'carousel');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `carousel_${timestamp}_${random}${extension}`;
};

// GET /api/carousel - Récupérer toutes les images actives du carrousel (requires authentication and club access)
router.get('/', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const clubId = (req as any).user?.club_id || 1;
    const images = await getCarouselImages(clubId);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Erreur lors de la récupération des images du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/carousel/all - Récupérer toutes les images du carrousel (actives et inactives) (requires authentication and club access)
router.get('/all', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const clubId = (req as any).user?.club_id || 1;
    const images = await getAllCarouselImages(clubId);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les images du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/carousel/:id - Récupérer une image spécifique (requires authentication and club access)
router.get('/:id', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clubId = (req as any).user?.club_id || 1;
    const image = await getCarouselImageById(parseInt(id), clubId);
    
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image non trouvée' });
    }
    
    res.json({ success: true, data: image });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/carousel - Ajouter une nouvelle image au carrousel (requires authentication and management permissions)
router.post('/', authenticateToken, canManageEvents, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, display_order, is_active } = req.body;
    const clubId = (req as any).user?.club_id || 1;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Une image est requise' 
      });
    }

    // Generate unique filename and save file
    const filename = generateUniqueFilename(req.file.originalname);
    const uploadPath = path.join(uploadsDir, filename);
    
    // Save file to disk
    await fs.promises.writeFile(uploadPath, req.file.buffer);
    
    // Prepare data for database
    const imageData: any = {
      title: title || '',
      image_url: `uploads/carousel/${filename}`,
      is_active: is_active !== undefined ? is_active === 'true' : true
    };
    
    // Only set display_order if explicitly provided
    if (display_order !== undefined && display_order !== null && display_order !== '') {
      imageData.display_order = parseInt(display_order);
    }

    const result = await addCarouselImage(imageData, clubId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'image du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/carousel/:id - Mettre à jour une image du carrousel (requires authentication and management permissions)
router.put('/:id', authenticateToken, canManageEvents, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, display_order, is_active } = req.body;
    const clubId = (req as any).user?.club_id || 1;
    
    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (display_order !== undefined) updateData.display_order = parseInt(display_order);
    if (is_active !== undefined) updateData.is_active = is_active === 'true';
    
    // Handle image upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      updateData.image_url = `uploads/carousel/${filename}`;
    }
    
    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun champ valide à mettre à jour'
      });
    }
    
    const result = await updateCarouselImage(parseInt(id), updateData, clubId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'image du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/carousel/:id/order - Mettre à jour l'ordre d'affichage d'une image (requires authentication and management permissions)
router.put('/:id/order', authenticateToken, canManageEvents, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;
    const clubId = (req as any).user?.club_id || 1;
    
    if (display_order === undefined) {
      return res.status(400).json({
        success: false,
        error: 'L\'ordre d\'affichage est requis'
      });
    }
    
    const result = await updateCarouselImageOrder(parseInt(id), parseInt(display_order), clubId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// DELETE /api/carousel/:id - Supprimer une image du carrousel (requires authentication and management permissions)
router.delete('/:id', authenticateToken, canManageEvents, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clubId = (req as any).user?.club_id || 1;
    
    // Get image info before deletion to remove file
    const image = await getCarouselImageById(parseInt(id), clubId);
    
    const result = await deleteCarouselImage(parseInt(id), clubId);
    
    // Remove file from disk if it exists
    if (image && image.image_url) {
      const filePath = path.join(process.cwd(), image.image_url);
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (fileError) {
        console.warn('Erreur lors de la suppression du fichier:', fileError);
        // Continue even if file deletion fails
      }
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;