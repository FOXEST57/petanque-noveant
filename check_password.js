import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function checkPassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'petanque_noveant'
    });

    try {
        console.log('=== VÉRIFICATION DES MOTS DE PASSE ===\n');

        // Récupérer les utilisateurs avec leurs mots de passe
        const [users] = await connection.execute('SELECT id, email, password_hash FROM users WHERE email = "admin2@test.com"');
        
        if (users.length === 0) {
            console.log('Aucun utilisateur trouvé avec cet email');
            return;
        }

        const user = users[0];
        console.log(`Utilisateur trouvé: ${user.email}`);
        console.log(`Hash du mot de passe: ${user.password_hash}`);

        // Tester différents mots de passe
        const passwords = ['password123', 'admin123', 'test123', '123456', 'admin'];
        
        for (const password of passwords) {
            try {
                const isValid = await bcrypt.compare(password, user.password_hash);
                console.log(`Mot de passe "${password}": ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
                if (isValid) {
                    console.log(`\n🎉 Mot de passe trouvé: "${password}"`);
                    break;
                }
            } catch (error) {
                console.log(`Erreur lors de la vérification de "${password}": ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

checkPassword();