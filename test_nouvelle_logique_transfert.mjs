import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3007';

// Fonction pour se connecter et obtenir un token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur de connexion: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Connexion réussie');
    return data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    throw error;
  }
}

// Fonction pour obtenir l'état actuel de la caisse
async function getEtatCaisse(token) {
  try {
    const response = await fetch(`${API_BASE}/api/caisse/etat`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de l'état: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'état:', error.message);
    throw error;
  }
}

// Fonction pour effectuer un transfert
async function effectuerTransfert(token, montant, type = 'caisse-vers-banque') {
  try {
    const response = await fetch(`${API_BASE}/api/caisse/transfert-bancaire`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        montant: montant,
        type: type,
        banque_id: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur de transfert: ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur de transfert:', error.message);
    throw error;
  }
}

// Fonction pour vérifier les historiques
async function verifierHistoriques(token) {
  try {
    // Vérifier caisse_historique
    const responseCaisse = await fetch(`${API_BASE}/api/caisse/historique`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Vérifier fond_caisse_operations (endpoint à créer si nécessaire)
    console.log('\n📊 Vérification des historiques...');
    
    if (responseCaisse.ok) {
      const dataCaisse = await responseCaisse.json();
      console.log('📋 Dernières opérations caisse_historique:');
      if (dataCaisse.operations && dataCaisse.operations.length > 0) {
        dataCaisse.operations.slice(-3).forEach(op => {
          console.log(`  - ${op.date_operation}: ${op.type_operation} ${op.montant_encaissement || op.montant_retrait}€ - ${op.description}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des historiques:', error.message);
  }
}

// Tests principaux
async function testerNouvelleLogique() {
  console.log('🧪 Test de la nouvelle logique de transfert caisse vers banque\n');

  try {
    // Connexion
    const token = await login();

    // État initial
    console.log('\n📊 État initial de la caisse:');
    const etatInitial = await getEtatCaisse(token);
    console.log(`  - Fond de caisse: ${etatInitial.fondCaisse}€`);
    console.log(`  - Solde total: ${etatInitial.soldeCaisse}€`);
    const recettesInitiales = parseFloat(etatInitial.soldeCaisse) - parseFloat(etatInitial.fondCaisse);
    console.log(`  - Recettes disponibles: ${recettesInitiales.toFixed(2)}€`);

    // Test 1: Transfert entièrement sur recettes (si recettes >= montant)
    console.log('\n🧪 Test 1: Transfert de 50€ (sur recettes uniquement)');
    if (recettesInitiales >= 50) {
      const resultat1 = await effectuerTransfert(token, 50);
      console.log(`✅ Transfert réussi: ${resultat1.message}`);
      console.log(`  - Nouveau fond de caisse: ${resultat1.nouveauFondCaisse}€`);
      
      const etatApres1 = await getEtatCaisse(token);
      console.log(`  - Fond de caisse après: ${etatApres1.fondCaisse}€ (devrait être inchangé)`);
      console.log(`  - Solde total après: ${etatApres1.soldeCaisse}€`);
    } else {
      console.log('⚠️  Pas assez de recettes pour ce test');
    }

    await verifierHistoriques(token);

    // Test 2: Transfert mixte (recettes + fond)
    console.log('\n🧪 Test 2: Transfert de 200€ (mixte recettes + fond)');
    const etatAvant2 = await getEtatCaisse(token);
    const recettesAvant2 = parseFloat(etatAvant2.soldeCaisse) - parseFloat(etatAvant2.fondCaisse);
    
    if (parseFloat(etatAvant2.soldeCaisse) >= 200) {
      const resultat2 = await effectuerTransfert(token, 200);
      console.log(`✅ Transfert réussi: ${resultat2.message}`);
      console.log(`  - Nouveau fond de caisse: ${resultat2.nouveauFondCaisse}€`);
      
      const etatApres2 = await getEtatCaisse(token);
      console.log(`  - Fond de caisse après: ${etatApres2.fondCaisse}€`);
      console.log(`  - Solde total après: ${etatApres2.soldeCaisse}€`);
      
      if (recettesAvant2 > 0 && recettesAvant2 < 200) {
        const montantSurFond = 200 - recettesAvant2;
        console.log(`  - Répartition attendue: ${recettesAvant2.toFixed(2)}€ sur recettes, ${montantSurFond.toFixed(2)}€ sur fond`);
      }
    } else {
      console.log('⚠️  Fonds insuffisants pour ce test');
    }

    await verifierHistoriques(token);

    // Test 3: Transfert banque vers caisse (pour remettre des fonds)
    console.log('\n🧪 Test 3: Transfert de 100€ banque vers caisse');
    const resultat3 = await effectuerTransfert(token, 100, 'banque-vers-caisse');
    console.log(`✅ Transfert réussi: ${resultat3.message}`);
    console.log(`  - Nouveau fond de caisse: ${resultat3.nouveauFondCaisse}€`);

    // État final
    console.log('\n📊 État final de la caisse:');
    const etatFinal = await getEtatCaisse(token);
    console.log(`  - Fond de caisse: ${etatFinal.fondCaisse}€`);
    console.log(`  - Solde total: ${etatFinal.soldeCaisse}€`);
    const recettesFinales = parseFloat(etatFinal.soldeCaisse) - parseFloat(etatFinal.fondCaisse);
    console.log(`  - Recettes disponibles: ${recettesFinales.toFixed(2)}€`);

    await verifierHistoriques(token);

    console.log('\n✅ Tests terminés avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests
testerNouvelleLogique();