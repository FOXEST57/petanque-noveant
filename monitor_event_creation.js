import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let connection;
let lastEventCount = 0;
let lastPhotoCount = 0;
let monitoring = true;

async function initMonitoring() {
  try {
    console.log('🔍 Initialisation de la surveillance...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });
    
    // Compter les événements actuels
    const [events] = await connection.execute('SELECT COUNT(*) as count FROM events');
    lastEventCount = events[0].count;
    
    // Compter les photos actuelles
    const [photos] = await connection.execute('SELECT COUNT(*) as count FROM event_photos');
    lastPhotoCount = photos[0].count;
    
    console.log(`📊 État initial:`);
    console.log(`   - Événements: ${lastEventCount}`);
    console.log(`   - Photos: ${lastPhotoCount}`);
    console.log('');
    console.log('🟢 SURVEILLANCE ACTIVE - Vous pouvez appuyer sur AJOUTER');
    console.log('');
    
    // Démarrer la surveillance
    startMonitoring();
    
  } catch (error) {
    console.error('❌ Erreur d\'initialisation:', error);
  }
}

async function startMonitoring() {
  const interval = setInterval(async () => {
    if (!monitoring) {
      clearInterval(interval);
      return;
    }
    
    try {
      // Vérifier les nouveaux événements
      const [events] = await connection.execute('SELECT COUNT(*) as count FROM events');
      const currentEventCount = events[0].count;
      
      if (currentEventCount > lastEventCount) {
        console.log('🎉 NOUVEL ÉVÉNEMENT DÉTECTÉ !');
        
        // Récupérer le dernier événement créé
        const [latestEvent] = await connection.execute(
          'SELECT * FROM events ORDER BY id DESC LIMIT 1'
        );
        
        if (latestEvent.length > 0) {
          const event = latestEvent[0];
          console.log(`📋 Détails de l'événement:`);
          console.log(`   - ID: ${event.id}`);
          console.log(`   - Titre: "${event.title}"`);
          console.log(`   - Date: ${event.date}`);
          console.log(`   - Club: ${event.club_id}`);
          console.log(`   - Description: ${event.description || 'Aucune'}`);
          console.log(`   - Photos (JSON): ${JSON.stringify(event.photos)}`);
        }
        
        lastEventCount = currentEventCount;
      }
      
      // Vérifier les nouvelles photos
      const [photos] = await connection.execute('SELECT COUNT(*) as count FROM event_photos');
      const currentPhotoCount = photos[0].count;
      
      if (currentPhotoCount > lastPhotoCount) {
        console.log('📸 NOUVELLE PHOTO DÉTECTÉE !');
        
        // Récupérer la dernière photo
        const [latestPhoto] = await connection.execute(
          'SELECT * FROM event_photos ORDER BY id DESC LIMIT 1'
        );
        
        if (latestPhoto.length > 0) {
          const photo = latestPhoto[0];
          console.log(`📋 Détails de la photo:`);
          console.log(`   - ID: ${photo.id}`);
          console.log(`   - Événement ID: ${photo.event_id}`);
          console.log(`   - Nom de fichier: ${photo.filename}`);
          console.log(`   - Nom original: ${photo.original_name}`);
          console.log(`   - Chemin: ${photo.file_path}`);
          console.log(`   - Taille: ${photo.file_size} bytes`);
          console.log(`   - Type MIME: ${photo.mime_type}`);
          
          // Vérifier si le fichier existe physiquement
          const fullPath = path.join(process.cwd(), 'uploads', 'events', photo.filename);
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log(`   - ✅ Fichier physique trouvé (${stats.size} bytes)`);
          } else {
            console.log(`   - ❌ Fichier physique non trouvé: ${fullPath}`);
          }
        }
        
        lastPhotoCount = currentPhotoCount;
      }
      
    } catch (error) {
      console.error('❌ Erreur de surveillance:', error);
    }
  }, 1000); // Vérifier toutes les secondes
}

// Gérer l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt de la surveillance...');
  monitoring = false;
  if (connection) {
    await connection.end();
  }
  process.exit(0);
});

// Démarrer la surveillance
initMonitoring();