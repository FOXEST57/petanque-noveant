import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Banque extends RowDataPacket {
  id: number;
  club_id: number;
  nom: string;
  adresse: string;
  iban: string;
  created_at: Date;
  updated_at: Date;
}

// Récupérer toutes les banques d'un club
export const getBanques = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    const [rows] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE club_id = ? ORDER BY nom',
      [clubId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des banques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer une banque par ID
export const getBanqueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    const [rows] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE id = ? AND club_id = ?',
      [id, clubId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la banque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle banque
export const createBanque = async (req: Request, res: Response) => {
  try {
    const { nom, adresse, iban } = req.body;
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la banque est requis' });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO banque (club_id, nom, adresse, iban) VALUES (?, ?, ?, ?)',
      [clubId, nom, adresse || '', iban || '']
    );

    const [newBanque] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newBanque[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la banque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour une banque
export const updateBanque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, adresse, iban } = req.body;
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la banque est requis' });
    }

    // Vérifier que la banque existe et appartient au club
    const [existingRows] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE id = ? AND club_id = ?',
      [id, clubId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }

    await pool.execute(
      'UPDATE banque SET nom = ?, adresse = ?, iban = ? WHERE id = ? AND club_id = ?',
      [nom, adresse || '', iban || '', id, clubId]
    );

    const [updatedBanque] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE id = ?',
      [id]
    );

    res.json(updatedBanque[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la banque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer une banque
export const deleteBanque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    // Vérifier que la banque existe et appartient au club
    const [existingRows] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE id = ? AND club_id = ?',
      [id, clubId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }

    // Empêcher la suppression de la banque principale
    if (existingRows[0].nom === 'Banque Principale') {
      return res.status(400).json({ error: 'Impossible de supprimer la banque principale' });
    }

    await pool.execute(
      'DELETE FROM banque WHERE id = ? AND club_id = ?',
      [id, clubId]
    );

    res.json({ message: 'Banque supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la banque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer la banque principale d'un club
export const getBanquePrincipale = async (req: Request, res: Response) => {
  try {
    const clubId = req.user?.clubId;
    
    if (!clubId) {
      return res.status(401).json({ error: 'Club non identifié' });
    }

    const [rows] = await pool.execute<Banque[]>(
      'SELECT * FROM banque WHERE club_id = ? AND nom = "Banque Principale" LIMIT 1',
      [clubId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Banque principale non trouvée' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la banque principale:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};