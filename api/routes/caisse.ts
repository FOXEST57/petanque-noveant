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
      // Récupérer le fond de caisse depuis la nouvelle table fond_caisse
      const [rows] = await connection.execute(
        'SELECT solde FROM fond_caisse WHERE id_club = ?',
        [clubId]
      );
      
      const fondCaisse = rows as any[];
      const solde = fondCaisse.length > 0 ? (fondCaisse[0].solde || 0) : 0;
      
      res.json({
        success: true,
        fond: solde
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
 * POST /api/caisse/crediter-membre - Créditer le compte d'un membre ET la caisse (espèces)
 */
router.post('/crediter-membre', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { membreId, montant: montantRaw } = req.body;
    const montant = parseFloat(montantRaw);
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
      const nouveauSolde = parseFloat(membre.solde || 0) + montant;
      
      // Mettre à jour le solde du membre
      await connection.execute(
        'UPDATE members SET solde = ? WHERE id = ?',
        [nouveauSolde, membreId]
      );
      
      // NOTE: Le crédit membre ne doit PAS affecter le fond de caisse
      // Le fond de caisse ne doit être modifié que par les transferts bancaires
      // Les crédits membres sont des recettes qui s'ajoutent au solde total
      
      // Enregistrer l'opération de crédit membre dans la table dédiée
      await connection.execute(
        `INSERT INTO membre_comptes_historique (club_id, user_id, membre_id, type_operation, montant, solde_avant, solde_apres, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          membreId,
          'credit',
          montant,
          membre.solde || 0,
          nouveauSolde,
          `Crédit de ${montant}€ sur le compte`
        ]
      );
      
      // Enregistrer l'encaissement comme recette dans le journal de caisse
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant_encaissement, montant_retrait, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          membreId, // Garder la référence au membre pour traçabilité
          'recette_credit_membre',
          montant,
          0,
          `Recette crédit membre ${membre.prenom} ${membre.nom} - ${montant}€`
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Compte de ${membre.prenom} ${membre.nom} crédité de ${montant}€ (recette enregistrée)`,
        nouveauSolde: nouveauSolde.toFixed(2)
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
      
      const [fondCaisseRows] = await connection.execute(
        'SELECT solde FROM fond_caisse WHERE id_club = ?',
        [clubId]
      );
      
      const members = memberRows as any[];
      const fondCaisseData = fondCaisseRows as any[];
      
      if (members.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Membre non trouvé'
        });
      }
      
      const membre = members[0];
      const fondCaisse = fondCaisseData.length > 0 ? (fondCaisseData[0].solde || 0) : 0;
      
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
        'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
        [nouveauFondCaisse, clubId]
      );
      
      // Enregistrer l'opération dans l'historique des comptes membres
      const typeOperationMembre = type === 'caisse-vers-compte' ? 'transfert_recu' : 'transfert_envoye';
      const montantMembre = type === 'caisse-vers-compte' ? montant : -montant;
      
      await connection.execute(
        `INSERT INTO membre_comptes_historique (club_id, user_id, membre_id, type_operation, montant, solde_avant, solde_apres, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          membreId,
          typeOperationMembre,
          montantMembre,
          membre.solde || 0,
          nouveauSoldeMembre,
          type === 'caisse-vers-compte' 
            ? `Transfert reçu de la caisse: ${montant}€`
            : `Transfert envoyé vers la caisse: ${montant}€`
        ]
      );
      
      // Enregistrer seulement l'opération de caisse dans le journal
      if (type === 'caisse-vers-compte') {
        await connection.execute(
          `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant_encaissement, montant_retrait, description, date_operation)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            clubId,
            userId,
            null, // Pas de membre_id pour les opérations de caisse
            'retrait_especes',
            0,
            montant,
            `Retrait de ${montant}€ (transfert vers ${membre.prenom} ${membre.nom})`
          ]
        );
      } else {
        await connection.execute(
          `INSERT INTO caisse_historique (club_id, user_id, membre_id, type_operation, montant_encaissement, montant_retrait, description, date_operation)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            clubId,
            userId,
            null, // Pas de membre_id pour les opérations de caisse
            'ajout_especes',
            montant,
            0,
            `Ajout de ${montant}€ (transfert de ${membre.prenom} ${membre.nom})`
          ]
        );
      }
      
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
 * POST /api/caisse/depense-especes - Enregistrer une dépense en espèces
 */
router.post('/depense-especes', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { montant, description } = req.body;
    const clubId = req.user!.clubId;
    const userId = req.user!.id;
    
    if (!montant || montant <= 0 || !description) {
      return res.status(400).json({
        success: false,
        error: 'Montant valide et description requis'
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();
      
      // Récupérer le fond de caisse actuel
      const [rows] = await connection.execute(
        'SELECT solde FROM fond_caisse WHERE id_club = ?',
        [clubId]
      );
      
      const fondCaisseData = rows as any[];
      const fondActuel = fondCaisseData.length > 0 ? (fondCaisseData[0].solde || 0) : 0;
      
      // Vérifier que la caisse a suffisamment de fonds
      if (fondActuel < montant) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Fond de caisse insuffisant'
        });
      }
      
      const nouveauFond = fondActuel - montant;
      
      // Mettre à jour le fond de caisse
      await connection.execute(
        'UPDATE fond_caisse SET solde = ? WHERE id_club = ?',
        [nouveauFond, clubId]
      );
      
      // Enregistrer l'opération dans l'historique
      await connection.execute(
        `INSERT INTO caisse_historique (club_id, user_id, type_operation, montant_encaissement, montant_retrait, description, date_operation)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          clubId,
          userId,
          'depense_especes',
          0,
          montant,
          description
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: `Dépense de ${montant}€ enregistrée`,
        nouveauFond: nouveauFond
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la dépense:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la dépense'
    });
  }
});

