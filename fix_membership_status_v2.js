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
        
        // Vérifier la structure de la table
        console.log('🔍 Vérification de la structure de la table...');
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM membership_requests WHERE Field = 'statut'
        `);
        
        if (columns.length > 0) {
            console.log('📋 Colonne statut trouvée:', columns[0]);
        }
        
        // Vérifier les demandes actuelles
        console.log('🔍 Vérification des demandes actuelles...');
        const [requests] = await connection.execute(`
            SELECT id, nom, prenom, email, statut, created_at 
            FROM membership_requests 
            ORDER BY id
        `);
        
        console.log(`📊 ${requests.length} demandes trouvées:`);
        requests.forEach(req => {
            console.log(`- ID: ${req.id}, Nom: ${req.nom} ${req.prenom}, Statut: "${req.statut}"`);
        });
        
        // Corriger les statuts vides ou NULL
        console.log('🔧 Correction des statuts...');
        const [updateResult] = await connection.execute(`
            UPDATE membership_requests 
            SET statut = 'en_attente' 
            WHERE statut IS NULL OR statut = '' OR statut = 'null'
        `);
        
        console.log(`✅ ${updateResult.affectedRows} demandes mises à jour`);
        
        // Vérification finale
        console.log('🔍 Vérification finale...');
        const [finalRequests] = await connection.execute(`
            SELECT id, nom, prenom, statut 
            FROM membership_requests 
            ORDER BY id
        `);
        
        console.log('📋 État final des demandes:');
        finalRequests.forEach(req => {
            console.log(`- ID: ${req.id}, Nom: ${req.nom} ${req.prenom}, Statut: "${req.statut}"`);
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