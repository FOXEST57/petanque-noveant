import express, { type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { initDatabase, getMembers, createMember, updateMember, deleteMember, getMemberTypes, createMemberType, updateMemberType, deleteMemberType } from '../../src/lib/database.js';
import { authenticateToken, canManageMembers, ensureClubAccess } from '../middleware/auth.js';

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

// Ensure uploads/members directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'members');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database connection
const init = async () => {
  try {
    await initDatabase();
    console.log('Database initialized for members API');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Initialize database on module load
init();

// GET /api/members/search - Search members for autocomplete (requires authentication and club isolation)
router.get('/search', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const { q } = req.query;
    
    console.log('🔍 API Search - Club ID:', clubId);
    console.log('🔍 API Search - Query:', q);
    
    let members = await getMembers(clubId);
    console.log('🔍 API Search - Total members from DB:', members.length);
    
    // Si une requête de recherche est fournie, filtrer les résultats
    if (q && typeof q === 'string' && q.length >= 2) {
      const searchTerm = q.toLowerCase();
      console.log('🔍 API Search - Search term:', searchTerm);
      
      members = members.filter((member: any) => {
        const matchPrenom = member.prenom?.toLowerCase().includes(searchTerm);
        const matchNom = member.nom?.toLowerCase().includes(searchTerm);
        const matchSurnom = member.surnom?.toLowerCase().includes(searchTerm);
        const matchEmail = member.email?.toLowerCase().includes(searchTerm);
        
        const isMatch = matchPrenom || matchNom || matchSurnom || matchEmail;
        
        if (isMatch) {
          console.log('🔍 API Search - Match found:', {
            id: member.id,
            prenom: member.prenom,
            nom: member.nom,
            surnom: member.surnom,
            matchPrenom,
            matchNom,
            matchSurnom,
            matchEmail
          });
        }
        
        return isMatch;
      });
    }
    
    console.log('🔍 API Search - Filtered members count:', members.length);
    
    // Limiter les résultats pour les performances
    const limitedMembers = members.slice(0, 20);
    
    res.json({ 
      success: true, 
      members: limitedMembers.map((member: any) => ({
        id: member.id,
        prenom: member.prenom,
        nom: member.nom,
        surnom: member.surnom,
        email: member.email,
        solde: member.solde_compte || member.solde || 0
      }))
    });
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la recherche des membres' 
    });
  }
});

// GET /api/members - Get all members (requires authentication and club isolation)
router.get('/', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const members = await getMembers(clubId);
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
});

// POST /api/members - Create new member (requires authentication and management permissions)
router.post('/', authenticateToken, canManageMembers, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const memberData = req.body;
    const clubId = req.user!.clubId;
    
    // Validate required fields
    if (!memberData.nom || !memberData.prenom) {
      return res.status(400).json({
        success: false,
        error: 'Nom and prenom are required'
      });
    }

    // Handle photo upload if present
    let photoPath = null;
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      photoPath = path.join(uploadsDir, filename);
      
      // Save the file
      fs.writeFileSync(photoPath, req.file.buffer);
      memberData.photo_url = `uploads/members/${filename}`; // Utiliser le chemin complet comme dans PUT
    }

    const result = await createMember(memberData, clubId);
    
    res.status(201).json({
      success: true,
      data: { id: result.id, ...memberData }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create member'
    });
  }
});

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}_${random}${extension}`;
};

// PUT /api/members/:id - Update member (requires authentication and management permissions)
router.put('/:id', authenticateToken, canManageMembers, upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const memberId = parseInt(req.params.id);
    const memberData = req.body;
    const clubId = req.user!.clubId;
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member ID'
      });
    }

    // Handle photo upload if present
    if (req.file) {
      const filename = generateUniqueFilename(req.file.originalname);
      const uploadPath = path.join(uploadsDir, filename);
      
      // Save file to disk
      await fs.promises.writeFile(uploadPath, req.file.buffer);
      
      // Store relative path in database
      memberData.photo_url = `uploads/members/${filename}`;
    }

    const result = await updateMember(memberId, memberData, clubId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      data: { id: memberId, ...memberData }
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member'
    });
  }
});

// DELETE /api/members/:id - Delete member (requires authentication and management permissions)
router.delete('/:id', authenticateToken, canManageMembers, async (req: Request, res: Response) => {
  try {
    const memberId = parseInt(req.params.id);
    const clubId = req.user!.clubId;
    
    if (isNaN(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member ID'
      });
    }
    
    const result = await deleteMember(memberId, clubId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete member'
    });
  }
});

// GET /api/members/photos/:filename - Serve member photos
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
    console.error('Error serving member photo:', error);
    res.status(500).json({ error: 'Failed to serve photo' });
  }
});

// GET /api/members/types - Get member types (requires authentication and club isolation)
router.get('/types', authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const types = await getMemberTypes(clubId);
    res.json({
        success: true,
        data: types
      });
  } catch (error) {
    console.error('Error fetching member types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member types'
    });
  }
});

// Create member type
router.post('/types', async (req: Request, res: Response) => {
  try {
    const { nom, description, droits } = req.body;
    if (!nom) {
      return res.status(400).json({
        success: false,
        error: 'Nom is required'
      });
    }
    const newType = await createMemberType({ nom, description, droits });
    res.status(201).json({
      success: true,
      data: newType
    });
  } catch (error) {
    console.error('Error creating member type:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update member type
router.put('/types/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, description, droits } = req.body;
    if (!nom) {
      return res.status(400).json({
        success: false,
        error: 'Nom is required'
      });
    }
    const updatedType = await updateMemberType(parseInt(id), { nom, description, droits });
    if (!updatedType) {
      return res.status(404).json({
        success: false,
        error: 'Member type not found'
      });
    }
    res.json({
      success: true,
      data: updatedType
    });
  } catch (error) {
    console.error('Error updating member type:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/members/types/:id - Delete member type
router.delete('/types/:id', async (req: Request, res: Response) => {
  try {
    const typeId = parseInt(req.params.id);
    
    if (isNaN(typeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member type ID'
      });
    }
    
    const result = await deleteMemberType(typeId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member type not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete member type'
    });
  }
});

// GET /api/members/count - Get total number of members
router.get('/count', async (req: Request, res: Response) => {
  try {
    const members = await getMembers();
    res.json({
      success: true,
      data: { count: members.length }
    });
  } catch (error) {
    console.error('Error getting members count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get members count'
    });
  }
});

export default router;