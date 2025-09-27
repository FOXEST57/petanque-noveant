import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
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

const router = Router();

// Route pour récupérer tous les clubs (pour la sélection du super admin)
router.get('/', async (req, res) => {
  let connection;
  
  try {
    // Connexion à la base de données
    console.log('🔗 Tentative de connexion à la base de données');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    
    // Récupérer tous les clubs
    const [clubs] = await connection.execute(
      `SELECT 
        id, 
        nom, 
        ville, 
        numero_rue,
        nom_rue,
        code_postal,
        numero_ffpjp, 
        subdomain,
        adresse,
        telephone,
        email,
        created_at
      FROM clubs 
      ORDER BY nom ASC, ville ASC`
    );
    
    res.json({
      success: true,
      clubs: clubs,
      total: clubs.length
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clubs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Route pour récupérer un club par subdomain
router.get('/by-subdomain/:subdomain', async (req, res) => {
  let connection;
  const subdomain = req.params.subdomain;
  
  if (!subdomain || subdomain.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Subdomain invalide'
    });
  }
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [clubs] = await connection.execute(
      `SELECT 
        id, 
        nom, 
        ville, 
        numero_rue,
        nom_rue,
        code_postal,
        numero_ffpjp, 
        subdomain,
        adresse,
        telephone,
        email,
        created_at
      FROM clubs 
      WHERE subdomain = ?`,
      [subdomain]
    );
    
    if (clubs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }
    
    res.json({
      success: true,
      club: clubs[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du club:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du club',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Route pour récupérer un club spécifique par ID
router.get('/:id', async (req, res) => {
  let connection;
  const clubId = parseInt(req.params.id);
  
  if (isNaN(clubId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de club invalide'
    });
  }
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [clubs] = await connection.execute(
      `SELECT 
        id, 
        nom, 
        ville, 
        numero_ffpjp, 
        subdomain,
        adresse,
        telephone,
        email,
        created_at
      FROM clubs 
      WHERE id = ?`,
      [clubId]
    );
    
    if (clubs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }
    
    res.json({
      success: true,
      club: clubs[0]
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du club:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du club',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Route pour rechercher des clubs par nom ou ville
router.get('/search/:term', async (req, res) => {
  let connection;
  const searchTerm = req.params.term;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Le terme de recherche doit contenir au moins 2 caractères'
    });
  }
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const searchPattern = `%${searchTerm.trim()}%`;
    
    const [clubs] = await connection.execute(
      `SELECT 
        id, 
        nom, 
        ville, 
        numero_rue,
        nom_rue,
        code_postal,
        numero_ffpjp, 
        subdomain,
        adresse,
        telephone,
        email,
        created_at
      FROM clubs 
      WHERE (nom LIKE ? OR ville LIKE ? OR numero_ffpjp LIKE ?)
      ORDER BY nom ASC, ville ASC
      LIMIT 20`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    
    res.json({
      success: true,
      clubs: clubs,
      total: clubs.length,
      searchTerm: searchTerm
    });
    
  } catch (error) {
    console.error('Erreur lors de la recherche de clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de clubs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Route pour créer un nouveau club
router.post('/', async (req, res) => {
  let connection;
  
  try {
    const {
      nom,
      ville,
      numero_rue,
      nom_rue,
      code_postal,
      numero_ffpjp,
      telephone,
      email,
      contactName
    } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !ville || !contactName || !email) {
      return res.status(400).json({ 
        error: 'Les champs nom, ville, contactName et email sont obligatoires' 
      });
    }
    
    // Validation du numéro FFPJP s'il est fourni
    if (numero_ffpjp && typeof numero_ffpjp === 'string' && numero_ffpjp.trim() !== '') {
      if (!/^\d{4}$/.test(numero_ffpjp.trim())) {
        return res.status(400).json({ 
          error: 'Le numéro FFPJP doit être composé de 4 chiffres' 
        });
      }
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    // Générer un subdomain unique basé sur le nom du club
    let subdomain = nom.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    
    // Vérifier l'unicité du subdomain
    let counter = 0;
    let originalSubdomain = subdomain;
    while (true) {
      const [existing] = await connection.execute(
        'SELECT id FROM clubs WHERE subdomain = ?',
        [subdomain]
      );
      
      if (existing.length === 0) break;
      
      counter++;
      subdomain = `${originalSubdomain}${counter}`;
      
      if (counter > 100) {
        throw new Error('Impossible de générer un subdomain unique');
      }
    }
    
    // Utiliser le numéro par défaut 9999 si aucun numéro FFPJP n'est fourni
    let finalNumeroFFPJP = numero_ffpjp;
    
    if (!numero_ffpjp || (typeof numero_ffpjp === 'string' && numero_ffpjp.trim() === '')) {
      finalNumeroFFPJP = '9999'; // Numéro par défaut pour les clubs sans numéro FFPJP
    }
    
    // Insérer le nouveau club avec les champs d'adresse séparés
    const [result] = await connection.execute(
      `INSERT INTO clubs (
        nom, ville, numero_rue, nom_rue, code_postal, 
        numero_ffpjp, subdomain, telephone, email, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nom,
        ville,
        numero_rue || '',
        nom_rue || '',
        code_postal || '',
        finalNumeroFFPJP,
        subdomain,
        telephone || '',
        email
      ]
    );
    
    const clubId = result.insertId;
    
    // Récupérer le club créé pour le retourner
    const [clubs] = await connection.execute(
      `SELECT 
        id, nom, ville, numero_rue, nom_rue, code_postal,
        numero_ffpjp, subdomain, telephone, email, created_at
      FROM clubs 
      WHERE id = ?`,
      [clubId]
    );

    const createdClub = clubs[0];

    // Créer automatiquement un utilisateur administrateur pour le club
    try {
      console.log(`🔧 Début de la création de l'invitation admin pour le club ${clubId}`);
      
      // Générer un token d'invitation pour l'admin
      const invitationToken = Buffer.from(JSON.stringify({
        clubId: clubId,
        email: email,
        contactName: contactName,
        role: 'admin',
        timestamp: Date.now()
      })).toString('base64url');

      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/register-admin/${invitationToken}`;
      
      console.log(`📧 Configuration SMTP:`, {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        fromName: process.env.SMTP_FROM_NAME,
        fromEmail: process.env.SMTP_FROM_EMAIL
      });

      console.log(`📨 Tentative d'envoi d'email à: ${email}`);
      console.log(`🔗 URL d'invitation: ${invitationUrl}`);

      // Envoyer l'email d'invitation à l'administrateur
      const emailResult = await emailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Club de Pétanque'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: `Bienvenue ! Créez votre compte administrateur pour ${nom}`,
        html: `
          <h2>Félicitations ! Votre club a été créé avec succès</h2>
          <p>Bonjour ${contactName},</p>
          <p>Nous avons le plaisir de vous informer que votre club <strong>${nom}</strong> a été créé avec succès !</p>
          <p>En tant que créateur du club, vous êtes automatiquement désigné comme administrateur. Pour finaliser la configuration, veuillez créer votre compte administrateur en cliquant sur le lien ci-dessous :</p>
          <p><a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Créer mon compte administrateur</a></p>
          <p>Ou copiez ce lien dans votre navigateur :<br><a href="${invitationUrl}">${invitationUrl}</a></p>
          <p><strong>Important :</strong> Ce lien est valable pendant 7 jours. Passé ce délai, vous devrez contacter le support pour obtenir un nouveau lien.</p>
          <p>Une fois votre compte créé, vous pourrez :</p>
          <ul>
            <li>Gérer les membres de votre club</li>
            <li>Approuver les demandes d'adhésion</li>
            <li>Organiser des événements</li>
            <li>Configurer les paramètres du club</li>
            <li>Et bien plus encore !</li>
          </ul>
          <p><strong>Informations de votre club :</strong></p>
          <ul>
            <li>Nom : ${nom}</li>
            <li>Ville : ${ville}</li>
            <li>Sous-domaine : ${subdomain}</li>
            ${finalNumeroFFPJP !== '9999' ? `<li>Numéro FFPJP : ${finalNumeroFFPJP}</li>` : ''}
          </ul>
          <p>Nous avons hâte de vous voir gérer votre club !</p>
          <p>Cordialement,<br>L'équipe Pétanque Noveant</p>
        `
      });

      console.log(`✅ Email d'invitation envoyé avec succès à l'administrateur : ${email}`);
      console.log(`📋 Détails de l'envoi:`, emailResult);

    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email d\'invitation admin:', emailError);
      console.error('📊 Stack trace:', emailError.stack);
      // Ne pas faire échouer la création du club si l'email ne peut pas être envoyé
    }

    res.status(201).json({
      success: true,
      message: 'Club créé avec succès. Un email d\'invitation a été envoyé à l\'administrateur.',
      club: createdClub,
      subdomain: subdomain,
      adminInvitationSent: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la création du club:', error);
    
    // Vérifier si c'est une erreur de doublon pour le numéro FFPJP
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('numero_ffpjp')) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro FFPJP est déjà utilisé par un autre club',
        error: 'DUPLICATE_FFPJP'
      });
    }
    
    // Autres erreurs de doublon
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cette information est déjà utilisée par un autre club',
        error: 'DUPLICATE_ENTRY'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du club',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne du serveur'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * Route pour vérifier le token d'invitation administrateur
 * GET /api/clubs/verify-admin-invitation/:token
 */
router.get('/verify-admin-invitation/:token', async (req, res) => {
  let connection;
  
  try {
    const { token } = req.params;

    // Décoder le token
    let tokenData;
    try {
      const decodedToken = Buffer.from(token, 'base64url').toString();
      tokenData = JSON.parse(decodedToken);
    } catch (decodeError) {
      return res.status(400).json({
        error: 'Token d\'invitation invalide',
        code: 'INVALID_TOKEN'
      });
    }

    const { clubId, email, contactName, role, timestamp } = tokenData;

    // Vérifier que c'est bien un token admin
    if (role !== 'admin') {
      return res.status(400).json({
        error: 'Token d\'invitation invalide pour un administrateur',
        code: 'INVALID_ADMIN_TOKEN'
      });
    }

    // Vérifier que le token n'est pas expiré (7 jours)
    const tokenAge = Date.now() - timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

    if (tokenAge > maxAge) {
      return res.status(410).json({
        error: 'Le lien d\'invitation a expiré',
        code: 'TOKEN_EXPIRED'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // Vérifier que le club existe
    const [clubs] = await connection.execute(
      'SELECT id, nom, ville, subdomain FROM clubs WHERE id = ?',
      [clubId]
    );

    if (clubs.length === 0) {
      return res.status(404).json({
        error: 'Club non trouvé',
        code: 'CLUB_NOT_FOUND'
      });
    }

    const club = clubs[0];

    // Vérifier que l'utilisateur admin n'existe pas déjà
    const [existingAdmins] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND club_id = ? AND role = ?',
      [email, clubId, 'admin']
    );

    if (existingAdmins.length > 0) {
      return res.status(409).json({
        error: 'Un compte administrateur existe déjà avec cet email pour ce club',
        code: 'ADMIN_ALREADY_EXISTS'
      });
    }

    res.json({
      valid: true,
      invitation: {
        clubId: club.id,
        clubName: club.nom,
        clubVille: club.ville,
        clubSubdomain: club.subdomain,
        contactName: contactName,
        email: email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'invitation admin:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

export default router;