/**
 * Routes de gestion des demandes d'adhésion
 * Gestion des demandes spontanées et des invitations par email/SMS
 */
import { Router } from 'express';
import mysql from 'mysql2/promise';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { authenticateToken, canApproveMembership } from '../middleware/auth.js';

const router = Router();

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

// Configuration de l'email
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Initialisation de la table clubs si elle n'existe pas
async function initializeClubsTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Créer la table clubs si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        numero_ffpjp VARCHAR(20) NOT NULL UNIQUE,
        subdomain VARCHAR(100) NOT NULL UNIQUE,
        ville VARCHAR(100) NOT NULL,
        adresse TEXT,
        telephone VARCHAR(20),
        email VARCHAR(255),
        description TEXT,
        logo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Créer la table users si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT NOT NULL DEFAULT 1,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        surnom VARCHAR(100) NULL,
        email VARCHAR(255) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        numero_licence VARCHAR(50) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('president', 'vice_president', 'secretaire', 'tresorier', 'membre', 'invite') DEFAULT 'membre',
        statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
        photo_url VARCHAR(500) NULL,
        date_naissance DATE NULL,
        adresse TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_statut (statut),
        INDEX idx_club_id (club_id)
      )
    `);
    
    // Créer la table membership_requests si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS membership_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT NOT NULL DEFAULT 1,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        surnom VARCHAR(100) NULL,
        email VARCHAR(255) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        numero_licence VARCHAR(50),
        message TEXT,
        type_demande ENUM('spontanee', 'invitation') DEFAULT 'spontanee',
        statut ENUM('en_attente', 'approuvee', 'rejetee') DEFAULT 'en_attente',
        date_naissance DATE,
        adresse TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
        INDEX idx_email (email),
        INDEX idx_statut (statut),
        INDEX idx_club_id (club_id)
      )
    `);
    
    // Insérer un club par défaut si aucun n'existe
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM clubs');
    if (rows[0].count === 0) {
      await connection.execute(`
        INSERT INTO clubs (nom, numero_ffpjp, subdomain, ville, adresse, telephone, email, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Pétanque Club de Noveant',
        'FFPJP001',
        'noveant',
        'Noveant-sur-Moselle',
        '123 Rue du Stade, 57680 Noveant-sur-Moselle',
        '03.87.12.34.56',
        'contact@petanque-noveant.fr',
        'Club de pétanque de Noveant-sur-Moselle fondé en 1985'
      ]);
    }
    
    await connection.end();
    console.log('Tables clubs, users et membership_requests initialisées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tables:', error);
  }
}

// Initialiser la table clubs au démarrage
initializeClubsTable();

// Rate limiting pour les demandes d'adhésion
const membershipRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 heures
  max: 20, // 20 demandes par IP par jour (augmenté à 20)
  message: {
    error: 'Trop de demandes d\'adhésion. Réessayez demain.',
    code: 'TOO_MANY_MEMBERSHIP_REQUESTS'
  },
});

/**
 * Renvoyer l'invitation par email pour une demande approuvée
 * POST /api/membership/resend-invitation/:requestId
 */
router.post('/resend-invitation/:requestId', authenticateToken, canApproveMembership, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  const { requestId } = req.params;

  try {
    // Vérifier que la demande existe et est approuvée
    const [requests] = await connection.execute(
      `SELECT mr.*, c.nom as club_nom 
       FROM membership_requests mr 
       JOIN clubs c ON mr.club_id = c.id 
       WHERE mr.id = ? AND mr.statut = 'approuvee'`,
      [requestId]
    );

    if (requests.length === 0) {
      res.status(404).json({
        error: 'Demande non trouvée ou non approuvée',
        code: 'REQUEST_NOT_FOUND_OR_NOT_APPROVED'
      });
      return;
    }

    const request = requests[0];

    // Générer le token d'invitation
    const invitationToken = Buffer.from(JSON.stringify({
      requestId: parseInt(requestId),
      email: request.email,
      clubId: request.club_id,
      timestamp: Date.now()
    })).toString('base64url');

    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/register/${invitationToken}`;

    // Envoyer l'email d'invitation
    try {
      await emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Club de Pétanque'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: request.email,
        subject: `Rappel - Créez votre compte au ${request.club_nom}`,
        html: `
          <h2>Rappel : Votre demande d'adhésion a été approuvée</h2>
          <p>Bonjour ${request.prenom} ${request.nom},</p>
          <p>Nous vous rappelons que votre demande d'adhésion au club <strong>${request.club_nom}</strong> a été approuvée !</p>
          <p>Si vous n'avez pas encore créé votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <p><a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Créer mon compte</a></p>
          <p>Ou copiez ce lien dans votre navigateur :<br><a href="${invitationUrl}">${invitationUrl}</a></p>
          <p><strong>Important :</strong> Ce lien est valable pendant 7 jours. Passé ce délai, vous devrez contacter le club pour obtenir un nouveau lien.</p>
          <p>Une fois votre compte créé, vous pourrez :</p>
          <ul>
            <li>Accéder à votre espace membre</li>
            <li>Consulter les événements du club</li>
            <li>Gérer votre profil</li>
            <li>Et bien plus encore !</li>
          </ul>
          <p>Nous avons hâte de vous accueillir parmi nous !</p>
          <p>Cordialement,<br>L'équipe du ${request.club_nom}</p>
        `
      });

      res.json({
        message: 'Email d\'invitation renvoyé avec succès',
        requestId: parseInt(requestId)
      });

    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', emailError);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email',
        code: 'EMAIL_SEND_ERROR'
      });
    }

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'invitation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Soumettre une demande d'adhésion spontanée
 * POST /api/membership/submit-request
 */
