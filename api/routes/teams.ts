import express, { type Request, type Response } from 'express';
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const teamData = req.body;
    
    // Validation des données requises
    if (!teamData.name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom de l\'équipe est requis'
      });
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teamData = req.body;
    
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

export default router;