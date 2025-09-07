import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Validation des données du formulaire
const validateContactForm = (data: any) => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Veuillez fournir une adresse email valide');
  }
  
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('Veuillez sélectionner un sujet');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Le message doit contenir au moins 10 caractères');
  }
  
  return errors;
};

// Route POST pour envoyer un email de contact
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validation des données
    const validationErrors = validateContactForm(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: validationErrors
      });
    }
    
    // Vérification de la configuration SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Configuration SMTP manquante');
      return res.status(500).json({
        success: false,
        error: 'Configuration email non disponible'
      });
    }
    
    const transporter = createTransporter();
    
    // Contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'contact@petanque-noveant.fr',
      subject: `[Site Web] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #425e9b; border-bottom: 2px solid #425e9b; padding-bottom: 10px;">
            Nouveau message depuis le site web
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Informations du contact :</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
            <p><strong>Sujet :</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #425e9b;">
            <h3 style="color: #333; margin-top: 0;">Message :</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0;">Ce message a été envoyé depuis le formulaire de contact du site web du Club de Pétanque de Noveant-sur-Moselle.</p>
            <p style="margin: 5px 0 0 0;">Date d'envoi : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `,
      replyTo: email
    };
    
    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Email envoyé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email'
    });
  }
});

export default router;