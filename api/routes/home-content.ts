import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
    const content = await getHomeContent();
    const carouselImages = await getHomeCarouselImages();
    
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
router.put('/', upload.array('carouselImages', 10), async (req: Request, res: Response) => {
  try {
    const { title, description, openingHours, contact, practicalInfo, location, members, clubTitle, clubDescription, teamsContent, animationsContent, tournamentsContent, existingImages } = req.body;
    
    // Construire l'objet de données pour la mise à jour
    const contentData: any = {};
    
    // Mapper les champs du frontend vers la base de données
    if (title !== undefined) contentData.title = title;
    if (description !== undefined) contentData.description = description;
    if (openingHours !== undefined) contentData.schedules = openingHours;
    if (contact !== undefined) contentData.contact = contact;
    if (practicalInfo !== undefined) contentData.practical_info = practicalInfo;
    if (location !== undefined) contentData.location = location;
    if (members !== undefined) contentData.members = members;
    if (clubTitle !== undefined) contentData.club_title = clubTitle;
    if (clubDescription !== undefined) contentData.club_description = clubDescription;
    if (teamsContent !== undefined) contentData.teams_content = teamsContent;
    if (animationsContent !== undefined) contentData.animations_content = animationsContent;
    if (tournamentsContent !== undefined) contentData.tournaments_content = tournamentsContent;

    // Mettre à jour le contenu principal s'il y a des champs à modifier
    let updatedContent = null;
    if (Object.keys(contentData).length > 0) {
      updatedContent = await updateHomeContent(contentData);
    }

    // Gérer les images du carrousel
    let carouselImages = [];
    
    // Traiter les images existantes (ne supprimer que si explicitement demandé)
    if (existingImages) {
      try {
        const existingImagesArray = JSON.parse(existingImages);
        // Récupérer toutes les images actuelles
        const currentImages = await getHomeCarouselImages();
        
        // Supprimer seulement les images qui ont été explicitement supprimées par l'utilisateur
        for (const currentImage of currentImages) {
          const stillExists = existingImagesArray.find(img => img.id === currentImage.id);
          if (!stillExists) {
            // Supprimer le fichier physique
            const filePath = path.join(process.cwd(), currentImage.image_url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            // Supprimer de la base de données
            await deleteHomeCarouselImage(currentImage.id);
          }
        }
        
        // Mettre à jour l'ordre et les titres des images existantes si nécessaire
        for (const existingImg of existingImagesArray) {
          const currentImg = currentImages.find(img => img.id === existingImg.id);
          
          if (existingImg.display_order !== undefined) {
            await updateHomeCarouselImageOrder(existingImg.id, existingImg.display_order);
          }
          
          // Vérifier si le titre a changé
          if (existingImg.title !== undefined && currentImg && existingImg.title !== currentImg.title) {
            await updateHomeCarouselImageTitle(existingImg.id, existingImg.title);
            console.log(`Titre mis à jour pour l'image ${existingImg.id}: ${existingImg.title}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement des images existantes:', error);
      }
    }
    
    // Ajouter les nouvelles images
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const filename = generateUniqueFilename(file.originalname);
        const uploadPath = path.join(uploadsDir, filename);
        
        // Sauvegarder le fichier
        await fs.promises.writeFile(uploadPath, file.buffer);
        
        // Ajouter à la base de données - laisser addHomeCarouselImage calculer automatiquement display_order
        const imageUrl = `uploads/home-carousel/${filename}`;
        await addHomeCarouselImage({
          image_url: imageUrl
          // display_order sera calculé automatiquement par la fonction addHomeCarouselImage
        });
      }
    }
    
    // Récupérer les données mises à jour
    const finalContent = await getHomeContent();
    carouselImages = await getHomeCarouselImages();
    
    // Mapper les champs de retour pour le frontend
    const responseData = {
      title: finalContent.title,
      description: finalContent.description,
      openingHours: finalContent.schedules,
      contact: finalContent.contact,
      practicalInfo: finalContent.practical_info,
      location: finalContent.location,
      members: finalContent.members,
      clubTitle: finalContent.club_title,
      clubDescription: finalContent.club_description,
      teamsContent: finalContent.teams_content,
      animationsContent: finalContent.animations_content,
      tournamentsContent: finalContent.tournaments_content,
      carouselImages: carouselImages
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contenu de la page d\'accueil:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde' });
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