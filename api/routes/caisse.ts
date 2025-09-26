/**
 * Routes de gestion de la caisse du club
 * Gestion des encaissements, crédits de comptes membres, transferts et fond de caisse
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

// Rate limiting pour les opérations de caisse
const caisseOperationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 opérations par minute
  message: {
    error: 'Trop d\'opérations de caisse. Réessayez dans 1 minute.',
    code: 'TOO_MANY_OPERATIONS'
  },
});

// Middleware pour vérifier les permissions de gestion de caisse
const canManageCaisse = requireRole(['president', 'vice_president', 'tresorier']);

/**
 * GET /api/caisse/fond - Récupérer le fond de caisse
 */
router.get('/fond', authenticateToken, canManageCaisse, async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // Récupérer le fond de caisse actuel
      const [rows] = await connection.execute(
        'SELECT fond_caisse FROM clubs WHERE id = ?',
        [clubId]
      );
      
      const club = rows as any[];
      const fondCaisse = club.length > 0 ? (club[0].fond_caisse || 0) : 0;
      
      res.json({
        success: true,
        fond: fondCaisse
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du fond de caisse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du fond de caisse'
    });
  }
});

/**
 * PUT /api/caisse/fond - Modifier le fond de caisse (ajouter/retirer)
 */
router.put('/fond', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { operation, montant } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;
    
    if (!operation || !montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Opération et montant valide requis'
      });
    }
    
    if (!['ajouter', 'retirer'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: 'Opération invalide (ajouter ou retirer)'
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();
      
      // Récupérer le fond actuel
      const [rows] = await connection.execute(
        'SELECT fond_caisse FROM clubs WHERE id = ?',
        [clubId]
      );
      
      const club = rows as any[];
      const fondActuel = club.length > 0 ? (club[0].fond_caisse || 0) : 0;
      
      let nouveauFond;
      if (operation === 'ajouter') {
        nouveauFond = fondActuel + montant;
      } else {
        nouveauFond = fondActuel - montant;
        if (nouveauFond < 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Fond de caisse insuffisant'
          });
        }
      }
      
      // Mettre à jour le fond de caisse
      await connection.execute(
        'UPDATE clubs SET fond_caisse = ? WHERE id = ?',
        [nouveauFond, clubId]
      );
      
      // Enregistrer l'opération dans l'historique
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, type_operation, montant, description, date_operation)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          'fond',
          operation === 'ajouter' ? montant : -montant,
          `${operation === 'ajouter' ? 'Ajout' : 'Retrait'} de ${montant}€ ${operation === 'ajouter' ? 'au' : 'du'} fond de caisse`
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Fond de caisse ${operation === 'ajouter' ? 'augmenté' : 'diminué'} de ${montant}€`,
        nouveauFond: nouveauFond
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors de la modification du fond de caisse:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du fond de caisse'
    });
  }
});

/**
 * POST /api/caisse/crediter-membre - Créditer le compte d'un membre ET la caisse (espèces)
 */
router.post('/crediter-membre', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { membreId, montant } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;
    
    if (!membreId || !montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID membre et montant valide requis'
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
          success: false,
          error: 'Membre non trouvé'
        });
      }
      
      const membre = members[0];
      const nouveauSolde = (membre.solde || 0) + montant;
      
      // Mettre à jour le solde du membre
      await connection.execute(
        'UPDATE members SET solde = ? WHERE id = ?',
        [nouveauSolde, membreId]
      );
      
      // Récupérer le fond de caisse actuel
      const [clubRows] = await connection.execute(
        'SELECT fond_caisse FROM clubs WHERE id = ?',
        [clubId]
      );
      
      const clubs = clubRows as any[];
      const fondActuel = clubs.length > 0 ? (clubs[0].fond_caisse || 0) : 0;
      const nouveauFondCaisse = fondActuel + montant;
      
      // Mettre à jour le fond de caisse (ajout d'espèces)
      await connection.execute(
        'UPDATE clubs SET fond_caisse = ? WHERE id = ?',
        [nouveauFondCaisse, clubId]
      );
      
      // Enregistrer l'opération dans l'historique - Crédit membre
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          membreId,
          'credit',
          montant,
          `Crédit de ${montant}€ sur le compte de ${membre.prenom} ${membre.nom}`
        ]
      );
      
      // Enregistrer l'opération dans l'historique - Ajout espèces caisse
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          null,
          'ajout_especes',
          montant,
          `Ajout de ${montant}€ en espèces à la caisse (crédit membre ${membre.prenom} ${membre.nom})`
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Compte de ${membre.prenom} ${membre.nom} crédité de ${montant}€ et caisse créditée de ${montant}€ en espèces`,
        nouveauSolde: nouveauSolde,
        nouveauFondCaisse: nouveauFondCaisse
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors du crédit du compte membre:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du crédit du compte membre'
    });
  }
});

