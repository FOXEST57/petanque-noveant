import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

// Configuration des tests
const API_BASE = 'http://localhost:3002/api';
let testTokens = {};

console.log('🧪 Démarrage des tests d\'isolation des clubs...\n');

// Fonction utilitaire pour faire des requêtes API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

// Étape 1: Créer des utilisateurs de test
async function createTestUsers() {
  console.log('📝 Étape 1: Création des utilisateurs de test...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Vérifier que les clubs existent
    const [clubs] = await connection.execute('SELECT id, nom FROM clubs ORDER BY id LIMIT 2');
    if (clubs.length < 2) {
      throw new Error('Il faut au moins 2 clubs pour les tests');
    }
    
    console.log(`   Clubs trouvés: ${clubs.map(c => `${c.id}: ${c.nom}`).join(', ')}`);
    
    // Supprimer les utilisateurs de test existants
    await connection.execute('DELETE FROM users WHERE email LIKE "test_club%@test.com"');
    
    // Créer les utilisateurs de test
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUsers = [
      {
        email: 'test_club1@test.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'Club1',
        club_id: clubs[0].id,
        role: 'admin'
      },
      {
        email: 'test_club2@test.com',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'Club2',
        club_id: clubs[1].id,
        role: 'admin'
      }
    ];
    
    for (const user of testUsers) {
      await connection.execute(
        'INSERT INTO users (email, password_hash, nom, prenom, club_id, role, statut) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.email, user.password, user.last_name, user.first_name, user.club_id, user.role, 'actif']
      );
      console.log(`   ✅ Utilisateur créé: ${user.email} (Club ${user.club_id})`);
    }
    
    return testUsers;
  } finally {
    await connection.end();
  }
}

// Étape 2: Authentifier les utilisateurs de test
async function authenticateTestUsers(testUsers) {
  console.log('\n🔐 Étape 2: Authentification des utilisateurs de test...');
  
  for (const user of testUsers) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: 'test123'
      })
    });
    
    if (response.status === 200 && response.data.token) {
      testTokens[user.club_id] = response.data.token;
      console.log(`   ✅ Authentification réussie pour Club ${user.club_id}`);
    } else {
      throw new Error(`Échec de l'authentification pour ${user.email}: ${JSON.stringify(response.data)}`);
    }
  }
}

// Étape 3: Tester l'isolation des membres
async function testMembersIsolation() {
  console.log('\n👥 Étape 3: Test de l\'isolation des membres...');
  
  // Récupérer les membres pour chaque club
  for (const [clubId, token] of Object.entries(testTokens)) {
    const response = await apiRequest('/members', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const members = response.data.data || [];
      console.log(`   Club ${clubId}: ${members.length} membres trouvés`);
      
      // Vérifier que tous les membres appartiennent au bon club
      const wrongClubMembers = members.filter(m => m.club_id && m.club_id != clubId);
      if (wrongClubMembers.length > 0) {
        console.log(`   ❌ ERREUR: ${wrongClubMembers.length} membres d'autres clubs trouvés!`);
        return false;
      } else {
        console.log(`   ✅ Isolation correcte pour le Club ${clubId}`);
      }
    } else {
      console.log(`   ❌ Erreur API pour Club ${clubId}: ${response.status}`);
      return false;
    }
  }
  
  return true;
}

// Étape 4: Tester l'isolation des événements
async function testEventsIsolation() {
  console.log('\n📅 Étape 4: Test de l\'isolation des événements...');
  
  for (const [clubId, token] of Object.entries(testTokens)) {
    const response = await apiRequest('/events', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const events = response.data.data || [];
      console.log(`   Club ${clubId}: ${events.length} événements trouvés`);
      
      // Vérifier que tous les événements appartiennent au bon club
      const wrongClubEvents = events.filter(e => e.club_id && e.club_id != clubId);
      if (wrongClubEvents.length > 0) {
        console.log(`   ❌ ERREUR: ${wrongClubEvents.length} événements d'autres clubs trouvés!`);
        return false;
      } else {
        console.log(`   ✅ Isolation correcte pour le Club ${clubId}`);
      }
    } else {
      console.log(`   ❌ Erreur API pour Club ${clubId}: ${response.status}`);
      return false;
    }
  }
  
  return true;
}

// Étape 5: Tester l'isolation des équipes
async function testTeamsIsolation() {
  console.log('\n🏆 Étape 5: Test de l\'isolation des équipes...');
  
  for (const [clubId, token] of Object.entries(testTokens)) {
    const response = await apiRequest('/teams', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const teams = response.data.data || [];
      console.log(`   Club ${clubId}: ${teams.length} équipes trouvées`);
      
      // Vérifier que toutes les équipes appartiennent au bon club
      const wrongClubTeams = teams.filter(t => t.club_id && t.club_id != clubId);
      if (wrongClubTeams.length > 0) {
        console.log(`   ❌ ERREUR: ${wrongClubTeams.length} équipes d'autres clubs trouvées!`);
        return false;
      } else {
        console.log(`   ✅ Isolation correcte pour le Club ${clubId}`);
      }
    } else {
      console.log(`   ❌ Erreur API pour Club ${clubId}: ${response.status}`);
      return false;
    }
  }
  
  return true;
}

// Étape 6: Tester l'isolation du carousel
async function testCarouselIsolation() {
  console.log('\n🎠 Étape 6: Test de l\'isolation du carousel...');
  
  for (const [clubId, token] of Object.entries(testTokens)) {
    const response = await apiRequest('/carousel', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const images = response.data.data || [];
      console.log(`   Club ${clubId}: ${images.length} images carousel trouvées`);
      
      // Vérifier que toutes les images appartiennent au bon club
      const wrongClubImages = images.filter(i => i.club_id && i.club_id != clubId);
      if (wrongClubImages.length > 0) {
        console.log(`   ❌ ERREUR: ${wrongClubImages.length} images d'autres clubs trouvées!`);
        return false;
      } else {
        console.log(`   ✅ Isolation correcte pour le Club ${clubId}`);
      }
    } else {
      console.log(`   ❌ Erreur API pour Club ${clubId}: ${response.status}`);
      return false;
    }
  }
  
  return true;
}

// Étape 7: Tester l'isolation des boissons
async function testDrinksIsolation() {
  console.log('\n🍺 Étape 7: Test de l\'isolation des boissons...');
  
  for (const [clubId, token] of Object.entries(testTokens)) {
    const response = await apiRequest('/drinks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const drinks = response.data.data || [];
      console.log(`   Club ${clubId}: ${drinks.length} boissons trouvées`);
      
      // Vérifier que toutes les boissons appartiennent au bon club
      const wrongClubDrinks = drinks.filter(d => d.club_id && d.club_id != clubId);
      if (wrongClubDrinks.length > 0) {
        console.log(`   ❌ ERREUR: ${wrongClubDrinks.length} boissons d'autres clubs trouvées!`);
        return false;
      } else {
        console.log(`   ✅ Isolation correcte pour le Club ${clubId}`);
      }
    } else {
      console.log(`   ❌ Erreur API pour Club ${clubId}: ${response.status}`);
      return false;
    }
  }
  
  return true;
}

// Étape 8: Tester la sécurité des API (tentatives d'accès inter-clubs)
async function testApiSecurity() {
  console.log('\n🔒 Étape 8: Test de la sécurité des API...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Récupérer des IDs d'éléments de différents clubs
    const [members] = await connection.execute('SELECT id, club_id FROM members LIMIT 10');
    const [events] = await connection.execute('SELECT id, club_id FROM events LIMIT 10');
    
    if (members.length === 0 || events.length === 0) {
      console.log('   ⚠️  Pas assez de données pour tester la sécurité');
      return true;
    }
    
    // Tenter d'accéder aux données d'un autre club
    const club1Token = testTokens[Object.keys(testTokens)[0]];
    const club2Token = testTokens[Object.keys(testTokens)[1]];
    
    if (!club1Token || !club2Token) {
      console.log('   ⚠️  Tokens manquants pour le test de sécurité');
      return true;
    }
    
    // Test: Club 1 essaie d'accéder aux données du Club 2
    let securityTestsPassed = 0;
    let totalSecurityTests = 0;
    
    // Test avec les membres
    for (const member of members.slice(0, 3)) {
      totalSecurityTests++;
      const response = await apiRequest(`/members/${member.id}`, {
        headers: { 'Authorization': `Bearer ${club1Token}` }
      });
      
      if (member.club_id == Object.keys(testTokens)[0]) {
        // Devrait réussir (même club)
        if (response.status === 200) {
          securityTestsPassed++;
        }
      } else {
        // Devrait échouer (club différent)
        if (response.status === 403 || response.status === 404) {
          securityTestsPassed++;
        }
      }
    }
    
    console.log(`   Tests de sécurité: ${securityTestsPassed}/${totalSecurityTests} réussis`);
    return securityTestsPassed === totalSecurityTests;
    
  } finally {
    await connection.end();
  }
}

// Fonction principale
async function runAllTests() {
  try {
    console.log('🚀 Début des tests d\'isolation des clubs\n');
    
    // Étape 1: Créer les utilisateurs de test
    const testUsers = await createTestUsers();
    
    // Étape 2: Authentifier les utilisateurs
    await authenticateTestUsers(testUsers);
    
    // Étape 3-7: Tests d'isolation
    const tests = [
      { name: 'Membres', fn: testMembersIsolation },
      { name: 'Événements', fn: testEventsIsolation },
      { name: 'Équipes', fn: testTeamsIsolation },
      { name: 'Carousel', fn: testCarouselIsolation },
      { name: 'Boissons', fn: testDrinksIsolation }
    ];
    
    let passedTests = 0;
    for (const test of tests) {
      const result = await test.fn();
      if (result) passedTests++;
    }
    
    // Étape 8: Test de sécurité
    const securityResult = await testApiSecurity();
    if (securityResult) passedTests++;
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('==================');
    console.log(`Tests réussis: ${passedTests}/${tests.length + 1}`);
    
    if (passedTests === tests.length + 1) {
      console.log('🎉 TOUS LES TESTS SONT PASSÉS! L\'isolation des clubs fonctionne correctement.');
    } else {
      console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ. Vérifiez les logs ci-dessus.');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Lancer les tests
runAllTests();