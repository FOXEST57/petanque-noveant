import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'petanque_noveant',
};

async function resetPasswordClub2() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Définir un mot de passe temporaire
        const tempPassword = 'test123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(tempPassword, saltRounds);
        
        // Mettre à jour le mot de passe pour admin2@test.com
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ? AND club_id = 2',
            [passwordHash, 'admin2@test.com']
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Mot de passe temporaire défini avec succès !');
            console.log('📧 Email: admin2@test.com');
            console.log('🔑 Mot de passe temporaire: test123');
            console.log('🏠 Club: Pétanque Novéantaise (subdomain: noveant)');
            console.log('🌐 URL de test: http://localhost:5175?club=noveant');
        } else {
            console.log('❌ Aucun utilisateur trouvé avec cet email dans le club 2');
        }
        
        await connection.end();
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

resetPasswordClub2();