/**
 * POST /api/caisse/transfert - Effectuer un transfert entre caisse et compte membre
 */
router.post('/transfert', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { membreId, montant, type } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;
    
    if (!membreId || !montant || montant <= 0 || !type) {
      return res.status(400).json({
        success: false,
        error: 'ID membre, montant valide et type de transfert requis'
      });
    }
    
    if (!['caisse-vers-compte', 'compte-vers-caisse'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transfert invalide'
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();
      
      // Récupérer les informations du membre et du club
      const [memberRows] = await connection.execute(
        'SELECT id, nom, prenom, solde FROM members WHERE id = ? AND club_id = ?',
        [membreId, clubId]
      );
      
      const [clubRows] = await connection.execute(
        'SELECT fond_caisse FROM clubs WHERE id = ?',
        [clubId]
      );
      
      const members = memberRows as any[];
      const clubs = clubRows as any[];
      
      if (members.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Membre non trouvé'
        });
      }
      
      const membre = members[0];
      const fondCaisse = clubs.length > 0 ? (clubs[0].fond_caisse || 0) : 0;
      
      let nouveauSoldeMembre, nouveauFondCaisse, description;
      
      if (type === 'caisse-vers-compte') {
        // Vérifier que la caisse a suffisamment de fonds
        if (fondCaisse < montant) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Fond de caisse insuffisant'
          });
        }
        
        nouveauSoldeMembre = (membre.solde || 0) + montant;
        nouveauFondCaisse = fondCaisse - montant;
        description = `Transfert de ${montant}€ de la caisse vers le compte de ${membre.prenom} ${membre.nom}`;
      } else {
        // Vérifier que le membre a suffisamment de solde
        if ((membre.solde || 0) < montant) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Solde membre insuffisant'
          });
        }
        
        nouveauSoldeMembre = (membre.solde || 0) - montant;
        nouveauFondCaisse = fondCaisse + montant;
        description = `Transfert de ${montant}€ du compte de ${membre.prenom} ${membre.nom} vers la caisse`;
      }
      
      // Mettre à jour le solde du membre
      await connection.execute(
        'UPDATE members SET solde = ? WHERE id = ?',
        [nouveauSoldeMembre, membreId]
      );
      
      // Mettre à jour le fond de caisse
      await connection.execute(
        'UPDATE clubs SET fond_caisse = ? WHERE id = ?',
        [nouveauFondCaisse, clubId]
      );
      
      // Enregistrer l'opération dans l'historique
      const montantHistorique = type === 'caisse-vers-compte' ? montant : -montant;
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          membreId,
          'transfert',
          montantHistorique,
          description
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: description,
        nouveauSoldeMembre: nouveauSoldeMembre,
        nouveauFondCaisse: nouveauFondCaisse
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors du transfert:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du transfert'
    });
  }
});

/**
 * GET /api/caisse/historique - Récupérer l'historique des opérations de caisse
 */
router.get('/historique', authenticateToken, canManageCaisse, async (req: Request, res: Response) => {
  try {
    const clubId = req.user!.clubId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        `SELECT 
          ch.*,
          u.nom as user_nom, u.prenom as user_prenom,
          m.nom as membre_nom, m.prenom as membre_prenom
         FROM caisse_historique ch
         LEFT JOIN members u ON ch.user_id = u.id
         LEFT JOIN members m ON ch.membre_id = m.id
         WHERE ch.club_id = ?
         ORDER BY ch.date_operation DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [clubId]
      );
      
      const historique = (rows as any[]).map(row => ({
        id: row.id,
        type: row.type_operation,
        montant: row.montant,
        description: row.description,
        date: row.date_operation,
        utilisateur: `${row.user_prenom} ${row.user_nom}`,
        membre: row.membre_nom ? `${row.membre_prenom} ${row.membre_nom}` : null
      }));
      
      res.json({
        success: true,
        historique: historique
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

export default router;