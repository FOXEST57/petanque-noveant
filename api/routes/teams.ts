import express, { type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getTeams, 
  getTeamById, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole
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

// Ensure uploads/teams directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'teams');
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

// GET /api/teams - Récupérer toutes les équipes
router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await getTeams();
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des équipes'
    });
  }
});

// GET /api/teams/:id - Récupérer une équipe par ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await getTeamById(parseInt(id));
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'équipe'
    });
  }
});

// POST /api/teams - Créer une nouvelle équipe
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const teamData = req.body;
    
    // Validation des données requises
    if (!teamData.name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom de l\'équipe est requis'
      });
    }
    
    // Handle photo upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      teamData.photo_url = `uploads/teams/${filename}`;
    }
    
    const result = await createTeam(teamData);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        ...teamData
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'équipe'
    });
  }
});

// PUT /api/teams/:id - Mettre à jour une équipe
router.put('/:id', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Debug logging
    console.log('PUT /api/teams/:id - req.body:', req.body);
    console.log('PUT /api/teams/:id - req.file:', req.file ? 'File present' : 'No file');
    
    // Extract and validate team data, filtering out undefined values
    const { name, category, description, competition } = req.body;
    const teamData: any = {};
    
    if (name !== undefined && name !== null && name !== '') teamData.name = name;
    if (category !== undefined && category !== null) teamData.category = category || '';
    if (description !== undefined && description !== null) teamData.description = description || '';
    if (competition !== undefined && competition !== null) teamData.competition = competition || '';
    
    console.log('PUT /api/teams/:id - teamData before photo:', teamData);
    
    // Handle photo upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      teamData.photo_url = `uploads/teams/${filename}`;
    }
    
    console.log('PUT /api/teams/:id - final teamData:', teamData);
    console.log('PUT /api/teams/:id - teamData keys:', Object.keys(teamData));
    
    // Check if there are any fields to update
    if (Object.keys(teamData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun champ valide à mettre à jour'
      });
    }
    
    const result = await updateTeam(parseInt(id), teamData);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        ...teamData
      }
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'équipe'
    });
  }
});

// DELETE /api/teams/:id - Supprimer une équipe
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await deleteTeam(parseInt(id));
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Équipe supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'équipe'
    });
  }
});

// GET /api/teams/:id/members - Récupérer les membres d'une équipe
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const members = await getTeamMembers(parseInt(id));
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des membres de l\'équipe'
    });
  }
});

// POST /api/teams/:id/members - Ajouter un membre à une équipe
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { memberId, role } = req.body;
    
    if (!memberId) {
      return res.status(400).json({
        success: false,
        error: 'L\'ID du membre est requis'
      });
    }
    
    const result = await addTeamMember(parseInt(id), memberId, role || 'membre');
    
    res.status(201).json({
      success: true,
      data: {
        teamId: parseInt(id),
        memberId,
        role: role || 'membre'
      }
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout du membre à l\'équipe'
    });
  }
});

// DELETE /api/teams/:teamId/members/:memberId - Retirer un membre d'une équipe
router.delete('/:teamId/members/:memberId', async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    
    const result = await removeTeamMember(parseInt(teamId), parseInt(memberId));
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé dans cette équipe'
      });
    }
    
    res.json({
      success: true,
      message: 'Membre retiré de l\'équipe avec succès'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du retrait du membre de l\'équipe'
    });
  }
});

// PUT /api/teams/:teamId/members/:memberId - Mettre à jour le rôle d'un membre
router.put('/:teamId/members/:memberId', async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Le rôle est requis'
      });
    }
    
    const result = await updateTeamMemberRole(parseInt(teamId), parseInt(memberId), role);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Membre non trouvé dans cette équipe'
      });
    }
    
    res.json({
      success: true,
      data: {
        teamId: parseInt(teamId),
        memberId: parseInt(memberId),
        role
      }
    });
  } catch (error) {
    console.error('Error updating team member role:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du rôle du membre'
    });
  }
});

// GET /api/teams/photos/:filename - Servir les photos d'équipes
router.get('/photos/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error serving team photo:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

export default router;