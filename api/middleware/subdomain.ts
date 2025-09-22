import { Request, Response, NextFunction } from 'express';
import * as mysql from 'mysql2/promise';

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

// Extension de l'interface Request pour inclure clubId
declare global {
  namespace Express {
    interface Request {
      clubId?: number;
    }
  }
}

/**
 * Middleware de détection de sous-domaine pour l'isolation des clubs
 * Détecte le sous-domaine et définit req.clubId en conséquence
 */
export const detectSubdomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.get('host') || req.hostname;
    console.log('🔍 Hostname détecté:', hostname);

    // Extraire le sous-domaine
    let subdomain = null;
    
    if (hostname.includes('localhost')) {
      // Mode développement: demo.localhost:5174
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        subdomain = parts[0];
      }
    } else if (hostname.includes('petanque-club.fr')) {
      // Mode production: demo.petanque-club.fr
      const parts = hostname.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    console.log('🔍 Sous-domaine détecté:', subdomain);

    if (subdomain) {
      // Rechercher le club correspondant au sous-domaine
      const connection = await mysql.createConnection(dbConfig);
      
      try {
        const [rows] = await connection.execute(
          'SELECT id FROM clubs WHERE subdomain = ?',
          [subdomain]
        ) as [any[], any];

        if (rows.length > 0) {
          req.clubId = rows[0].id;
          console.log('✅ Club ID défini:', req.clubId, 'pour le sous-domaine:', subdomain);
        } else {
          console.log('⚠️ Aucun club trouvé pour le sous-domaine:', subdomain);
          // Par défaut, utiliser le club 1 si aucun club n'est trouvé
          req.clubId = 1;
        }
      } finally {
        await connection.end();
      }
    } else {
      // Pas de sous-domaine détecté, utiliser le club par défaut
      req.clubId = 1;
      console.log('🔍 Pas de sous-domaine, utilisation du club par défaut:', req.clubId);
    }

    next();
  } catch (error) {
    console.error('❌ Erreur dans le middleware de détection de sous-domaine:', error);
    // En cas d'erreur, utiliser le club par défaut
    req.clubId = 1;
    next();
  }
};

/**
 * Middleware pour s'assurer que les données sont filtrées par club
 * À utiliser après detectSubdomain et authenticateToken
 */
export const enforceClubIsolation = (req: Request, res: Response, next: NextFunction) => {
  // Si l'utilisateur est authentifié, vérifier que son club correspond au sous-domaine
  if (req.user && req.clubId && req.user.clubId !== req.clubId) {
    console.log('⚠️ Tentative d\'accès cross-club détectée:', {
      userClubId: req.user.clubId,
      requestedClubId: req.clubId,
      subdomain: req.get('host')
    });
    
    return res.status(403).json({
      error: 'Accès refusé: vous ne pouvez accéder qu\'aux données de votre club',
      code: 'CLUB_ISOLATION_VIOLATION'
    });
  }

  next();
};