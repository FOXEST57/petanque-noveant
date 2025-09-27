import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3007';

async function testerTransfertDirect() {
  console.log('🧪 Test direct de l\'endpoint de transfert');
  console.log('============================================\n');
  
  try {
    // 1. Connexion
    console.log('1. 🔐 Connexion...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie\n');
    
    // 2. État de la caisse AVANT le transfert
    console.log('2. 📊 État de la caisse AVANT le transfert:');
    const caisseResponse = await fetch(`${API_BASE}/api/caisse/solde/2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const caisseData = await caisseResponse.json();
    console.log(`   - Fond de caisse: ${caisseData.fond_caisse}€`);
    console.log(`   - Recettes: ${caisseData.recettes}€`);
    console.log(`   - Total: ${caisseData.solde_total}€\n`);
    
    // 3. Test du transfert de 100€
    console.log('3. 💸 Test transfert de 100€ vers la banque...');
    const transfertResponse = await fetch(`${API_BASE}/api/caisse/transfert-bancaire`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        clubId: 2,
        banqueId: 1,
        montant: 100,
        typeTransfert: 'caisse-vers-banque'
      })
    });
    
    if (!transfertResponse.ok) {
      const errorText = await transfertResponse.text();
      throw new Error(`Erreur transfert: ${transfertResponse.status} - ${errorText}`);
    }
    
    const transfertData = await transfertResponse.json();
    console.log('✅ Transfert effectué');
    console.log(`   - Nouveau solde: ${transfertData.nouveau_solde}€\n`);
    
    // 4. État de la caisse APRÈS le transfert
    console.log('4. 📊 État de la caisse APRÈS le transfert:');
    const caisseResponse2 = await fetch(`${API_BASE}/api/caisse/solde/2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const caisseData2 = await caisseResponse2.json();
    console.log(`   - Fond de caisse: ${caisseData2.fond_caisse}€`);
    console.log(`   - Recettes: ${caisseData2.recettes}€`);
    console.log(`   - Total: ${caisseData2.solde_total}€\n`);
    
    // 5. Analyse des changements
    console.log('5. 🔍 Analyse des changements:');
    const changementFond = caisseData2.fond_caisse - caisseData.fond_caisse;
    const changementRecettes = caisseData2.recettes - caisseData.recettes;
    
    console.log(`   - Changement fond de caisse: ${changementFond}€`);
    console.log(`   - Changement recettes: ${changementRecettes}€`);
    
    if (changementFond === 0 && changementRecettes === -100) {
      console.log('   ✅ CORRECT: Transfert entièrement sur recettes');
    } else if (changementFond < 0 && changementRecettes <= 0) {
      console.log('   ❌ PROBLÈME: Le fond de caisse a été débité');
    } else {
      console.log('   ❓ INATTENDU: Comportement non prévu');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testerTransfertDirect().catch(console.error);