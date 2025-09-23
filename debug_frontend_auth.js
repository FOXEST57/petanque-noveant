// Script pour déboguer l'authentification frontend
// À exécuter dans la console du navigateur

console.log('🔍 Debug de l\'authentification frontend');

// 1. Vérifier le token dans localStorage
const token = localStorage.getItem('auth_token');
console.log('📋 Token dans localStorage:', token ? 'Présent' : 'Absent');

if (token) {
    console.log('📋 Token:', token);
    
    // 2. Décoder le token JWT (partie payload)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📋 Payload du token:', payload);
        console.log('📋 User ID:', payload.userId);
        console.log('📋 Club ID:', payload.clubId);
        console.log('📋 Email:', payload.email);
        console.log('📋 Role:', payload.role);
        
        // 3. Vérifier l'expiration
        const now = Math.floor(Date.now() / 1000);
        const exp = payload.exp;
        console.log('📋 Token expire à:', new Date(exp * 1000));
        console.log('📋 Maintenant:', new Date(now * 1000));
        console.log('📋 Token expiré:', now > exp ? 'OUI' : 'NON');
        
    } catch (e) {
        console.error('❌ Erreur lors du décodage du token:', e);
    }
}

// 4. Tester une requête authentifiée
async function testAuthenticatedRequest() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/events`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📋 Test requête authentifiée:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Erreur:', errorText);
        } else {
            console.log('✅ Requête authentifiée réussie');
        }
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

if (token) {
    testAuthenticatedRequest();
}

console.log('📋 Pour tester, copiez ce code dans la console du navigateur sur la page admin');