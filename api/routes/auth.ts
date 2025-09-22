/**
 * Routes d'authentification pour le système multi-club
 * Gestion de l'inscription, connexion, profil utilisateur et changement de mot de passe
 */
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Rate limiting pour les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'inscription
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP par heure
  message: {
    error: 'Trop de tentatives d\'inscription. Réessayez dans 1 heure.',
    code: 'TOO_MANY_REGISTRATIONS'
  },
});

/**
 * Inscription d'un nouvel utilisateur (invitation uniquement)
 * POST /api/auth/register
 */
router.post('/register', registerLimiter, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { 
      clubId, 
      nom, 
      prenom, 
      surnom, 
      email, 
      telephone, 
      numeroLicence, 
      password, 
      role = 'membre' 
    } = req.body;

    // Validation des champs obligatoires
    if (!clubId || !nom || !prenom || !email || !telephone || !password) {
      res.status(400).json({
        error: 'Tous les champs obligatoires doivent être remplis',
        code: 'MISSING_FIELDS',
        required: ['clubId', 'nom', 'prenom', 'email', 'telephone', 'password']
      });
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Format d\'email invalide',
        code: 'INVALID_EMAIL'
      });
      return;
    }

    // Validation du mot de passe (minimum 8 caractères)
    if (password.length < 8) {
      res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
      return;
    }

    // Vérifier si l'utilisateur existe déjà dans ce club
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ?',
      [email, clubId]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà dans ce club',
        code: 'USER_EXISTS'
      });
      return;
    }

    // Vérifier que le club existe
    const [clubs] = await connection.execute(
      'SELECT id FROM clubs WHERE id = ?',
      [clubId]
    );

    if ((clubs as any[]).length === 0) {
      res.status(404).json({
        error: 'Club non trouvé',
        code: 'CLUB_NOT_FOUND'
      });
      return;
    }

    // Hacher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const [result] = await connection.execute(
      `INSERT INTO users (club_id, nom, prenom, surnom, email, telephone, numero_licence, password_hash, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clubId, nom, prenom, surnom || null, email, telephone, numeroLicence || null, passwordHash, role]
    );

    const userId = (result as any).insertId;

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET non configuré');
    }

    const token = jwt.sign(
      { 
        userId, 
        clubId, 
        email, 
        role 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: userId,
        clubId,
        nom,
        prenom,
        surnom,
        email,
        telephone,
        numeroLicence,
        role
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Connexion utilisateur
 * POST /api/auth/login
 */
router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { email, password, clubId } = req.body;

    // Validation des champs
    if (!email || !password) {
      res.status(400).json({
        error: 'Email et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
      return;
    }

    // Rechercher l'utilisateur
    let query = 'SELECT * FROM users WHERE email = ? AND statut = "actif"';
    let params: any[] = [email];

    // Si un clubId est spécifié, filtrer par club
    if (clubId) {
      query += ' AND club_id = ?';
      params.push(clubId);
    }

    const [users] = await connection.execute(query, params);
    const userList = users as any[];

    if (userList.length === 0) {
      res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Si plusieurs utilisateurs avec le même email (différents clubs), demander de spécifier le club
    if (userList.length > 1 && !clubId) {
      const clubs = await Promise.all(
        userList.map(async (user) => {
          const [clubRows] = await connection.execute(
            'SELECT nom, subdomain FROM clubs WHERE id = ?',
            [user.club_id]
          );
          const club = (clubRows as any[])[0];
          return {
            clubId: user.club_id,
            clubName: club.nom,
            subdomain: club.subdomain
          };
        })
      );

      res.status(409).json({
        error: 'Plusieurs comptes trouvés. Veuillez spécifier votre club.',
        code: 'MULTIPLE_ACCOUNTS',
        clubs
      });
      return;
    }

    const user = userList[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET non configuré');
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        clubId: user.club_id, 
        email: user.email, 
        role: user.role 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        clubId: user.club_id,
        nom: user.nom,
        prenom: user.prenom,
        surnom: user.surnom,
        email: user.email,
        telephone: user.telephone,
        numeroLicence: user.numero_licence,
        role: user.role,
        photoUrl: user.photo_url,
        is_super_admin: user.is_super_admin
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Déconnexion utilisateur
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  // Dans un système JWT stateless, la déconnexion se fait côté client
  // On pourrait implémenter une blacklist de tokens si nécessaire
  res.json({
    message: 'Déconnexion réussie'
  });
});

/**
 * Récupérer le profil utilisateur
 * GET /api/auth/profile
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [users] = await connection.execute(
      `SELECT u.*, c.nom as club_nom, c.subdomain as club_subdomain 
       FROM users u 
       JOIN clubs c ON u.club_id = c.id 
       WHERE u.id = ?`,
      [req.user!.id]
    );

    const user = (users as any[])[0];
    if (!user) {
      res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    res.json({
      user: {
        id: user.id,
        clubId: user.club_id,
        clubName: user.club_nom,
        clubSubdomain: user.club_subdomain,
        nom: user.nom,
        prenom: user.prenom,
        surnom: user.surnom,
        email: user.email,
        telephone: user.telephone,
        numeroLicence: user.numero_licence,
        role: user.role,
        statut: user.statut,
        photoUrl: user.photo_url,
        dateCreationCompte: user.date_creation_compte,
        derniereConnexion: user.derniere_connexion
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Mettre à jour le profil utilisateur
 * PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { nom, prenom, surnom, telephone, numeroLicence, photoUrl } = req.body;
    const userId = req.user!.id;

    // Validation des champs obligatoires
    if (!nom || !prenom || !telephone) {
      res.status(400).json({
        error: 'Nom, prénom et téléphone sont obligatoires',
        code: 'MISSING_REQUIRED_FIELDS'
      });
      return;
    }

    // Mettre à jour le profil
    await connection.execute(
      `UPDATE users 
       SET nom = ?, prenom = ?, surnom = ?, telephone = ?, numero_licence = ?, photo_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [nom, prenom, surnom || null, telephone, numeroLicence || null, photoUrl || null, userId]
    );

    res.json({
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Changer le mot de passe
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Mot de passe actuel et nouveau mot de passe requis',
        code: 'MISSING_PASSWORDS'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
      return;
    }

    // Récupérer l'utilisateur
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Mot de passe actuel incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
      return;
    }

    // Hacher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Changer l'email (et donc l'ID de connexion)
 * PUT /api/auth/change-email
 */
