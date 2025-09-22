import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getHomeContent, 
  updateHomeContent, 
  getHomeCarouselImages,
  addHomeCarouselImage, 
  deleteHomeCarouselImage,
  updateHomeCarouselImageOrder,
  updateHomeCarouselImageTitle 
} from '../../src/lib/database.js';

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
      cb(new Error('Only image files are allowed') as any, false);
    }
  }
});

// Ensure uploads/home-carousel directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'home-carousel');
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

// GET /api/home-content - Récupérer le contenu de la page d'accueil
router.get('/', async (req: Request, res: Response) => {
  try {
    // Récupérer le club_id depuis l'utilisateur authentifié ou utiliser 1 par défaut pour l'endpoint public
    const clubId = (req as any).user?.clubId || 1;
    
    const content = await getHomeContent(clubId);
    const carouselImages = await getHomeCarouselImages(clubId);
    
    // Mapper les champs pour le frontend
    const responseData = {
      title: content.title,
      description: content.description,
      openingHours: content.schedules,
      contact: content.contact,
      practicalInfo: content.practical_info,
      location: content.location,
      members: content.members,
      clubTitle: content.club_title,
      clubDescription: content.club_description,
      teamsContent: content.teams_content,
      animationsContent: content.animations_content,
      tournamentsContent: content.tournaments_content,
      carouselImages: carouselImages
    };
    
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu de la page d\'accueil:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/home-content - Mettre à jour le contenu de la page d'accueil
router.put('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Récupérer le club_id depuis l'utilisateur authentifié
    const clubId = (req as any).user?.clubId;
    
    if (!clubId) {
      return res.status(400).json({ success: false, error: 'Club ID manquant' });
    }
    
    const {
      title,
      description,
      openingHours,
      contact,
      practicalInfo,
      location,
      members,
      clubTitle,
      clubDescription,
      teamsContent,
      animationsContent,
      tournamentsContent,
      carouselImages
    } = req.body;

    // Mapper les champs frontend vers les champs de la base de données
    const contentData = {
      title,
      description,
      schedules: openingHours,
      contact,
      practical_info: practicalInfo,
      location,
      members,
      club_title: clubTitle,
      club_description: clubDescription,
      teams_content: teamsContent,
      animations_content: animationsContent,
      tournaments_content: tournamentsContent
    };

    // Mettre à jour le contenu principal
    await updateHomeContent(contentData, clubId);

    // Gérer les images du carrousel
    if (carouselImages && Array.isArray(carouselImages)) {
      // Récupérer les images existantes
      const existingImages = await getHomeCarouselImages(clubId);
      const existingIds = existingImages.map(img => img.id);
      
      // Supprimer les images qui ne sont plus dans la liste
      const newImageIds = carouselImages
        .filter(img => img.id)
        .map(img => img.id);
      
      for (const existingId of existingIds) {
        if (!newImageIds.includes(existingId)) {
          await deleteHomeCarouselImage(existingId, clubId);
        }
      }
      
      // Mettre à jour l'ordre et les titres des images existantes, ajouter les nouvelles
      for (let i = 0; i < carouselImages.length; i++) {
        const image = carouselImages[i];
        
        if (image.id) {
          // Image existante - mettre à jour l'ordre et le titre
          await updateHomeCarouselImageOrder(image.id, i + 1, clubId);
          if (image.title !== undefined) {
            await updateHomeCarouselImageTitle(image.id, image.title, clubId);
          }
        } else if (image.image_url) {
          // Nouvelle image - l'ajouter
          await addHomeCarouselImage({
            image_url: image.image_url,
            display_order: i + 1,
            title: image.title || ''
          }, clubId);
        }
      }
    }

    // Récupérer les données mises à jour
    const updatedContent = await getHomeContent(clubId);
    const updatedCarouselImages = await getHomeCarouselImages(clubId);
    
    const responseData = {
      title: updatedContent.title,
      description: updatedContent.description,
      openingHours: updatedContent.schedules,
      contact: updatedContent.contact,
      practicalInfo: updatedContent.practical_info,
      location: updatedContent.location,
      members: updatedContent.members,
      clubTitle: updatedContent.club_title,
      clubDescription: updatedContent.club_description,
      teamsContent: updatedContent.teams_content,
      animationsContent: updatedContent.animations_content,
      tournamentsContent: updatedContent.tournaments_content,
      carouselImages: updatedCarouselImages
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu de la page d\'accueil:', error);
    res.status(500).json({ success: false, error: 'Server internal error' });
  }
});

// GET /api/home-content/carousel - Récupérer les images du carrousel
router.get('/carousel', async (req: Request, res: Response) => {
  try {
    const images = await getHomeCarouselImages();
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Erreur lors de la récupération des images du carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST /api/home-content/carousel - Ajouter une image au carrousel
router.post('/carousel', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucune image fournie' 
      });
    }

    const filename = generateUniqueFilename(req.file.originalname);
    const uploadPath = path.join(uploadsDir, filename);
    
    // Save file to disk
    await fs.promises.writeFile(uploadPath, req.file.buffer);
    
    // Store relative path in database
    const imageUrl = `uploads/home-carousel/${filename}`;
    
    // Laisser addHomeCarouselImage calculer automatiquement la position
    const result = await addHomeCarouselImage({
      image_url: imageUrl
      // display_order sera calculé automatiquement par la fonction addHomeCarouselImage
    });

    // Récupérer l'image nouvellement créée pour obtenir le display_order correct
    const newImage = await getHomeCarouselImages();
    const createdImage = newImage.find(img => img.id === result.lastID);
    
    res.status(201).json({ 
      success: true, 
      data: { 
        id: result.lastID, 
        image_url: imageUrl, 
        display_order: createdImage ? createdImage.display_order : 0
      } 
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'image au carrousel:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// DELETE /api/home-content/carousel/:id - Supprimer une image du carrousel
router.delete('/carousel/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'image pour supprimer le fichier physique
    const images = await getHomeCarouselImages();
    const image = images.find(img => img.id === parseInt(id));
    
    if (image && image.image_url) {
      const filePath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await deleteHomeCarouselImage(parseInt(id));
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Image non trouvée' 
      });
    }

    res.json({ success: true, message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PUT /api/home-content/carousel/:id/order - Mettre à jour l'ordre d'une image
router.put('/carousel/:id/order', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (displayOrder === undefined || displayOrder === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'L\'ordre d\'affichage est requis' 
      });
    }

    const result = await updateHomeCarouselImageOrder(parseInt(id), parseInt(displayOrder));
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Image non trouvée' 
      });
    }

    res.json({ success: true, message: 'Ordre mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;