/**
  * GET /api/caisse/solde - Calculer le solde de caisse et les recettes
  */
 router.get('/solde', authenticateToken, canManageCaisse, async (req: Request, res: Response) => {
   try {
     const clubId = req.user!.clubId;
     console.log('🔍 Calcul du solde pour le club:', clubId);
     console.log('🔍 Utilisateur:', req.user);
     
     if (!clubId) {
       console.error('❌ Club ID manquant dans la requête');
       return res.status(400).json({
         success: false,
         error: 'Club non identifié. Veuillez vous reconnecter.'
       });
     }
     
     const connection = await mysql.createConnection(dbConfig);
     
     try {
       // Récupérer le solde du fond de caisse depuis fond_caisse_operations
       const [operationsFondRows] = await connection.execute(
         `SELECT 
           COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
           COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
          FROM fond_caisse_operations 
          WHERE id_club = ?`,
         [clubId]
       );
       
       const operationsFond = operationsFondRows as any[];
       const totalCredits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_credits) : 0;
       const totalDebits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_debits) : 0;
       
       // Le fond de caisse = total crédits - total débits des opérations de fond
       const fondCaisse = totalCredits - totalDebits;
       console.log('💰 Fond de caisse (calculé depuis fond_caisse_operations):', fondCaisse);
       
       // Calculer le total des recettes depuis caisse_historique (encaissements - retraits)
       const [operationsRows] = await connection.execute(
         `SELECT 
           COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
           COALESCE(SUM(montant_retrait), 0) as total_retraits
          FROM caisse_historique 
          WHERE club_id = ?`,
         [clubId]
       );
       
       const operations = operationsRows as any[];
       console.log('📈 Données opérations caisse_historique:', operations);
       
       const totalEncaissementsRaw = operations.length > 0 ? operations[0].total_encaissements : 0;
       const totalRetraitsRaw = operations.length > 0 ? operations[0].total_retraits : 0;
       
       const totalEncaissements = parseFloat(totalEncaissementsRaw) || 0;
       const totalRetraits = parseFloat(totalRetraitsRaw) || 0;
       
       console.log('💵 Total encaissements (recettes):', totalEncaissements);
       console.log('💸 Total retraits (recettes):', totalRetraits);
       
       // Calculer le solde de caisse et les recettes
       // Solde de caisse = fond de caisse + recettes nettes
       const recettes = totalEncaissements - totalRetraits;
       const soldeCaisse = fondCaisse + recettes;
       
       console.log('🧮 Calculs finaux:', {
         fondCaisse,
         soldeCaisse,
         recettes,
         totalEncaissements,
         totalRetraits
       });
       
       res.json({
         success: true,
         fondCaisse: Number(fondCaisse.toFixed(2)),
         soldeCaisse: Number(soldeCaisse.toFixed(2)),
         recettes: Number(recettes.toFixed(2)),
         totalEncaissements: Number(totalEncaissements.toFixed(2)),
         totalRetraits: Number(totalRetraits.toFixed(2))
       });
     } finally {
       await connection.end();
     }
   } catch (error) {
     console.error('❌ Erreur lors du calcul du solde de caisse:', error);
     res.status(500).json({
       success: false,
       error: 'Erreur lors du calcul du solde de caisse'
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
        montant_encaissement: row.montant_encaissement || 0,
        montant_retrait: row.montant_retrait || 0,
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

/**
 * POST /api/caisse/transfert-bancaire - Effectuer un transfert bancaire
 */
router.post('/transfert-bancaire', authenticateToken, canManageCaisse, caisseOperationLimiter, async (req: Request, res: Response) => {
  try {
    const { banqueId, type } = req.body;
    const montant = parseFloat(req.body.montant);
    const clubId = req.user!.clubId;
    const userId = req.user!.id;
    
    if (!banqueId || !montant || montant <= 0 || !type) {
      return res.status(400).json({
        success: false,
        error: 'Banque, montant valide et type de transfert requis'
      });
    }
    
    if (!['caisse-vers-banque', 'banque-vers-caisse'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type de transfert invalide'
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      await connection.beginTransaction();
      
      // Vérifier que la banque appartient au club
      const [banqueRows] = await connection.execute(
        'SELECT nom FROM banque WHERE id = ? AND club_id = ?',
        [banqueId, clubId]
      );
      
      const banques = banqueRows as any[];
      if (banques.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Banque non trouvée'
        });
      }
      
      const nomBanque = banques[0].nom;
      
      // Récupérer le fond de caisse actuel depuis la nouvelle table fond_caisse
       const [fondCaisseRows] = await connection.execute(
         'SELECT solde FROM fond_caisse WHERE id_club = ?',
         [clubId]
       );
       
       const fondCaisseData = fondCaisseRows as any[];
       const fondActuel = fondCaisseData.length > 0 ? parseFloat(fondCaisseData[0].solde || 0) : 0;
      
      let nouveauFondCaisse: number;
      let description: string;
      let typeOperation: string;
      
      if (type === 'caisse-vers-banque') {
        // Calculer les recettes actuelles (différence entre solde total et fond de caisse)
        const [operationsRows] = await connection.execute(
          `SELECT 
            COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
            COALESCE(SUM(montant_retrait), 0) as total_retraits
           FROM caisse_historique 
           WHERE club_id = ?`,
          [clubId]
        );
        
        const operations = operationsRows as any[];
        const totalEncaissements = operations.length > 0 ? parseFloat(operations[0].total_encaissements) : 0;
        const totalRetraits = operations.length > 0 ? parseFloat(operations[0].total_retraits) : 0;
        const soldeCaisse = fondActuel + totalEncaissements - totalRetraits;
        const recettes = soldeCaisse - fondActuel;
        
        // Vérifier que la caisse a suffisamment de fonds (solde total)
        if (soldeCaisse < montant) {
          return res.status(400).json({
            success: false,
            error: 'Fonds insuffisants dans la caisse'
          });
        }
        
        // Logique de retrait : d'abord les recettes, puis le fond de caisse
        if (recettes >= montant) {
          // On peut retirer entièrement des recettes, le fond de caisse ne change pas
          nouveauFondCaisse = fondActuel;
          description = `Transfert vers ${nomBanque} (sur recettes)`;
          
          // Enregistrer l'opération dans caisse_historique (retrait de recettes)
          await connection.execute(
            'INSERT INTO caisse_historique (club_id, type_operation, montant_retrait, description, banque_id, user_id, date_operation) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [clubId, 'retrait', montant, description, banqueId, userId]
          );
          
        } else {
          // On retire toutes les recettes et le reste du fond de caisse
          const montantSurFond = montant - recettes;
          nouveauFondCaisse = fondActuel - montantSurFond;
          
          if (recettes > 0) {
            description = `Transfert vers ${nomBanque} (${recettes.toFixed(2)}€ sur recettes, ${montantSurFond.toFixed(2)}€ sur fond)`;
            
            // Enregistrer l'opération sur les recettes dans caisse_historique
            await connection.execute(
              'INSERT INTO caisse_historique (club_id, type_operation, montant_retrait, description, banque_id, user_id, date_operation) VALUES (?, ?, ?, ?, ?, ?, NOW())',
              [clubId, 'retrait', recettes, `Transfert vers ${nomBanque} (sur recettes)`, banqueId, userId]
            );
            
            // Enregistrer l'opération sur le fond de caisse dans fond_caisse_operations
            await connection.execute(
              'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, banque_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
              [clubId, 'debit', montantSurFond, `Transfert vers ${nomBanque} (sur fond de caisse)`, banqueId, userId]
            );
            
          } else {
            description = `Transfert vers ${nomBanque} (sur fond de caisse)`;
            
            // Enregistrer uniquement l'opération sur le fond de caisse
            await connection.execute(
              'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, banque_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
              [clubId, 'debit', montant, description, banqueId, userId]
            );
          }
        }
        
        typeOperation = 'debit';
      } else {
        // Transfert banque vers caisse : augmenter le fond de caisse uniquement
        nouveauFondCaisse = fondActuel + montant;
        description = `Transfert depuis ${nomBanque}`;
        typeOperation = 'credit';
        
        // Enregistrer l'opération dans fond_caisse_operations
        await connection.execute(
          'INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, banque_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [clubId, 'credit', montant, description, banqueId, userId]
        );
      }
      
      // Recalculer le solde du fond de caisse à partir de toutes les opérations
      const [operationsFondRows] = await connection.execute(
        `SELECT 
          COALESCE(SUM(CASE WHEN type_operation = 'credit' THEN montant ELSE 0 END), 0) as total_credits,
          COALESCE(SUM(CASE WHEN type_operation = 'debit' THEN montant ELSE 0 END), 0) as total_debits
         FROM fond_caisse_operations 
         WHERE id_club = ?`,
        [clubId]
      );
      
      const operationsFond = operationsFondRows as any[];
      const totalCredits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_credits) : 0;
      const totalDebits = operationsFond.length > 0 ? parseFloat(operationsFond[0].total_debits) : 0;
      
      // Le nouveau solde du fond = total crédits - total débits
      nouveauFondCaisse = totalCredits - totalDebits;
      
      // Mettre à jour le solde dans la table fond_caisse (pour compatibilité)
      await connection.execute(
        'UPDATE fond_caisse SET solde = ?, date_modification = NOW() WHERE id_club = ?',
        [nouveauFondCaisse, clubId]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: description,
        nouveauFondCaisse: nouveauFondCaisse.toFixed(2)
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Erreur lors du transfert bancaire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du transfert bancaire'
    });
  }
});

export default router;