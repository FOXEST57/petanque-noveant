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

    // Extraire le sous-domaine
    let subdomain = null;
    
    // Vérifier d'abord s'il y a un header X-Club-Subdomain (pour les tests et API)
    const headerSubdomain = req.get('X-Club-Subdomain') as string;
    
    // Vérifier ensuite s'il y a un paramètre club dans l'URL (pour le développement)
    const clubParam = req.query.club as string;
    
    if (headerSubdomain) {
      // Mode test/API avec header X-Club-Subdomain
      subdomain = headerSubdomain;
      console.log('🎯 Sous-domaine détecté via header X-Club-Subdomain:', headerSubdomain);
    } else if (clubParam) {
      // Mode développement avec paramètre club
      subdomain = clubParam;
    } else if (hostname && hostname.includes('localhost')) {
      // Mode développement: demo.localhost:5174
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'localhost') {
        subdomain = parts[0];
      }
    } else if (hostname && hostname.includes('petanque-club.fr')) {
      // Mode production: demo.petanque-club.fr
      const parts = hostname.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

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
          console.log('🎯 Club détecté via paramètre/sous-domaine:', subdomain, 'ID:', req.clubId);
        } else {
          // Pour les requêtes API, retourner une erreur JSON au lieu de rediriger
          if (req.path.startsWith('/api/')) {
            return res.status(404).json({
              success: false,
              error: 'Club non trouvé pour ce sous-domaine'
            });
          }
          // Rediriger vers la page de recherche de clubs pour les autres requêtes
          return res.redirect('/club-finder');
        }
      } finally {
        await connection.end();
      }
      
      // Si un club a été trouvé, continuer avec ce club
      return next();
    } else {
      // Pas de sous-domaine détecté - Redirection vers la page d'entrée
      // Pour les routes API publiques, on continue sans clubId
      if (req.path.startsWith('/auth') || req.path.startsWith('/health') || req.path.startsWith('/clubs')) {
        return next();
      }
      
      // Pour les autres routes API, on retourne une erreur
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(400).json({
          success: false,
          error: 'Club non identifié. Veuillez accéder via un sous-domaine valide.'
        });
      }
      
      // Pour toutes les autres routes, rediriger vers le club finder
      console.log('🚪 Aucun sous-domaine détecté - Redirection vers la page d\'entrée');
      return res.redirect('/club-finder');
    }

    next();
  } catch (error) {
    console.error('❌ Erreur dans le middleware de détection de sous-domaine:', error);
    // Pour les requêtes API, retourner une erreur JSON
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
    // En cas d'erreur, rediriger vers la page de recherche avec un message d'erreur
    return res.redirect('/club-finder?error=database_error');
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