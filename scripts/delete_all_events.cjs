const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration de la base de données MariaDB/MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

const uploadsPath = path.join(__dirname, '..', 'uploads', 'events');

// Fonction pour supprimer tous les événements
async function deleteAllEvents() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Compter les événements avant suppression
        const [eventsResult] = await connection.execute("SELECT COUNT(*) as count FROM events");
        const eventsCount = eventsResult[0].count;
        console.log(`Nombre d'événements à supprimer: ${eventsCount}`);
        
        // Compter les photos avant suppression
        const [photosResult] = await connection.execute("SELECT COUNT(*) as count FROM event_photos");
        const photosCount = photosResult[0].count;
        console.log(`Nombre de photos à supprimer: ${photosCount}`);
        
        // Supprimer toutes les photos de la table
        await connection.execute("DELETE FROM event_photos");
        console.log('✅ Toutes les photos supprimées de la table event_photos');
        
        // Supprimer tous les événements
        await connection.execute("DELETE FROM events");
        console.log('✅ Tous les événements supprimés de la table events');
        
        // Réinitialiser les compteurs auto-increment pour MySQL
        try {
            await connection.execute("ALTER TABLE events AUTO_INCREMENT = 1");
            console.log('✅ Compteur auto-increment réinitialisé pour events');
        } catch (err) {
            console.log('⚠️  Pas de compteur auto-increment à réinitialiser pour events');
        }
        
        try {
            await connection.execute("ALTER TABLE event_photos AUTO_INCREMENT = 1");
            console.log('✅ Compteur auto-increment réinitialisé pour event_photos');
        } catch (err) {
            console.log('⚠️  Pas de compteur auto-increment à réinitialiser pour event_photos');
        }
        
        return { eventsCount, photosCount };
        
    } catch (error) {
        console.error('Erreur lors de la suppression des événements:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Fonction pour supprimer tous les fichiers photos
function deleteAllPhotoFiles() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(uploadsPath)) {
            console.log('⚠️  Le dossier uploads/events/ n\'existe pas');
            return resolve(0);
        }
        
        fs.readdir(uploadsPath, (err, files) => {
            if (err) {
                console.error('Erreur lors de la lecture du dossier uploads/events/:', err);
                return reject(err);
            }
            
            const photoFiles = files.filter(file => 
                file.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
            );
            
            console.log(`Nombre de fichiers photos à supprimer: ${photoFiles.length}`);
            
            if (photoFiles.length === 0) {
                console.log('✅ Aucun fichier photo à supprimer');
                return resolve(0);
            }
            
            let deletedCount = 0;
            let errors = [];
            
            photoFiles.forEach(file => {
                const filePath = path.join(uploadsPath, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Erreur lors de la suppression de ${file}:`, err);
                        errors.push(err);
                    } else {
                        deletedCount++;
                        console.log(`✅ Fichier supprimé: ${file}`);
                    }
                    
                    // Vérifier si tous les fichiers ont été traités
                    if (deletedCount + errors.length === photoFiles.length) {
                        if (errors.length > 0) {
                            console.error(`⚠️  ${errors.length} erreurs lors de la suppression des fichiers`);
                        }
                        console.log(`✅ ${deletedCount} fichiers photos supprimés`);
                        resolve(deletedCount);
                    }
                });
            });
        });
    });
}

// Fonction principale
async function main() {
    console.log('🗑️  Début de la suppression de tous les événements...');
    
    try {
        const { eventsCount, photosCount } = await deleteAllEvents();
        console.log('\n📊 Résumé:');
        console.log(`- ${eventsCount} événements supprimés`);
        console.log(`- ${photosCount} photos supprimées de la base de données`);
        
        // Supprimer les fichiers photos physiques
        const deletedFiles = await deletePhotoFiles();
        console.log(`- ${deletedFiles} fichiers photos supprimés du disque`);
        console.log('\n✅ Suppression terminée avec succès!');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        process.exit(1);
    }
}

// Lancer le script
main();