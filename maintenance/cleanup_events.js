import { initDatabase, getEvents, deleteEvent, createEventPhoto } from '../src/lib/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function cleanupEvents() {
  try {
    console.log('=== NETTOYAGE DE LA BASE DE DONNÉES ===');
    
    // Initialiser la base de données
    await initDatabase();
    
    // Récupérer tous les événements
    const allEvents = await getEvents();
    console.log(`Nombre total d'événements: ${allEvents.length}`);
    
    if (allEvents.length <= 10) {
      console.log('Il y a déjà 10 événements ou moins. Ajout des photos seulement.');
    } else {
      // Trier les événements par ID pour garder les 10 premiers
      allEvents.sort((a, b) => a.id - b.id);
      
      // Garder les 10 premiers
      const eventsToKeep = allEvents.slice(0, 10);
      const eventsToDelete = allEvents.slice(10);
      
      console.log(`Événements à conserver: ${eventsToKeep.length}`);
      console.log(`Événements à supprimer: ${eventsToDelete.length}`);
      
      // Supprimer les événements en trop
      for (const event of eventsToDelete) {
        console.log(`Suppression de l'événement: ${event.title} (ID: ${event.id})`);
        await deleteEvent(event.id);
      }
    }
    
    // Récupérer les événements restants
    const remainingEvents = await getEvents();
    remainingEvents.sort((a, b) => a.id - b.id);
    
    console.log('\n=== AJOUT DES PHOTOS AUX ÉVÉNEMENTS ===');
    
    // Ajouter 6 photos à chaque événement restant
    for (const event of remainingEvents) {
      console.log(`Ajout de photos à l'événement: ${event.title} (ID: ${event.id})`);
      await addPhotosToEvent(event.id);
    }
    
    console.log('\n=== NETTOYAGE ET AJOUT DE PHOTOS TERMINÉS ===');
    console.log(`Événements conservés: ${remainingEvents.length}`);
    console.log(`Événements supprimés: ${allEvents.length - remainingEvents.length}`);
    
    console.log('\nÉvénements conservés avec photos:');
    remainingEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.date}) - ID: ${event.id}`);
    });
    
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
}

async function addPhotosToEvent(eventId) {
  const sourceDir = path.join(__dirname, '..', 'image');
  const targetDir = path.join(__dirname, '..', 'uploads', 'events');
  
  // S'assurer que le dossier de destination existe
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Liste des fichiers source
  const sourceFiles = [
    'petanque1.png',
    'petanque2.jpeg',
    'petanque3.jpeg',
    'petanque4.jpeg',
    'petanque5.jpeg',
    'petanque6.jpeg'
  ];
  
  for (let i = 0; i < 6; i++) {
    const sourceFile = sourceFiles[i];
    const sourcePath = path.join(sourceDir, sourceFile);
    
    if (fs.existsSync(sourcePath)) {
      const extension = path.extname(sourceFile);
      const timestamp = Date.now() + i;
      const newFileName = `event_${eventId}_photo_${i + 1}_${timestamp}${extension}`;
      const targetPath = path.join(targetDir, newFileName);
      
      // Copier le fichier
      fs.copyFileSync(sourcePath, targetPath);
      
      // Ajouter l'entrée dans la base de données
      await createEventPhoto({
        event_id: eventId,
        filename: newFileName,
        original_name: sourceFile,
        file_path: `/uploads/events/${newFileName}`,
        file_size: fs.statSync(targetPath).size,
        mime_type: `image/${extension.slice(1)}`
      });
      
      console.log(`  Photo ajoutée: ${newFileName}`);
    }
  }
}

cleanupEvents();