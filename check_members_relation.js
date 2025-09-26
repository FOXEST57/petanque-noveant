import mysql from 'mysql2/promise';

async function checkMembersRelation() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'petanque_noveant'
    });

    try {
        console.log('=== VÉRIFICATION DES RELATIONS MEMBERS/USERS/CLUBS ===\n');

        // Vérifier les membres par club
        console.log('1. Membres par club:');
        const [membersByClub] = await connection.execute(`
            SELECT club_id, COUNT(*) as count 
            FROM members 
            GROUP BY club_id 
            ORDER BY club_id
        `);
        membersByClub.forEach(row => {
            console.log(`   Club ${row.club_id}: ${row.count} membres`);
        });

        // Vérifier les utilisateurs par club
        console.log('\n2. Utilisateurs par club:');
        const [usersByClub] = await connection.execute(`
            SELECT club_id, COUNT(*) as count 
            FROM users 
            WHERE club_id IS NOT NULL
            GROUP BY club_id 
            ORDER BY club_id
        `);
        usersByClub.forEach(row => {
            console.log(`   Club ${row.club_id}: ${row.count} utilisateurs`);
        });

        // Vérifier l'utilisateur connecté (admin2@test.com)
        console.log('\n3. Détails de l\'utilisateur admin2@test.com:');
        const [adminUser] = await connection.execute(`
            SELECT id, email, role, club_id 
            FROM users 
            WHERE email = 'admin2@test.com'
        `);
        if (adminUser.length > 0) {
            const user = adminUser[0];
            console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Club: ${user.club_id}`);
            
            // Vérifier les membres de ce club
            console.log(`\n4. Membres du club ${user.club_id}:`);
            const [clubMembers] = await connection.execute(`
                SELECT id, prenom, nom, email, club_id 
                FROM members 
                WHERE club_id = ?
                LIMIT 5
            `, [user.club_id]);
            
            if (clubMembers.length > 0) {
                clubMembers.forEach(member => {
                    console.log(`   - ID: ${member.id}, Nom: ${member.prenom} ${member.nom}, Email: ${member.email || 'N/A'}`);
                });
            } else {
                console.log('   Aucun membre trouvé pour ce club');
            }
        } else {
            console.log('   Utilisateur non trouvé');
        }

        // Vérifier la structure de la table members
        console.log('\n5. Structure de la table members:');
        const [columns] = await connection.execute(`
            DESCRIBE members
        `);
        columns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

checkMembersRelation();