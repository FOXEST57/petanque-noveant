// Script de test pour vérifier la mise à jour du stock
const API_BASE_URL = 'http://localhost:3001/api';

async function testStockUpdate() {
    try {
        console.log('=== TEST STOCK UPDATE ===');
        
        // 1. Récupérer les boissons
        console.log('1. Récupération des boissons...');
        const drinksResponse = await fetch(`${API_BASE_URL}/drinks`);
        
        if (!drinksResponse.ok) {
            throw new Error(`HTTP error! status: ${drinksResponse.status}`);
        }
        
        const drinksResult = await drinksResponse.json();
        console.log('Réponse complète:', drinksResult);
        
        if (!drinksResult.success || !drinksResult.data) {
            throw new Error('Format de réponse invalide');
        }
        
        const drinks = drinksResult.data;
        console.log('Boissons trouvées:', drinks.length);
        
        if (drinks.length === 0) {
            console.log('❌ Aucune boisson trouvée');
            return;
        }
        
        // Prendre la première boisson
        const testDrink = drinks[0];
        console.log('Boisson de test:', testDrink.name, 'Stock actuel:', testDrink.stock);
        
        // 2. Modifier le stock
        const newStock = testDrink.stock + 1;
        console.log('2. Modification du stock de', testDrink.stock, 'à', newStock);
        
        const updateResponse = await fetch(`${API_BASE_URL}/drinks/${testDrink.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stock: newStock
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error(`Erreur lors de la mise à jour: ${updateResponse.status}`);
        }
        
        const updateResult = await updateResponse.json();
        console.log('Résultat de la mise à jour:', updateResult);
        
        // 3. Vérifier la mise à jour
        console.log('3. Vérification de la mise à jour...');
        const verifyResponse = await fetch(`${API_BASE_URL}/drinks`);
        const verifyResult = await verifyResponse.json();
        const updatedDrink = verifyResult.data.find(d => d.id === testDrink.id);
        
        console.log('Stock après mise à jour:', updatedDrink.stock);
        
        if (updatedDrink.stock === newStock) {
            console.log('✅ Test réussi ! Le stock a été correctement mis à jour.');
        } else {
            console.log('❌ Test échoué ! Le stock n\'a pas été mis à jour.');
            console.log('Attendu:', newStock, 'Reçu:', updatedDrink.stock);
        }
        
    } catch (error) {
        console.log('❌ Erreur lors du test:', error.message);
        console.error(error);
    }
}

testStockUpdate();