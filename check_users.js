import mysql from 'mysql2/promise';

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'petanque_noveant'
    });

    try {
        console.log('=== VÉRIFICATION DES UTILISATEURS ===\n');

        // Vérifier les utilisateurs
        const [users] = await connection.execute('SELECT id, email, role, club_id FROM users LIMIT 10');
        console.log('Utilisateurs trouvés:', users.length);
        if (users.length > 0) {
            console.log('Premiers utilisateurs:');
            users.forEach(user => {
                console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Club: ${user.club_id}`);
            });
        }

        // Vérifier les clubs
        const [clubs] = await connection.execute('SELECT id, nom, subdomain FROM clubs LIMIT 5');
        console.log('\nClubs trouvés:', clubs.length);
        if (clubs.length > 0) {
            console.log('Premiers clubs:');
            clubs.forEach(club => {
                console.log(`- ID: ${club.id}, Nom: ${club.nom}, Subdomain: ${club.subdomain}`);
            });
        }

        // Vérifier les membres
        const [members] = await connection.execute('SELECT id, prenom, nom FROM members LIMIT 5');
        console.log('\nMembres trouvés:', members.length);
        if (members.length > 0) {
            console.log('Premiers membres:');
            members.forEach(member => {
                console.log(`- ID: ${member.id}, Nom: ${member.prenom} ${member.nom}`);
            });
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsers();