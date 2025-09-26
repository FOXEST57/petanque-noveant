import mysql from 'mysql2/promise';

async function debugCaisse() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'petanque_noveant'
    });

    try {
        console.log('=== DEBUG CAISSE ===\n');

        const clubId = 2; // Club de admin2@test.com

        // 1. Vérifier le fond de caisse
        console.log('1. Fond de caisse:');
        const [clubRows] = await connection.execute(
            'SELECT id, nom, fond_caisse FROM clubs WHERE id = ?',
            [clubId]
        );
        
        if (clubRows.length > 0) {
            const club = clubRows[0];
            console.log(`   Club: ${club.nom}`);
            console.log(`   Fond de caisse: ${club.fond_caisse}€`);
        } else {
            console.log('   Club non trouvé');
        }

        // 2. Vérifier l'historique de la caisse
        console.log('\n2. Historique de la caisse (dernières 10 opérations):');
        const [historyRows] = await connection.execute(`
            SELECT id, type_operation, montant_encaissement, montant_retrait, 
                   description, date_operation, membre_id
            FROM caisse_historique 
            WHERE club_id = ? 
            ORDER BY date_operation DESC 
            LIMIT 10
        `, [clubId]);

        if (historyRows.length > 0) {
            historyRows.forEach(op => {
                console.log(`   - ${op.date_operation}: ${op.type_operation}`);
                console.log(`     Encaissement: ${op.montant_encaissement}€, Retrait: ${op.montant_retrait}€`);
                console.log(`     Description: ${op.description}`);
                console.log('');
            });
        } else {
            console.log('   Aucune opération trouvée');
        }

        // 3. Calculer les totaux
        console.log('3. Calculs des totaux:');
        const [totalsRows] = await connection.execute(`
            SELECT 
                COALESCE(SUM(montant_encaissement), 0) as total_encaissements,
                COALESCE(SUM(montant_retrait), 0) as total_retraits,
                COUNT(*) as nb_operations
            FROM caisse_historique 
            WHERE club_id = ? AND type_operation != 'credit'
        `, [clubId]);

        if (totalsRows.length > 0) {
            const totals = totalsRows[0];
            console.log(`   Total encaissements: ${totals.total_encaissements}€`);
            console.log(`   Total retraits: ${totals.total_retraits}€`);
            console.log(`   Nombre d'opérations: ${totals.nb_operations}`);
            
            const fondCaisse = clubRows.length > 0 ? (clubRows[0].fond_caisse || 0) : 0;
            const soldeCaisse = parseFloat(fondCaisse) + parseFloat(totals.total_encaissements) - parseFloat(totals.total_retraits);
            const recettes = soldeCaisse - parseFloat(fondCaisse);
            
            console.log(`\n   Calcul du solde:`);
            console.log(`   Fond (${fondCaisse}) + Encaissements (${totals.total_encaissements}) - Retraits (${totals.total_retraits}) = ${soldeCaisse}€`);
            console.log(`   Recettes: ${recettes}€`);
        }

        // 4. Vérifier toutes les opérations (y compris credit)
        console.log('\n4. Toutes les opérations (y compris credit):');
        const [allOpsRows] = await connection.execute(`
            SELECT 
                COALESCE(SUM(montant_encaissement), 0) as total_encaissements_all,
                COALESCE(SUM(montant_retrait), 0) as total_retraits_all,
                COUNT(*) as nb_operations_all
            FROM caisse_historique 
            WHERE club_id = ?
        `, [clubId]);

        if (allOpsRows.length > 0) {
            const allOps = allOpsRows[0];
            console.log(`   Total encaissements (toutes): ${allOps.total_encaissements_all}€`);
            console.log(`   Total retraits (toutes): ${allOps.total_retraits_all}€`);
            console.log(`   Nombre d'opérations (toutes): ${allOps.nb_operations_all}`);
        }

        // 5. Vérifier la structure de la table caisse_historique
        console.log('\n5. Structure de la table caisse_historique:');
        const [structure] = await connection.execute('DESCRIBE caisse_historique');
        structure.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

debugCaisse();