router.post('/submit-request', membershipRequestLimiter, async (req, res) => {
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
      message 
    } = req.body;

    // Validation des champs obligatoires
    if (!clubId || !nom || !prenom || !email || !telephone) {
      res.status(400).json({
        error: 'Tous les champs obligatoires doivent être remplis',
        code: 'MISSING_FIELDS',
        required: ['clubId', 'nom', 'prenom', 'email', 'telephone']
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

    // Vérifier que le club existe
    const [clubs] = await connection.execute(
      'SELECT nom, subdomain FROM clubs WHERE id = ?',
      [clubId]
    );

    if (clubs.length === 0) {
      res.status(404).json({
        error: 'Club non trouvé',
        code: 'CLUB_NOT_FOUND'
      });
      return;
    }

    const club = clubs[0];

    // Vérifier si une demande existe déjà pour cet email dans ce club
    const [existingRequests] = await connection.execute(
      'SELECT id, statut FROM membership_requests WHERE email = ? AND club_id = ? AND statut IN ("en_attente", "approuvee")',
      [email, clubId]
    );

    if (existingRequests.length > 0) {
      const existingRequest = existingRequests[0];
      let message = 'Une demande existe déjà pour cet email dans ce club';
      
      if (existingRequest.statut === 'approuvee') {
        message = 'Votre demande a déjà été approuvée. Vérifiez vos emails pour les instructions de création de compte.';
      } else if (existingRequest.statut === 'en_attente') {
        message = 'Votre demande est en cours de traitement par le comité du club. Patientez s\'il vous plaît.';
      }

      res.status(409).json({
        error: message,
        code: 'REQUEST_EXISTS',
        status: existingRequest.statut
      });
      return;
    }

    // Vérifier si l'utilisateur existe déjà dans ce club
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ?',
      [email, clubId]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        error: 'Un compte utilisateur existe déjà avec cet email dans ce club',
        code: 'USER_EXISTS'
      });
      return;
    }

    // Créer la demande d'adhésion
    const [result] = await connection.execute(
      `INSERT INTO membership_requests 
       (club_id, nom, prenom, surnom, email, telephone, numero_licence, message, type_demande, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'spontanee', 'en_attente')`,
      [clubId, nom, prenom, surnom || null, email, telephone, numeroLicence || null, message || null]
    );

    const requestId = result.insertId;

    // Envoyer une notification email au demandeur
    try {
      await emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Club de Pétanque'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: `Demande d'adhésion reçue - ${club.nom}`,
        html: `
          <h2>Demande d'adhésion reçue</h2>
          <p>Bonjour ${prenom} ${nom},</p>
          <p>Nous avons bien reçu votre demande d'adhésion au club <strong>${club.nom}</strong>.</p>
          <p><strong>Détails de votre demande :</strong></p>
          <ul>
            <li>Nom : ${nom}</li>
            <li>Prénom : ${prenom}</li>
            ${surnom ? `<li>Surnom : ${surnom}</li>` : ''}
            <li>Email : ${email}</li>
            <li>Téléphone : ${telephone}</li>
            ${numeroLicence ? `<li>Numéro de licence : ${numeroLicence}</li>` : ''}
          </ul>
          ${message ? `<p><strong>Votre message :</strong><br>${message}</p>` : ''}
          <p>Votre demande sera examinée par le comité du club. Vous recevrez une notification par email dès qu'une décision sera prise.</p>
          <p>Merci pour votre intérêt pour notre club !</p>
          <p>Cordialement,<br>L'équipe du ${club.nom}</p>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      // Ne pas faire échouer la demande si l'email ne peut pas être envoyé
    }

    res.status(201).json({
      message: 'Demande d\'adhésion soumise avec succès',
      requestId,
      status: 'en_attente',
      club: {
        nom: club.nom,
        subdomain: club.subdomain
      }
    });

  } catch (error) {
    console.error('Erreur lors de la soumission de la demande:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await connection.end();
  }
});

