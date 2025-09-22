async function testAdminAPIs() {
  const fetch = (await import('node-fetch')).default;
  try {
    console.log('=== Test des APIs Admin ===');
    
    // 1. Login
    console.log('1. Connexion...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_club1@test.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('❌ Erreur de connexion - pas de token');
      return;
    }
    
    console.log('✅ Connexion réussie');
    
    // 2. Test events/count
    console.log('\n2. Test events/count...');
    const eventsResponse = await fetch('http://localhost:3002/api/events/count', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('Events count status:', eventsResponse.status);
    const eventsData = await eventsResponse.json();
    console.log('Events count response:', eventsData);
    
    // 3. Test teams
    console.log('\n3. Test teams...');
    const teamsResponse = await fetch('http://localhost:3002/api/teams', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('Teams status:', teamsResponse.status);
    const teamsData = await teamsResponse.json();
    console.log('Teams response:', teamsData);
    
    // 4. Test membership requests
    console.log('\n4. Test membership requests...');
    const membershipResponse = await fetch('http://localhost:3002/api/membership/requests?status=en_attente', {
      headers: { 
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Membership requests status:', membershipResponse.status);
    const membershipData = await membershipResponse.json();
    console.log('Membership requests response:', membershipData);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAdminAPIs();