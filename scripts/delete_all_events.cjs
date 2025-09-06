const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '..', 'database', 'petanque.db');
const uploadsPath = path.join(__dirname, '..', 'uploads', 'events');

// Fonction pour supprimer tous les événements
function deleteAllEvents() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        db.serialize(() => {
            // Compter les événements avant suppression
            db.get("SELECT COUNT(*) as count FROM events", (err, row) => {
                if (err) {
                    console.error('Erreur lors du comptage des événements:', err);
                    db.close();
                    return reject(err);
                }
                const eventsCount = row.count;
                console.log(`Nombre d'événements à supprimer: ${eventsCount}`);
                
                // Compter les photos avant suppression
                db.get("SELECT COUNT(*) as count FROM event_photos", (err, row) => {
                    if (err) {
                        console.error('Erreur lors du comptage des photos:', err);
                        db.close();
                        return reject(err);
                    }
                    const photosCount = row.count;
                    console.log(`Nombre de photos à supprimer: ${photosCount}`);
                    
                    // Supprimer toutes les photos de la table
                    db.run("DELETE FROM event_photos", (err) => {
                        if (err) {
                            console.error('Erreur lors de la suppression des photos:', err);
                            db.close();
                            return reject(err);
                        }
                        console.log('✅ Toutes les photos supprimées de la table event_photos');
                        
                        // Supprimer tous les événements
                        db.run("DELETE FROM events", (err) => {
                            if (err) {
                                console.error('Erreur lors de la suppression des événements:', err);
                                db.close();
                                return reject(err);
                            }
                            console.log('✅ Tous les événements supprimés de la table events');
                            
                            // Réinitialiser les compteurs auto-increment
                            db.run("DELETE FROM sqlite_sequence WHERE name='events'", (err) => {
                                if (err) {
                                    console.log('⚠️  Pas de compteur auto-increment à réinitialiser pour events');
                                } else {
                                    console.log('✅ Compteur auto-increment réinitialisé pour events');
                                }
                                
                                db.run("DELETE FROM sqlite_sequence WHERE name='event_photos'", (err) => {
                                    if (err) {
                                        console.log('⚠️  Pas de compteur auto-increment à réinitialiser pour event_photos');
                                    } else {
                                        console.log('✅ Compteur auto-increment réinitialisé pour event_photos');
                                    }
                                    
                                    db.close();
                                    resolve({ eventsCount, photosCount });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
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

// Exécution principale
async function main() {
    try {
        console.log('🗑️  Début de la suppression de tous les événements...');
        
        // Supprimer les enregistrements de la base de données
        const { eventsCount, photosCount } = await deleteAllEvents();
        
        // Supprimer les fichiers photos
        const deletedFilesCount = await deleteAllPhotoFiles();
        
        console.log('\n📊 Résumé de la suppression:');
        console.log(`- Événements supprimés: ${eventsCount}`);
        console.log(`- Photos supprimées de la base: ${photosCount}`);
        console.log(`- Fichiers photos supprimés: ${deletedFilesCount}`);
        console.log('\n✅ Suppression terminée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        process.exit(1);
    }
}

// Lancer le script
main();