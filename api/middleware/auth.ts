import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as mysql from 'mysql2/promise';

// Interface pour les données utilisateur dans le token JWT
interface JWTPayload {
  userId?: number;
  id?: number; // Support des anciens tokens
  clubId?: number;
  email: string;
  role: string;
  isSuperAdmin?: boolean;
}

// Extension de l'interface Request pour inclure les données utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        clubId: number;
        email: string;
        role: string;
        nom: string;
        prenom: string;
      };
    }
  }
}

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT et charge les informations utilisateur
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'authentification requis',
        code: 'NO_TOKEN' 
      });
    }

    // Vérifier le token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET non configuré');
      return res.status(500).json({ 
        error: 'Erreur de configuration du serveur',
        code: 'JWT_CONFIG_ERROR' 
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Vérifier que userId existe dans le token
    const userId = decoded.userId || decoded.id; // Support des anciens tokens avec 'id'
    if (!userId) {
      console.error('Token invalide - userId manquant:', decoded);
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'INVALID_TOKEN' 
      });
    }

    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        `SELECT id, club_id, nom, prenom, email, role, statut 
         FROM users 
         WHERE id = ? AND statut = 'actif'`,
        [userId]
      );

      const users = rows as any[];
      if (users.length === 0) {
        return res.status(401).json({ 
          error: 'Utilisateur non trouvé ou inactif',
          code: 'USER_NOT_FOUND' 
        });
      }

      const user = users[0];

      // Ajouter les informations utilisateur à la requête
      // Pour les super admins, utiliser le clubId du token (sélection temporaire)
      // Pour les utilisateurs normaux, utiliser le club_id de la base de données
      req.user = {
        id: user.id,
        clubId: decoded.clubId || user.club_id, // Priorité au clubId du token
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom
      };

      next();
    } finally {
      await connection.end();
    }

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'INVALID_TOKEN' 
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED' 
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR' 
    });
  }
};

/**
 * Middleware pour vérifier les rôles autorisés
 * @param allowedRoles - Liste des rôles autorisés
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur peut valider les demandes d'adhésion
 * Seuls le président et le vice-président peuvent valider
 */
export const canApproveMembership = requireRole(['president', 'vice_president']);

/**
 * Middleware pour vérifier que l'utilisateur peut gérer les membres
 * Président, vice-président, secrétaire et trésorier peuvent gérer
 */
export const canManageMembers = requireRole(['president', 'vice_president', 'secretaire', 'tresorier']);

/**
 * Middleware pour vérifier que l'utilisateur peut gérer les événements
 * Tous les rôles sauf invité peuvent gérer les événements
 */
export const canManageEvents = requireRole(['president', 'vice_president', 'secretaire', 'tresorier', 'membre']);

/**
 * Middleware pour vérifier que l'utilisateur peut gérer les équipes
 * Président, vice-président, secrétaire et trésorier peuvent gérer
 */
export const canManageTeams = requireRole(['president', 'vice_president', 'secretaire', 'tresorier']);

/**
 * Middleware pour vérifier que l'utilisateur peut gérer les boissons
 * Président, vice-président, secrétaire et trésorier peuvent gérer
 */
export const canManageDrinks = requireRole(['president', 'vice_president', 'secretaire', 'tresorier']);

/**
 * Middleware pour vérifier que l'utilisateur peut accéder aux données d'administration
 * Seuls président, vice-président, secrétaire et trésorier ont accès
 */
export const requireAdminAccess = requireRole(['president', 'vice_president', 'secretaire', 'tresorier']);

/**
 * Middleware pour s'assurer que l'utilisateur accède uniquement aux données de son club
 * @param clubIdParam - Nom du paramètre contenant l'ID du club (optionnel)
 */
export const ensureClubAccess = (clubIdParam?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED' 
      });
    }

    // Si un paramètre de club est spécifié, vérifier qu'il correspond au club de l'utilisateur
    if (clubIdParam) {
      const requestedClubId = parseInt(req.params[clubIdParam]);
      if (requestedClubId && requestedClubId !== req.user.clubId) {
        return res.status(403).json({ 
          error: 'Accès refusé aux données d\'un autre club',
          code: 'CLUB_ACCESS_DENIED' 
        });
      }
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification
 * Charge les informations utilisateur si un token est présent, mais n'échoue pas s'il n'y en a pas
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Pas de token, continuer sans authentification
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(); // Pas de configuration JWT, continuer sans authentification
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(
        `SELECT id, club_id, nom, prenom, email, role, statut 
         FROM users 
         WHERE id = ? AND statut = 'actif'`,
        [decoded.userId]
      );

      const users = rows as any[];
      if (users.length > 0) {
        const user = users[0];
        req.user = {
          id: user.id,
          clubId: user.club_id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom
        };
      }
    } finally {
      await connection.end();
    }

    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};