router.put('/change-email', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { newEmail, password } = req.body;
    const userId = req.user!.id;
    const clubId = req.user!.clubId;

    // Validation
    if (!newEmail || !password) {
      res.status(400).json({
        error: 'Nouvel email et mot de passe requis',
        code: 'MISSING_FIELDS'
      });
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      res.status(400).json({
        error: 'Format d\'email invalide',
        code: 'INVALID_EMAIL'
      });
      return;
    }

    // Vérifier que le nouvel email n'existe pas déjà dans ce club
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ? AND id != ?',
      [newEmail, clubId, userId]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(409).json({
        error: 'Cet email est déjà utilisé dans ce club',
        code: 'EMAIL_EXISTS'
      });
      return;
    }

    // Récupérer l'utilisateur et vérifier le mot de passe
    const [users] = await connection.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user) {
      res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Mot de passe incorrect',
        code: 'INVALID_PASSWORD'
      });
      return;
    }

    // Mettre à jour l'email
    await connection.execute(
      'UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?',
      [newEmail, userId]
    );

    res.json({
      message: 'Email changé avec succès. Veuillez vous reconnecter.'
    });

  } catch (error) {
    console.error('Erreur lors du changement d\'email:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Connexion super admin avec sélection de club
 * POST /api/auth/super-admin-login
 */
router.post('/super-admin-login', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { clubId } = req.body;
    const userId = req.user!.id;

    // Vérifier que l'utilisateur est bien un super admin
    const [users] = await connection.execute(
      'SELECT is_super_admin FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    if (!user || !user.is_super_admin) {
      res.status(403).json({
        error: 'Accès refusé - Super admin requis',
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Validation du club
    if (!clubId) {
      res.status(400).json({
        error: 'ID du club requis',
        code: 'MISSING_CLUB_ID'
      });
      return;
    }

    // Vérifier que le club existe
    const [clubs] = await connection.execute(
      'SELECT id, nom, subdomain FROM clubs WHERE id = ?',
      [clubId]
    );

    const club = (clubs as any[])[0];
    if (!club) {
      res.status(404).json({
        error: 'Club non trouvé',
        code: 'CLUB_NOT_FOUND'
      });
      return;
    }

    // Récupérer les informations de l'utilisateur sans modifier sa base de données
    const [userRows] = await connection.execute(
      `SELECT u.*, c.nom as club_nom, c.subdomain as club_subdomain 
       FROM users u 
       JOIN clubs c ON c.id = ? 
       WHERE u.id = ?`,
      [clubId, userId]
    );

    const userInfo = (userRows as any[])[0];
    
    // Créer un objet utilisateur avec le club sélectionné (temporaire pour cette session)
    const updatedUser = {
      ...userInfo,
      club_id: clubId,
      club_nom: club.nom,
      club_subdomain: club.subdomain
    };

    // Générer un nouveau token avec le nouveau club
    const tokenPayload = {
      userId: updatedUser.id,
      clubId: updatedUser.club_id,
      email: updatedUser.email,
      role: updatedUser.role,
      isSuperAdmin: updatedUser.is_super_admin
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Connexion super admin réussie',
      user: {
        id: updatedUser.id,
        clubId: updatedUser.club_id,
        clubName: updatedUser.club_nom,
        clubSubdomain: updatedUser.club_subdomain,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        surnom: updatedUser.surnom,
        email: updatedUser.email,
        telephone: updatedUser.telephone,
        numeroLicence: updatedUser.numero_licence,
        role: updatedUser.role,
        photoUrl: updatedUser.photo_url,
        isSuperAdmin: updatedUser.is_super_admin
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion super admin:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

export default router;