import mysql from 'mysql2/promise';

async function createTestMember() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'petanque_noveant'
    });

    try {
        console.log('=== CRÉATION D\'UN MEMBRE TEST ===\n');

        // Vérifier d'abord si le membre test existe déjà
        const [existingMember] = await connection.execute(`
            SELECT id, nom, prenom, solde 
            FROM members 
            WHERE email = 'membre.test@example.com'
        `);

        if (existingMember.length > 0) {
            console.log('Le membre test existe déjà:');
            const member = existingMember[0];
            console.log(`   ID: ${member.id}, Nom: ${member.prenom} ${member.nom}, Solde: ${member.solde}€`);
            
            // Mettre à jour le solde s'il est null ou 0
            if (!member.solde || member.solde === 0) {
                await connection.execute(`
                    UPDATE members 
                    SET solde = 50.00 
                    WHERE id = ?
                `, [member.id]);
                console.log('   Solde mis à jour à 50.00€');
            }
        } else {
            // Créer un nouveau membre test dans le club 2 (club de admin2@test.com)
            const [result] = await connection.execute(`
                INSERT INTO members (
                    nom, prenom, email, telephone, club_id, solde, 
                    date_entree, created_at, updated_at
                ) VALUES (
                    'Test', 'Membre', 'membre.test@example.com', '0123456789', 2, 50.00,
                    CURDATE(), NOW(), NOW()
                )
            `);

            console.log(`Nouveau membre test créé avec l'ID: ${result.insertId}`);
            console.log('   Nom: Membre Test');
            console.log('   Email: membre.test@example.com');
            console.log('   Club: 2');
            console.log('   Solde initial: 50.00€');
        }

        // Vérifier les membres du club 2 avec leurs soldes
        console.log('\n=== MEMBRES DU CLUB 2 AVEC SOLDES ===');
        const [clubMembers] = await connection.execute(`
            SELECT id, prenom, nom, email, solde 
            FROM members 
            WHERE club_id = 2 
            ORDER BY nom, prenom
        `);

        clubMembers.forEach(member => {
            const solde = member.solde ? `${member.solde}€` : 'null';
            console.log(`   - ID: ${member.id}, Nom: ${member.prenom} ${member.nom}, Solde: ${solde}`);
        });

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

createTestMember();