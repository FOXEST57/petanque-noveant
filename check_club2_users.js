import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'petanque_noveant',
};

async function checkClub2Users() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Vérifier les clubs
        const [clubs] = await connection.execute('SELECT * FROM clubs ORDER BY id');
        console.log('=== CLUBS ===');
        clubs.forEach(club => {
            console.log(`ID: ${club.id}, Nom: ${club.nom}, Subdomain: ${club.subdomain}`);
        });
        
        // Vérifier les utilisateurs du club 2
        const [users] = await connection.execute('SELECT id, nom, prenom, email, role FROM users WHERE club_id = 2');
        console.log('\n=== UTILISATEURS DU CLUB 2 ===');
        users.forEach(user => {
            console.log(`ID: ${user.id}, Nom: ${user.prenom} ${user.nom}, Email: ${user.email}, Rôle: ${user.role}`);
        });
        
        await connection.end();
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

checkClub2Users();