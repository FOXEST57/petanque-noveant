import fetch from 'node-fetch';

async function testSuperAdminFlow() {
  try {
    console.log('=== Test du flux super admin ===');
    
    // 1. Login normal
    console.log('1. Connexion super admin...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Réponse login:', JSON.stringify(loginData, null, 2));
    
    if (loginData.needsClubSelection) {
      console.log('\n2. Sélection du club 2...');
      const clubResponse = await fetch('http://localhost:3002/api/auth/super-admin-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.tempToken}`
        },
        body: JSON.stringify({ clubId: 2 })
      });
      
      const clubData = await clubResponse.json();
      console.log('Réponse sélection club:', JSON.stringify(clubData, null, 2));
      
      if (clubData.success) {
        console.log('\n3. Test des paramètres du site...');
        const settingsResponse = await fetch('http://localhost:3002/api/site-settings', {
          headers: { 
            'Authorization': `Bearer ${clubData.token}`
          }
        });
        
        const settingsData = await settingsResponse.json();
        console.log('Paramètres du site:', JSON.stringify(settingsData, null, 2));
        
        // Décoder le token pour voir son contenu
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.decode(clubData.token);
        console.log('\nContenu du token final:', JSON.stringify(decoded, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSuperAdminFlow();