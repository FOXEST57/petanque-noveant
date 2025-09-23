console.log("=== DEBUG FRONTEND PHOTO UPLOAD ===");

// Simuler la création d'un événement avec photos
const testEventCreation = () => {
    console.log("1. Vérification du token:");
    const token = localStorage.getItem("auth_token");
    console.log("Token présent:", !!token);
    
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token expiré:", Math.floor(Date.now() / 1000) > payload.exp);
        console.log("User ID:", payload.userId);
        console.log("Club ID:", payload.clubId);
    }
    
    console.log("\n2. Test de création d'événement:");
    console.log("Vérifiez dans la console du navigateur:");
    console.log("- Avez-vous sélectionné des photos ?");
    console.log("- Les photos apparaissent-elles dans l'aperçu ?");
    console.log("- Y a-t-il des erreurs dans la console lors de la soumission ?");
    
    console.log("\n3. Instructions:");
    console.log("1. Ouvrez la page admin");
    console.log("2. Cliquez sur 'Ajouter un événement'");
    console.log("3. Remplissez le formulaire");
    console.log("4. SÉLECTIONNEZ DES PHOTOS");
    console.log("5. Ouvrez la console (F12) AVANT de cliquer sur 'Ajouter'");
    console.log("6. Collez ce code dans la console:");
    console.log("   window.debugPhotoUpload = true;");
    console.log("7. Cliquez sur 'Ajouter' et observez les logs");
};

testEventCreation();