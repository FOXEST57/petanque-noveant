import fetch from 'node-fetch';

async function testCreditViaAPI() {
  console.log('=== TEST CRÉDIT MEMBRE VIA API ===\n');
  
  try {
    // 1. Tester l'authentification d'abord
    console.log('1. Test de connexion à l\'API...');
    
    const loginResponse = await fetch('http://localhost:3007/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'demo.localhost:3007'
      },
      body: JSON.stringify({
        email: 'admin2@test.com',
        password: 'test123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Impossible de se connecter à l\'API');
      console.log('Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie');
    
    // 2. Récupérer le solde initial
    console.log('\n2. Récupération du solde initial...');
    
    const soldeInitialResponse = await fetch('http://localhost:3007/api/caisse/solde', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Host': 'demo.localhost:3007'
      }
    });
    
    if (soldeInitialResponse.ok) {
      const soldeInitial = await soldeInitialResponse.json();
      console.log('✅ Solde initial récupéré:');
      console.log(`   - Fond de caisse: ${soldeInitial.fondCaisse} €`);
      console.log(`   - Solde de caisse: ${soldeInitial.soldeCaisse} €`);
      console.log(`   - Recettes: ${soldeInitial.recettes} €`);
    } else {
      console.log('❌ Impossible de récupérer le solde initial');
    }
    
    // 3. Récupérer la liste des membres
    console.log('\n3. Récupération de la liste des membres...');
    
    const membersResponse = await fetch('http://localhost:3007/api/members', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Host': 'demo.localhost:3007'
      }
    });
    
    if (!membersResponse.ok) {
      console.log('❌ Impossible de récupérer la liste des membres');
      return;
    }
    
    const membersData = await membersResponse.json();
    console.log('Structure de la réponse membres:', JSON.stringify(membersData, null, 2));
    
    // L'API retourne { success: true, data: [...] }
    const members = membersData.data || membersData.members || membersData;
    console.log(`✅ ${members?.length || 0} membres trouvés`);
    
    if (!members || members.length === 0) {
      console.log('❌ Aucun membre trouvé');
      return;
    }
    
    // Chercher le membre test ou prendre le premier avec un solde
    let membre = members.find(m => m.email === 'membre.test@example.com');
    if (!membre) {
      membre = members.find(m => m.solde && m.solde > 0);
    }
    if (!membre) {
      membre = members[0];
    }
    
    console.log(`✅ Membre trouvé: ${membre.prenom} ${membre.nom} (ID: ${membre.id})`);
    console.log(`   Email: ${membre.email || 'N/A'}`);
    console.log(`   Solde actuel: ${membre.solde || 0}€`);
    
    // 4. Effectuer un crédit membre
    const creditAmount = 25.50;
    console.log(`\n4. Crédit du compte membre (${creditAmount}€)...`);
    
    const creditResponse = await fetch(`http://localhost:3007/api/caisse/crediter-membre`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Host': 'demo.localhost:3007'
      },
      body: JSON.stringify({
        membreId: membre.id,
        montant: creditAmount,
        description: 'Test de crédit via API'
      })
    });
    
    if (!creditResponse.ok) {
      console.log('❌ Erreur lors du crédit');
      const errorText = await creditResponse.text();
      console.log('Error:', errorText);
      
      // Essayer de voir les routes disponibles pour les membres
      console.log('\nTentative de récupération des détails du membre...');
      const memberDetailResponse = await fetch(`http://localhost:3007/api/members/${membre.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Host': 'demo.localhost:3007'
        }
      });
      
      if (memberDetailResponse.ok) {
        const memberDetail = await memberDetailResponse.json();
        console.log('Détails du membre:', memberDetail);
      } else {
        console.log(`Erreur récupération détails: ${memberDetailResponse.status}`);
      }
      return;
    }
    
    const creditData = await creditResponse.json();
    console.log('✅ Crédit effectué:', creditData);
    
    // Vérifier le nouveau solde du membre
    const updatedMemberResponse = await fetch(`http://localhost:3007/api/members/${membre.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Host': 'demo.localhost:3007'
      }
    });
    
    if (updatedMemberResponse.ok) {
      const updatedMember = await updatedMemberResponse.json();
      console.log(`✅ Nouveau solde du membre: ${updatedMember.solde}€`);
    }
    
    // 5. Vérifier le nouveau solde
    console.log('\n5. Vérification du nouveau solde...');
    
    const soldeFinaleResponse = await fetch('http://localhost:3007/api/caisse/solde', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Host': 'demo.localhost:3007'
      }
    });
    
    if (soldeFinaleResponse.ok) {
      const soldeFinal = await soldeFinaleResponse.json();
      console.log('✅ Nouveau solde récupéré:');
      console.log(`   - Fond de caisse: ${soldeFinal.fondCaisse} €`);
      console.log(`   - Solde de caisse: ${soldeFinal.soldeCaisse} €`);
      console.log(`   - Recettes: ${soldeFinal.recettes} €`);
      
      console.log('\n=== CONCLUSION ===');
      if (soldeFinal.soldeCaisse > 0) {
        console.log('✅ Le solde de caisse a bien été mis à jour');
        console.log('✅ Le système fonctionne correctement');
      } else {
        console.log('❌ Le solde de caisse n\'a pas été mis à jour');
        console.log('❌ Il y a un problème dans le calcul ou l\'affichage');
      }
    } else {
      console.log('❌ Impossible de récupérer le nouveau solde');
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testCreditViaAPI();