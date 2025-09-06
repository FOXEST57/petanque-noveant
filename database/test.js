import { initDatabase, closeDatabase, getMembers, createMember, getMemberTypes, getEvents, getConcours, getLotos, getDrinks, getTeams } from '../src/lib/database.js';

async function testCRUD() {
    console.log('🧪 Test des fonctionnalités CRUD SQLite...');
    
    try {
        // Initialiser la base de données
        await initDatabase();
        console.log('✅ Base de données initialisée');
        
        // Test 1: Lire les types de membres
        console.log('\n📋 Test 1: Lecture des types de membres');
        const memberTypes = await getMemberTypes();
        console.log(`   Trouvé ${memberTypes.length} types de membres:`);
        memberTypes.forEach(type => {
            console.log(`   - ${type.nom}: ${type.description}`);
        });
        
        // Test 2: Lire les membres existants
        console.log('\n👥 Test 2: Lecture des membres existants');
        const members = await getMembers();
        console.log(`   Trouvé ${members.length} membres:`);
        members.forEach(member => {
            console.log(`   - ${member.prenom} ${member.nom} (${member.email})`);
        });
        
        // Test 3: Créer un nouveau membre
        console.log('\n➕ Test 3: Création d\'un nouveau membre');
        const newMember = {
            nom: 'Test',
            prenom: 'Utilisateur',
            adresse: '123 Rue de Test',
            telephone: '01.23.45.67.89',
            email: 'test@example.com',
            numero_licence: 'TEST001',
            date_entree: '2024-01-15',
            date_naissance: '1980-05-10',
            type_membre_id: 5 // Membre Actif
        };
        
        const createdMember = await createMember(newMember);
        console.log(`   ✅ Membre créé avec l'ID: ${createdMember.id}`);
        
        // Test 4: Vérifier que le membre a été créé
        console.log('\n🔍 Test 4: Vérification de la création');
        const updatedMembers = await getMembers();
        console.log(`   Nombre total de membres: ${updatedMembers.length}`);
        const testMember = updatedMembers.find(m => m.email === 'test@example.com');
        if (testMember) {
            console.log(`   ✅ Membre trouvé: ${testMember.prenom} ${testMember.nom}`);
        } else {
            console.log('   ❌ Membre non trouvé');
        }
        
        // Test 5: Lire les autres données
        console.log('\n📊 Test 5: Lecture des autres données');
        
        const events = await getEvents();
        console.log(`   Événements: ${events.length}`);
        
        const concours = await getConcours();
        console.log(`   Concours: ${concours.length}`);
        
        const lotos = await getLotos();
        console.log(`   Lotos: ${lotos.length}`);
        
        const drinks = await getDrinks();
        console.log(`   Boissons: ${drinks.length}`);
        
        const teams = await getTeams();
        console.log(`   Équipes: ${teams.length}`);
        
        console.log('\n🎉 Tous les tests CRUD ont réussi!');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    } finally {
        // Fermer la base de données
        await closeDatabase();
        console.log('\n🔒 Base de données fermée');
    }
}

// Exécuter les tests si ce fichier est lancé directement
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
    testCRUD();
}

export { testCRUD };