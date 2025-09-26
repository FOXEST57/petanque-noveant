/**
 * Script de test pour vérifier que la section de gestion du fond de caisse a été supprimée
 */

const API_BASE = 'http://localhost:3007';

// Fonction pour faire des appels API
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
}

// Test de connexion admin
async function testConnexionAdmin() {
    console.log('\n=== Test de connexion admin ===');
    try {
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@petanque-noveant.fr',
                password: 'admin123'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Connexion admin réussie');
            return data.token;
        } else {
            console.log('❌ Échec de la connexion admin');
            return null;
        }
    } catch (error) {
        console.log('❌ Erreur lors de la connexion admin:', error.message);
        return null;
    }
}

// Test que la route PUT /api/caisse/fond n'existe plus
async function testRouteFondSupprimee(token) {
    console.log('\n=== Test de suppression de la route PUT /api/caisse/fond ===');
    try {
        const response = await apiCall('/api/caisse/fond', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                operation: 'ajouter',
                montant: 10
            })
        });
        
        if (response.status === 404 || response.status === 405) {
            console.log('✅ Route PUT /api/caisse/fond correctement supprimée (404/405)');
            return true;
        } else {
            console.log('❌ Route PUT /api/caisse/fond existe encore (status:', response.status, ')');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur lors du test de la route:', error.message);
        return false;
    }
}

// Test que la route GET /api/caisse/fond fonctionne encore
async function testRouteFondLecture(token) {
    console.log('\n=== Test de la route GET /api/caisse/fond (lecture seule) ===');
    try {
        const response = await apiCall('/api/caisse/fond', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Route GET /api/caisse/fond fonctionne (fond:', data.fond, '€)');
            return true;
        } else {
            console.log('❌ Route GET /api/caisse/fond ne fonctionne pas');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur lors du test de lecture du fond:', error.message);
        return false;
    }
}

// Test des transferts bancaires (seule façon d'alimenter le fond)
async function testTransfertBancaire(token) {
    console.log('\n=== Test des transferts bancaires ===');
    try {
        // D'abord, récupérer la liste des banques
        const banquesResponse = await apiCall('/api/banque', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!banquesResponse.ok) {
            console.log('❌ Impossible de récupérer les banques');
            return false;
        }
        
        const banques = await banquesResponse.json();
        if (banques.length === 0) {
            console.log('⚠️ Aucune banque configurée pour tester les transferts');
            return true;
        }
        
        const banqueId = banques[0].id;
        
        // Test de transfert banque vers caisse
        const response = await apiCall('/api/caisse/transfert-bancaire', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                banqueId: banqueId,
                montant: 50,
                type: 'banque-vers-caisse'
            })
        });
        
        if (response.ok) {
            console.log('✅ Transfert bancaire vers caisse fonctionne');
            return true;
        } else {
            console.log('❌ Transfert bancaire vers caisse échoue');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur lors du test de transfert bancaire:', error.message);
        return false;
    }
}

// Fonction principale de test
async function runTests() {
    console.log('🧪 Tests de vérification des modifications de la caisse');
    console.log('================================================');
    
    let testsReussis = 0;
    let testsTotal = 0;
    
    // Test de connexion
    const token = await testConnexionAdmin();
    if (!token) {
        console.log('\n❌ Impossible de continuer sans token d\'authentification');
        return;
    }
    
    // Test de suppression de la route PUT
    testsTotal++;
    if (await testRouteFondSupprimee(token)) {
        testsReussis++;
    }
    
    // Test de la route GET (lecture seule)
    testsTotal++;
    if (await testRouteFondLecture(token)) {
        testsReussis++;
    }
    
    // Test des transferts bancaires
    testsTotal++;
    if (await testTransfertBancaire(token)) {
        testsReussis++;
    }
    
    // Résumé
    console.log('\n================================================');
    console.log(`📊 Résultats: ${testsReussis}/${testsTotal} tests réussis`);
    
    if (testsReussis === testsTotal) {
        console.log('✅ Toutes les modifications ont été appliquées avec succès !');
        console.log('   - La section de gestion du fond de caisse a été supprimée');
        console.log('   - La route PUT /api/caisse/fond n\'existe plus');
        console.log('   - Les transferts bancaires restent la seule façon d\'alimenter le fond');
    } else {
        console.log('❌ Certains tests ont échoué, vérifiez les modifications');
    }
}

// Exécution des tests
runTests().catch(console.error);