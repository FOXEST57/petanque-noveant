import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'petanque_noveant'
};

async function fixMembershipStatus() {
    let connection;
    
    try {
        console.log('🔄 Connexion à la base de données...');
        connection = await mysql.createConnection(dbConfig);
        
        // Vérifier les demandes sans statut
        console.log('🔍 Vérification des demandes sans statut...');
        const [requests] = await connection.execute(
            'SELECT id, nom, prenom, email, statut FROM membership_requests WHERE statut IS NULL OR statut = ""'
        );
        
        console.log(`Demandes trouvées sans statut: ${requests.length}`);
        
        if (requests.length > 0) {
            console.log('Demandes à corriger:');
            requests.forEach(req => {
                console.log(`- ID: ${req.id}, Nom: ${req.nom} ${req.prenom}, Email: ${req.email}, Statut actuel: "${req.statut}"`);
            });
            
            // Mettre à jour toutes les demandes sans statut à 'en_attente'
            console.log('🔧 Mise à jour des statuts...');
            const [result] = await connection.execute(
                'UPDATE membership_requests SET statut = "en_attente" WHERE statut IS NULL OR statut = ""'
            );
            
            console.log(`✅ ${result.affectedRows} demandes mises à jour avec le statut "en_attente"`);
        } else {
            console.log('✅ Toutes les demandes ont déjà un statut défini');
        }
        
        // Vérifier le résultat
        console.log('🔍 Vérification finale...');
        const [finalCheck] = await connection.execute(
            'SELECT id, nom, prenom, email, statut FROM membership_requests'
        );
        
        console.log('État final des demandes:');
        finalCheck.forEach(req => {
            console.log(`- ID: ${req.id}, Nom: ${req.nom} ${req.prenom}, Statut: ${req.statut}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connexion fermée');
        }
    }
}

fixMembershipStatus();