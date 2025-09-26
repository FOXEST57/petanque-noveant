import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

const router = Router();

// Route pour récupérer tous les clubs (pour la sélection du super admin)
router.get('/', async (req, res) => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Récupérer tous les clubs
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

export default router;