/**
 * Récupérer les demandes d'adhésion (pour les validateurs)
 * GET /api/membership/requests
 */
router.get('/requests', authenticateToken, canApproveMembership, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const clubId = req.user.clubId;
    const { status, page = 1, limit = 20 } = req.query;

    // Requête simplifiée sans JOIN pour éviter les problèmes de paramètres
    let query = `
      SELECT * 
      FROM membership_requests 
      WHERE club_id = ?
    `;
    let params = [clubId];

    // Filtrer par statut si spécifié
    if (status && ['en_attente', 'approuvee', 'rejetee'].includes(status)) {
      query += ' AND statut = ?';
      params.push(status);
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    // Ajouter la clause ORDER BY et LIMIT avec des valeurs littérales pour éviter les erreurs de paramètres
    query += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    const [requests] = await connection.execute(query, params);

    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(*) as total FROM membership_requests WHERE club_id = ?';
    let countParams = [clubId];

    if (status && ['en_attente', 'approuvee', 'rejetee'].includes(status)) {
      countQuery += ' AND statut = ?';
      countParams.push(status);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Approuver une demande d'adhésion
 * POST /api/membership/approve/:requestId
 */
router.post('/approve/:requestId', authenticateToken, canApproveMembership, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { requestId } = req.params;
    const { sendInvitation = true } = req.body;
    const validatorId = req.user.id;
    const clubId = req.user.clubId;

    // Récupérer la demande
    const [requests] = await connection.execute(
      `SELECT mr.*, c.nom as club_nom, c.subdomain as club_subdomain 
       FROM membership_requests mr
       JOIN clubs c ON mr.club_id = c.id
       WHERE mr.id = ? AND mr.club_id = ?`,
      [requestId, clubId]
    );

    if (requests.length === 0) {
      res.status(404).json({
        error: 'Demande non trouvée',
        code: 'REQUEST_NOT_FOUND'
      });
      return;
    }

    const request = requests[0];

    if (request.statut !== 'en_attente') {
      res.status(400).json({
        error: 'Cette demande a déjà été traitée',
        code: 'REQUEST_ALREADY_PROCESSED',
        currentStatus: request.statut
      });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ?',
      [request.email, clubId]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà dans ce club',
        code: 'USER_EXISTS'
      });
      return;
    }

    // Approuver la demande
    await connection.execute(
      `UPDATE membership_requests 
       SET statut = 'approuvee', date_traitement = NOW(), traite_par_user_id = ?
       WHERE id = ?`,
      [validatorId, requestId]
    );

    // Ajouter automatiquement le membre approuvé à la table des membres
    try {
      await connection.execute(
        'INSERT INTO members (nom, prenom, surnom, adresse, telephone, email, numero_licence, date_entree, type_membre_id, club_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 1, ?, NOW(), NOW())',
        [
          request.nom,
          request.prenom,
          request.surnom, // Ajouter le surnom depuis la demande d'adhésion
          null, // adresse - pas disponible dans membership_requests
          request.telephone,
          request.email,
          request.numero_licence,
          clubId // Ajouter le club_id obligatoire
        ]
      );
      console.log(`Membre ${request.prenom} ${request.nom} ajouté automatiquement à la liste des membres`);
    } catch (memberError) {
      console.error('Erreur lors de l\'ajout du membre à la liste:', memberError);
      // Ne pas faire échouer l'approbation si l'ajout du membre échoue
      // Le membre pourra être ajouté manuellement plus tard
    }

    // Envoyer l'invitation par email si demandé
    if (sendInvitation) {
      try {
        const invitationToken = Buffer.from(JSON.stringify({
          requestId: parseInt(requestId),
          email: request.email,
          clubId: request.club_id,
          timestamp: Date.now()
        })).toString('base64url');

        const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/register/${invitationToken}`;

        await emailTransporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'Club de Pétanque'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
          to: request.email,
          subject: `Bienvenue au ${request.club_nom} - Créez votre compte`,
          html: `
            <h2>Félicitations ! Votre demande d'adhésion a été approuvée</h2>
            <p>Bonjour ${request.prenom} ${request.nom},</p>
            <p>Nous avons le plaisir de vous informer que votre demande d'adhésion au club <strong>${request.club_nom}</strong> a été approuvée !</p>
            <p>Pour finaliser votre inscription, veuillez créer votre compte en cliquant sur le lien ci-dessous :</p>
            <p><a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Créer mon compte</a></p>
            <p>Ou copiez ce lien dans votre navigateur :<br><a href="${invitationUrl}">${invitationUrl}</a></p>
            <p><strong>Important :</strong> Ce lien est valable pendant 7 jours. Passé ce délai, vous devrez contacter le club pour obtenir un nouveau lien.</p>
            <p>Une fois votre compte créé, vous pourrez :</p>
            <ul>
              <li>Accéder à votre espace membre</li>
              <li>Consulter les événements du club</li>
              <li>Gérer votre profil</li>
              <li>Et bien plus encore !</li>
            </ul>
            <p>Nous avons hâte de vous accueillir parmi nous !</p>
            <p>Cordialement,<br>L'équipe du ${request.club_nom}</p>
          `
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'invitation:', emailError);
        // Ne pas faire échouer l'approbation si l'email ne peut pas être envoyé
      }
    }

    res.json({
      message: 'Demande approuvée avec succès',
      requestId: parseInt(requestId),
      invitationSent: sendInvitation
    });

  } catch (error) {
    console.error('Erreur lors de l\'approbation de la demande:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Rejeter une demande d'adhésion
 * POST /api/membership/reject/:requestId
 */
router.post('/reject/:requestId', authenticateToken, canApproveMembership, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { requestId } = req.params;
    const { reason, sendNotification = true } = req.body;
    const validatorId = req.user.id;
    const clubId = req.user.clubId;

    // Récupérer la demande
    const [requests] = await connection.execute(
      `SELECT mr.*, c.nom as club_nom 
       FROM membership_requests mr
       JOIN clubs c ON mr.club_id = c.id
       WHERE mr.id = ? AND mr.club_id = ?`,
      [requestId, clubId]
    );

    if (requests.length === 0) {
      res.status(404).json({
        error: 'Demande non trouvée',
        code: 'REQUEST_NOT_FOUND'
      });
      return;
    }

    const request = requests[0];

    if (request.statut !== 'en_attente') {
      res.status(400).json({
        error: 'Cette demande a déjà été traitée',
        code: 'REQUEST_ALREADY_PROCESSED',
        currentStatus: request.statut
      });
      return;
    }

    // Rejeter la demande
    await connection.execute(
      `UPDATE membership_requests 
       SET statut = 'rejetee', date_traitement = NOW(), traite_par_user_id = ?, commentaire_traitement = ?
       WHERE id = ?`,
      [validatorId, reason || null, requestId]
    );

    // Envoyer une notification par email si demandé
    if (sendNotification) {
      try {
        await emailTransporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'Club de Pétanque'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
          to: request.email,
          subject: `Réponse à votre demande d'adhésion - ${request.club_nom}`,
          html: `
            <h2>Réponse à votre demande d'adhésion</h2>
            <p>Bonjour ${request.prenom} ${request.nom},</p>
            <p>Nous vous remercions pour l'intérêt que vous portez au club <strong>${request.club_nom}</strong>.</p>
            <p>Après examen de votre demande d'adhésion, nous regrettons de vous informer que nous ne pouvons pas donner suite favorablement à votre candidature pour le moment.</p>
            ${reason ? `<p><strong>Motif :</strong> ${reason}</p>` : ''}
            <p>Cette décision ne remet pas en question vos qualités personnelles. N'hésitez pas à nous recontacter ultérieurement si vous souhaitez renouveler votre demande.</p>
            <p>Nous vous souhaitons bonne continuation dans vos projets sportifs.</p>
            <p>Cordialement,<br>L'équipe du ${request.club_nom}</p>
          `
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de la notification de rejet:', emailError);
        // Ne pas faire échouer le rejet si l'email ne peut pas être envoyé
      }
    }

    res.json({
      message: 'Demande rejetée avec succès',
      requestId: parseInt(requestId),
      notificationSent: sendNotification
    });

  } catch (error) {
    console.error('Erreur lors du rejet de la demande:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Récupérer les détails d'une demande spécifique
 * GET /api/membership/request/:requestId
 */
router.get('/request/:requestId', authenticateToken, canApproveMembership, async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { requestId } = req.params;
    const clubId = req.user.clubId;

    const [requests] = await connection.execute(
      `SELECT mr.*, c.nom as club_nom, c.subdomain as club_subdomain,
              u.nom as validateur_nom, u.prenom as validateur_prenom
       FROM membership_requests mr
       JOIN clubs c ON mr.club_id = c.id
       LEFT JOIN users u ON mr.validateur_id = u.id
       WHERE mr.id = ? AND mr.club_id = ?`,
      [requestId, clubId]
    );

    if (requests.length === 0) {
      res.status(404).json({
        error: 'Demande non trouvée',
        code: 'REQUEST_NOT_FOUND'
      });
      return;
    }

    const request = requests[0];

    res.json({
      request: {
        id: request.id,
        clubId: request.club_id,
        clubName: request.club_nom,
        clubSubdomain: request.club_subdomain,
        nom: request.nom,
        prenom: request.prenom,
        surnom: request.surnom,
        email: request.email,
        telephone: request.telephone,
        numeroLicence: request.numero_licence,
        message: request.message,
        typeDemande: request.type_demande,
        statut: request.statut,
        dateDemande: request.date_demande,
        dateTraitement: request.date_traitement,
        raisonRejet: request.raison_rejet,
        validateur: request.validateur_nom ? {
          nom: request.validateur_nom,
          prenom: request.validateur_prenom
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

/**
 * Vérifier un token d'invitation et récupérer les informations
 * GET /api/membership/verify-invitation/:token
 */
router.get('/verify-invitation/:token', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { token } = req.params;

    // Décoder le token
    let tokenData;
    try {
      const decodedToken = Buffer.from(token, 'base64url').toString();
      tokenData = JSON.parse(decodedToken);
    } catch (decodeError) {
      res.status(400).json({
        error: 'Token d\'invitation invalide',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    const { requestId, email, clubId, timestamp } = tokenData;

    // Vérifier que le token n'est pas expiré (7 jours)
    const tokenAge = Date.now() - timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

    if (tokenAge > maxAge) {
      res.status(410).json({
        error: 'Le lien d\'invitation a expiré',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    // Vérifier que la demande existe et est approuvée
    const [requests] = await connection.execute(
      `SELECT mr.*, c.nom as club_nom, c.subdomain as club_subdomain
       FROM membership_requests mr
       JOIN clubs c ON mr.club_id = c.id
       WHERE mr.id = ? AND mr.email = ? AND mr.club_id = ? AND mr.statut = 'approuvee'`,
      [requestId, email, clubId]
    );

    if (requests.length === 0) {
      res.status(404).json({
        error: 'Invitation non trouvée ou non valide',
        code: 'INVITATION_NOT_FOUND'
      });
      return;
    }

    const request = requests[0];

    // Vérifier que l'utilisateur n'existe pas déjà
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ?',
      [email, clubId]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        error: 'Un compte utilisateur existe déjà avec cet email',
        code: 'USER_ALREADY_EXISTS'
      });
      return;
    }

    res.json({
      valid: true,
      invitation: {
        requestId: request.id,
        clubId: request.club_id,
        clubName: request.club_nom,
        clubSubdomain: request.club_subdomain,
        nom: request.nom,
        prenom: request.prenom,
        surnom: request.surnom,
        email: request.email,
        telephone: request.telephone,
        numeroLicence: request.numero_licence
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'invitation:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    await connection.end();
  }
});

export default router;