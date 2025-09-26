/**
 * Routes de gestion des comptes clients
 * Gestion des crédits, débits et consultation des soldes des comptes clients
 */
import { Router, type Request, type Response } from 'express';
import mysql from 'mysql2/promise';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

// Rate limiting pour les opérations sur les comptes
const compteOperationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 opérations par minute
  message: {
    error: 'Trop d\'opérations sur les comptes. Réessayez dans 1 minute.',
    code: 'TOO_MANY_OPERATIONS'
  },
});

// Middleware pour vérifier les permissions de gestion des comptes
const canManageComptes = requireRole(['president', 'vice_president', 'tresorier']);

/**
 * POST /api/comptes-clients/crediter - Créditer un compte client
 */
router.post('/crediter', authenticateToken, canManageComptes, compteOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { membreId, montantRaw, description, reference } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;

    // Validation des données
    if (!membreId || !montantRaw) {
      return res.status(400).json({
        error: 'Membre ID et montant sont requis',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const montant = parseFloat(montantRaw);
    if (isNaN(montant) || montant <= 0) {
      return res.status(400).json({
        error: 'Le montant doit être un nombre positif',
        code: 'INVALID_AMOUNT'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();

      // Vérifier que le membre existe et appartient au club
      const [memberRows] = await connection.execute(
        'SELECT id, nom, prenom, solde FROM members WHERE id = ? AND club_id = ?',
        [membreId, clubId]
      );

      const members = memberRows as any[];
      if (members.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: 'Membre non trouvé dans ce club',
          code: 'MEMBER_NOT_FOUND'
        });
      }

      const membre = members[0];
      const ancienSolde = parseFloat(membre.solde || 0);
      const nouveauSolde = ancienSolde + montant;

      // Insérer l'opération dans la table comptes_clients
      const [insertResult] = await connection.execute(`
        INSERT INTO comptes_clients (
          membre_id, club_id, credit, solde, type_operation, 
          description, reference, created_by
        ) VALUES (?, ?, ?, ?, 'credit', ?, ?, ?)
      `, [membreId, clubId, montant, nouveauSolde, description || `Crédit de ${montant.toFixed(2)}€`, reference, userId]);

      // Mettre à jour le solde dans la table members
      await connection.execute(
        'UPDATE members SET solde = ? WHERE id = ?',
        [nouveauSolde, membreId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Compte de ${membre.prenom} ${membre.nom} crédité de ${montant.toFixed(2)}€`,
        data: {
          operationId: (insertResult as any).insertId,
          membreId: membreId,
          membreNom: `${membre.prenom} ${membre.nom}`,
          ancienSolde: ancienSolde.toFixed(2),
          montantCredite: montant.toFixed(2),
          nouveauSolde: nouveauSolde.toFixed(2),
          description: description || `Crédit de ${montant.toFixed(2)}€`,
          reference: reference || null
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Erreur lors du crédit du compte:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur lors du crédit',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/comptes-clients/debiter - Débiter un compte client
 */
router.post('/debiter', authenticateToken, canManageComptes, compteOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { membreId, montantRaw, description, reference } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;

    // Validation des données
    if (!membreId || !montantRaw) {
      return res.status(400).json({
        error: 'Membre ID et montant sont requis',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const montant = parseFloat(montantRaw);
    if (isNaN(montant) || montant <= 0) {
      return res.status(400).json({
        error: 'Le montant doit être un nombre positif',
        code: 'INVALID_AMOUNT'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();

      // Vérifier que le membre existe et appartient au club
      const [memberRows] = await connection.execute(
        'SELECT id, nom, prenom, solde FROM members WHERE id = ? AND club_id = ?',
        [membreId, clubId]
      );

      const members = memberRows as any[];
      if (members.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          error: 'Membre non trouvé dans ce club',
          code: 'MEMBER_NOT_FOUND'
        });
      }

      const membre = members[0];
      const ancienSolde = parseFloat(membre.solde || 0);
      const nouveauSolde = ancienSolde - montant;

      // Vérifier si le solde sera suffisant (optionnel - peut être désactivé selon les règles métier)
      if (nouveauSolde < 0) {
        await connection.rollback();
        return res.status(400).json({
          error: `Solde insuffisant. Solde actuel: ${ancienSolde.toFixed(2)}€, montant à débiter: ${montant.toFixed(2)}€`,
          code: 'INSUFFICIENT_BALANCE',
          data: {
            soldeActuel: ancienSolde.toFixed(2),
            montantDemande: montant.toFixed(2),
            soldeApresOperation: nouveauSolde.toFixed(2)
          }
        });
      }

      // Insérer l'opération dans la table comptes_clients
      const [insertResult] = await connection.execute(`
        INSERT INTO comptes_clients (
          membre_id, club_id, debit, solde, type_operation, 
          description, reference, created_by
        ) VALUES (?, ?, ?, ?, 'debit', ?, ?, ?)
      `, [membreId, clubId, montant, nouveauSolde, description || `Débit de ${montant.toFixed(2)}€`, reference, userId]);

      // Mettre à jour le solde dans la table members
      await connection.execute(
        'UPDATE members SET solde = ? WHERE id = ?',
        [nouveauSolde, membreId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Compte de ${membre.prenom} ${membre.nom} débité de ${montant.toFixed(2)}€`,
        data: {
          operationId: (insertResult as any).insertId,
          membreId: membreId,
          membreNom: `${membre.prenom} ${membre.nom}`,
          ancienSolde: ancienSolde.toFixed(2),
          montantDebite: montant.toFixed(2),
          nouveauSolde: nouveauSolde.toFixed(2),
          description: description || `Débit de ${montant.toFixed(2)}€`,
          reference: reference || null
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Erreur lors du débit du compte:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur lors du débit',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/comptes-clients/solde/:membreId - Consulter le solde d'un membre
 */
router.get('/solde/:membreId', authenticateToken, canManageComptes, async (req: Request, res: Response) => {
  try {
    const { membreId } = req.params;
    const clubId = req.user!.clubId;

    if (!membreId) {
      return res.status(400).json({
        error: 'Membre ID requis',
        code: 'MISSING_MEMBER_ID'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Utiliser la vue pour récupérer les informations complètes
      const [soldeRows] = await connection.execute(
        'SELECT * FROM vue_soldes_membres WHERE membre_id = ? AND club_id = ?',
        [membreId, clubId]
      );

      const soldes = soldeRows as any[];
      if (soldes.length === 0) {
        return res.status(404).json({
          error: 'Membre non trouvé dans ce club',
          code: 'MEMBER_NOT_FOUND'
        });
      }

      const solde = soldes[0];

      res.json({
        success: true,
        data: {
          membreId: solde.membre_id,
          nom: solde.nom,
          prenom: solde.prenom,
          email: solde.email,
          clubId: solde.club_id,
          soldeActuel: parseFloat(solde.solde_membre_table || 0).toFixed(2),
          totalCredits: parseFloat(solde.total_credits || 0).toFixed(2),
          totalDebits: parseFloat(solde.total_debits || 0).toFixed(2),
          soldeCalcule: parseFloat(solde.solde_calcule || 0).toFixed(2),
          nombreOperations: solde.nombre_operations || 0,
          derniereOperation: solde.derniere_operation
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Erreur lors de la consultation du solde:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur lors de la consultation',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/comptes-clients/historique/:membreId - Historique des opérations d'un membre
 */
router.get('/historique/:membreId', authenticateToken, canManageComptes, async (req: Request, res: Response) => {
  try {
    const { membreId } = req.params;
    const clubId = req.user!.clubId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!membreId) {
      return res.status(400).json({
        error: 'Membre ID requis',
        code: 'MISSING_MEMBER_ID'
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Vérifier que le membre existe et appartient au club
      const [memberRows] = await connection.execute(
        'SELECT id, nom, prenom FROM members WHERE id = ? AND club_id = ?',
        [membreId, clubId]
      );

      const members = memberRows as any[];
      if (members.length === 0) {
        return res.status(404).json({
          error: 'Membre non trouvé dans ce club',
          code: 'MEMBER_NOT_FOUND'
        });
      }

      const membre = members[0];

      // Récupérer l'historique des opérations
      const [operationRows] = await connection.query(`
        SELECT 
          cc.id,
          cc.debit,
          cc.credit,
          cc.solde,
          cc.type_operation,
          cc.description,
          cc.reference,
          cc.created_at,
          u.nom as created_by_nom,
          u.prenom as created_by_prenom
        FROM comptes_clients cc
        LEFT JOIN users u ON cc.created_by = u.id
        WHERE cc.membre_id = ? AND cc.club_id = ?
        ORDER BY cc.created_at DESC
        LIMIT ? OFFSET ?
      `, [membreId, clubId, limit, offset]);

      // Compter le total des opérations
      const [countRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM comptes_clients WHERE membre_id = ? AND club_id = ?',
        [membreId, clubId]
      );

      const operations = operationRows as any[];
      const total = (countRows as any[])[0].total;

      res.json({
        success: true,
        data: {
          membre: {
            id: membre.id,
            nom: membre.nom,
            prenom: membre.prenom
          },
          operations: operations.map(op => ({
            id: op.id,
            type: op.type_operation,
            montant: op.type_operation === 'credit' ? 
              parseFloat(op.credit || 0).toFixed(2) : 
              parseFloat(op.debit || 0).toFixed(2),
            soldeApres: parseFloat(op.solde || 0).toFixed(2),
            description: op.description,
            reference: op.reference,
            dateOperation: op.created_at,
            operateurNom: op.created_by_nom ? `${op.created_by_prenom} ${op.created_by_nom}` : null
          })),
          pagination: {
            total: total,
            limit: limit,
            offset: offset,
            hasMore: (offset + limit) < total
          }
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur lors de la récupération de l\'historique',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * GET /api/comptes-clients/liste - Liste des soldes de tous les membres
 */
router.get('/liste', authenticateToken, canManageComptes, async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Récupérer la liste des soldes via la vue
      const [soldeRows] = await connection.query(`
        SELECT * FROM vue_soldes_membres 
        WHERE club_id = ?
        ORDER BY nom, prenom
        LIMIT ? OFFSET ?
      `, [clubId, limit, offset]);

      // Compter le total des membres
      const [countRows] = await connection.execute(
        'SELECT COUNT(*) as total FROM members WHERE club_id = ?',
        [clubId]
      );

      const soldes = soldeRows as any[];
      const total = (countRows as any[])[0].total;

      res.json({
        success: true,
        data: {
          membres: soldes.map(solde => ({
            membreId: solde.membre_id,
            nom: solde.nom,
            prenom: solde.prenom,
            email: solde.email,
            soldeActuel: parseFloat(solde.solde_membre_table || 0).toFixed(2),
            totalCredits: parseFloat(solde.total_credits || 0).toFixed(2),
            totalDebits: parseFloat(solde.total_debits || 0).toFixed(2),
            soldeCalcule: parseFloat(solde.solde_calcule || 0).toFixed(2),
            nombreOperations: solde.nombre_operations || 0,
            derniereOperation: solde.derniere_operation
          })),
          pagination: {
            total: total,
            limit: limit,
            offset: offset,
            hasMore: (offset + limit) < total
          }
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des soldes:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur lors de la récupération de la liste',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

export default router;