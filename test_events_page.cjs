const API_BASE = 'http://localhost:3002/api';

async function testEventsPage() {
  console.log('🧪 Test de la page événements...\n');

  try {
    const fetch = (await import('node-fetch')).default;
    
    // 1. Connexion avec l'utilisateur test
    console.log('1. Connexion...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
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

    const token = loginData.token;
    console.log('✅ Connexion réussie\n');

    // 2. Test de l'API events
    console.log('2. Test /api/events...');
    const eventsResponse = await fetch(`${API_BASE}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Events status:', eventsResponse.status);
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      console.log('Events response:', JSON.stringify(eventsData, null, 2));
      
      if (eventsData.success && eventsData.data) {
        console.log(`✅ ${eventsData.data.length} événements trouvés`);
      } else {
        console.log('⚠️ Format de réponse inattendu');
      }
    } else {
      const errorData = await eventsResponse.text();
      console.log('❌ Erreur API events:', errorData);
    }

    // 3. Test sans authentification (comme le fait la page)
    console.log('\n3. Test sans authentification...');
    const publicEventsResponse = await fetch(`${API_BASE}/events?isConnected=false&userRole=public`);
    console.log('Public events status:', publicEventsResponse.status);
    
    if (publicEventsResponse.ok) {
      const publicEventsData = await publicEventsResponse.json();
      console.log('Public events response:', JSON.stringify(publicEventsData, null, 2));
    } else {
      const errorData = await publicEventsResponse.text();
      console.log('❌ Erreur API events publics:', errorData);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testEventsPage();