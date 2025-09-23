import mysql from 'mysql2/promise';

async function checkEvent32() {
    let connection;
    
    try {
        // Configuration de la base de données
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'petanque_noveant'
        });

        console.log('🔍 Vérification de l\'événement 32...');

        // Récupérer l'événement 32
        const [eventRows] = await connection.execute(
            'SELECT * FROM events WHERE id = ?',
            [32]
        );

        if (eventRows.length > 0) {
            const event = eventRows[0];
            console.log('📅 Événement trouvé:');
            console.log({
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date,
                photos: event.photos,
                created_at: event.created_at,
                updated_at: event.updated_at,
                club_id: event.club_id
            });

            // Récupérer les photos de la table event_photos
            const [photoRows] = await connection.execute(
                'SELECT * FROM event_photos WHERE event_id = ?',
                [32]
            );

            console.log(`📸 Photos dans event_photos pour l'événement 32: ${photoRows.length}`);
            photoRows.forEach((photo, index) => {
                console.log(`- ${photo.filename} (${photo.file_size} bytes)`);
            });

            // Analyser le champ photos JSON
            let photosArray = [];
            try {
                photosArray = event.photos ? JSON.parse(event.photos) : [];
            } catch (e) {
                console.log('❌ Erreur lors du parsing du JSON photos:', e.message);
            }
            
            console.log(`📊 Photos dans le champ JSON: ${photosArray.length}`);
            if (photosArray.length > 0) {
                photosArray.forEach((photo, index) => {
                    console.log(`- JSON Photo ${index + 1}:`, photo);
                });
            }

        } else {
            console.log('❌ Événement 32 non trouvé');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkEvent32();