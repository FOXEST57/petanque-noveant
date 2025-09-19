import { Router } from 'express';
import mysql from 'mysql2/promise';

const router = Router();

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

// GET /api/site-settings - Récupérer tous les paramètres du site
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT setting_key, setting_value, setting_type FROM site_settings ORDER BY setting_key'
    );
    
    await connection.end();
    
    // Transformer les résultats en objet clé-valeur
    const settings = {};
    (rows as any[]).forEach(row => {
      let value = row.setting_value;
      
      // Convertir selon le type
      if (row.setting_type === 'number') {
        value = parseFloat(value) || 0;
      } else if (row.setting_type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (row.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = {};
        }
      }
      
      settings[row.setting_key] = value;
    });
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des paramètres du site' 
    });
  }
});

// PUT /api/site-settings - Mettre à jour les paramètres du site
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides' 
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Mettre à jour chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      let stringValue = String(value);
      let settingType = 'string';
      
      // Déterminer le type
      if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'boolean') {
        settingType = 'boolean';
        stringValue = value ? 'true' : 'false';
      } else if (typeof value === 'object' && value !== null) {
        settingType = 'json';
        stringValue = JSON.stringify(value);
      }
      
      await connection.execute(
        `INSERT INTO site_settings (setting_key, setting_value, setting_type) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         setting_type = VALUES(setting_type),
         updated_at = CURRENT_TIMESTAMP`,
        [key, stringValue, settingType]
      );
    }
    
    await connection.end();
    
    res.json({ 
      success: true, 
      message: 'Paramètres du site mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour des paramètres du site' 
    });
  }
});

// GET /api/site-settings/:key - Récupérer un paramètre spécifique
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT setting_value, setting_type FROM site_settings WHERE setting_key = ?',
      [key]
    );
    
    await connection.end();
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paramètre non trouvé' 
      });
    }
    
    const row = (rows as any[])[0];
    let value = row.setting_value;
    
    // Convertir selon le type
    if (row.setting_type === 'number') {
      value = parseFloat(value) || 0;
    } else if (row.setting_type === 'boolean') {
      value = value === 'true' || value === '1';
    } else if (row.setting_type === 'json') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        value = {};
      }
    }
    
    res.json({ success: true, data: { [key]: value } });
  } catch (error) {
    console.error('Erreur lors de la récupération du paramètre:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du paramètre' 
    });
  }
});

export default router;