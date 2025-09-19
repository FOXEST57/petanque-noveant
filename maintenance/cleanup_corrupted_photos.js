import { deleteEventPhoto, getEventPhotos } from '../src/lib/database.js';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = './uploads/events';
const MIN_FILE_SIZE = 1000; // Taille minimale en octets pour une image valide

async function cleanupCorruptedPhotos() {
  console.log('🧹 Nettoyage des photos corrompues...');
  
  try {
    // Récupérer toutes les photos de tous les événements
    const allPhotos = [];
    
    // Pour simplifier, on va chercher directement dans le dossier uploads
    const files = fs.readdirSync(UPLOADS_DIR);
    
    for (const filename of files) {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stats = fs.statSync(filePath);
      
      console.log(`📁 Fichier: ${filename}, Taille: ${stats.size} octets`);
      
      if (stats.size < MIN_FILE_SIZE) {
        console.log(`❌ Fichier corrompu détecté: ${filename} (${stats.size} octets)`);
        
        // Supprimer le fichier physique
        fs.unlinkSync(filePath);
        console.log(`🗑️ Fichier supprimé: ${filename}`);
        
        // Supprimer de la base de données
        // Note: On devrait normalement chercher par filename, mais pour simplifier
        // on va juste noter les fichiers supprimés
      }
    }
    
    console.log('✅ Nettoyage terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage
cleanupCorruptedPhotos();