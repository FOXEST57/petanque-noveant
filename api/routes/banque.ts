import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getBanques,
  getBanqueById,
  createBanque,
  updateBanque,
  deleteBanque,
  getBanquePrincipale
} from '../../src/api/banque.ts';

const router = Router();

// Middleware pour vérifier les permissions de gestion des banques
const canManageBanques = requireRole(['president', 'vice_president', 'tresorier']);

// Routes pour la gestion des banques
router.get('/', authenticateToken, canManageBanques, getBanques);
router.get('/principale', authenticateToken, canManageBanques, getBanquePrincipale);
router.get('/:id', authenticateToken, canManageBanques, getBanqueById);
router.post('/', authenticateToken, canManageBanques, createBanque);
router.put('/:id', authenticateToken, canManageBanques, updateBanque);
router.delete('/:id', authenticateToken, canManageBanques, deleteBanque);

export default router;