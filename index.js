// let nbRange;
// let nbTable;
// let nbPlace;

// function createRangesIlotsAndPlaces(nbRange, nbTable, nbPlace) {
//     // Sélectionner la section cible
//     let section = document.getElementById("ma-section");
//     if (!section) {
//         console.error("L'élément avec l'id 'ma-section' n'existe pas.");
//         return;
//     }

//     let tableCounter = 1; // Compteur global pour numérotation unique des tables
//     let placeCounter = 1; // Compteur global pour numérotation unique des places

//     for (let i = 1; i <= nbRange; i++) {
//         // 1. Créer une nouvelle div pour la range
//         let nouvelleRange = document.createElement("div");
//         nouvelleRange.className = "range";
//         nouvelleRange.innerHTML = `<h3>Rangée ${i}</h3>`; // Ajouter un titre pour chaque range

//         for (let j = 1; j <= nbTable; j++) {
//             // 2. Créer une nouvelle div pour l'ilot
//             let nouvelleIlot = document.createElement("div");
//             nouvelleIlot.className = "ilot";

//             // 3. Ajouter des places dans l'ilot
//             let placesParRange = Math.floor(nbPlace / 2); // Diviser nbPlace par 2 pour avoir deux rangées

//             // Première rangée de places
//             let rangePlace1 = document.createElement("div");
//             rangePlace1.className = "banc";

//             for (let k = 1; k <= placesParRange; k++) {
//                 let place = document.createElement("div");
//                 place.className = "place";
//                 place.innerHTML = ` ${placeCounter}`; // Numéro unique pour chaque place
//                 placeCounter++; // Incrémenter le compteur
//                 rangePlace1.appendChild(place);
//             }

//             // Table unique
//             let table = document.createElement("div");
//             table.className = "table";
//             table.innerHTML = `Table ${tableCounter}`; // Numéro unique pour chaque table
//             tableCounter++; // Incrémenter le compteur

//             // Deuxième rangée de places
//             let rangePlace2 = document.createElement("div");
//             rangePlace2.className = "banc";

//             for (let l = 1; l <= placesParRange; l++) {
//                 let place = document.createElement("div");
//                 place.className = "place";
//                 place.innerHTML = ` ${placeCounter}`; // Numéro unique pour chaque place
//                 placeCounter++; // Incrémenter le compteur
//                 rangePlace2.appendChild(place);
//             }

//             // Ajouter les éléments dans l'ilot
//             nouvelleIlot.appendChild(rangePlace1);
//             nouvelleIlot.appendChild(table);
//             nouvelleIlot.appendChild(rangePlace2);

//             // Ajouter l'ilot à la range
//             nouvelleRange.appendChild(nouvelleIlot);
//         }

//         // Ajouter la range à la section principale
//         section.appendChild(nouvelleRange);
//     }
// }

// // Exemple d'appel de la fonction
// createRangesIlotsAndPlaces(10, 4, 8); // 2 ranges, 2 ilots par range, 6 places par ilot

// document.getElementById("generate").addEventListener("click", function () {
//     // Récupérer les valeurs saisies par l'utilisateur
//     const nbRange = parseInt(document.getElementById("nbRange").value, 10);
//     const nbTable = parseInt(document.getElementById("nbTable").value, 10);
//     const nbPlace = parseInt(document.getElementById("nbPlace").value, 10);

//     // Vérifier si les valeurs sont valides
//     if (
//         isNaN(nbRange) ||
//         isNaN(nbTable) ||
//         isNaN(nbPlace) ||
//         nbRange < 1 ||
//         nbTable < 1 ||
//         nbPlace < 2
//     ) {
//         alert("Veuillez entrer des valeurs valides !");
//         return;
//     }

//     // Réinitialiser la section pour éviter d'accumuler plusieurs résultats
//     const section = document.getElementById("ma-section");
//     section.innerHTML = "";

//     // Appeler la fonction pour créer les éléments
//     createRangesIlotsAndPlaces(nbRange, nbTable, nbPlace);
// });

// function createRangesIlotsAndPlaces(nbRange, nbTable, nbPlace) {
//     // Sélectionner la section cible
//     let section = document.getElementById("ma-section");
//     let tableCounter = 1; // Compteur global pour numérotation unique des tables
//     let placeCounter = 1; // Compteur global pour numérotation unique des places

//     for (let i = 1; i <= nbRange; i++) {
//         // Créer une nouvelle div pour la range
//         let nouvelleRange = document.createElement("div");
//         nouvelleRange.className = "range";
//         nouvelleRange.innerHTML = `<h3>Rangée ${i}</h3>`;

//         for (let j = 1; j <= nbTable; j++) {
//             // Créer une nouvelle div pour l'ilot
//             let nouvelleIlot = document.createElement("div");
//             nouvelleIlot.className = "ilot";

//             // Ajouter des places dans l'ilot
//             let placesParRange = Math.floor(nbPlace / 2);

//             // Première rangée de places
//             let rangePlace1 = document.createElement("div");
//             rangePlace1.className = "banc";

//             for (let k = 1; k <= placesParRange; k++) {
//                 let place = document.createElement("div");
//                 place.className = "place";
//                 place.innerHTML = `Place ${placeCounter}`;
//                 placeCounter++;
//                 rangePlace1.appendChild(place);
//             }

//             // Table unique
//             let table = document.createElement("div");
//             table.className = "table";
//             table.innerHTML = `Table ${tableCounter}`;
//             tableCounter++;

//             // Deuxième rangée de places
//             let rangePlace2 = document.createElement("div");
//             rangePlace2.className = "banc";

//             for (let l = 1; l <= placesParRange; l++) {
//                 let place = document.createElement("div");
//                 place.className = "place";
//                 place.innerHTML = `Place ${placeCounter}`;
//                 placeCounter++;
//                 rangePlace2.appendChild(place);
//             }

//             // Ajouter les éléments dans l'ilot
//             nouvelleIlot.appendChild(rangePlace1);
//             nouvelleIlot.appendChild(table);
//             nouvelleIlot.appendChild(rangePlace2);

//             // Ajouter l'ilot à la range
//             nouvelleRange.appendChild(nouvelleIlot);
//         }

//         // Ajouter la range à la section principale
//         section.appendChild(nouvelleRange);
//     }
// }

document.getElementById("generate").addEventListener("click", function () {
    // Récupérer les valeurs saisies par l'utilisateur
    const nbRange = parseInt(document.getElementById("nbRange").value, 10);
    const nbTable = parseInt(document.getElementById("nbTable").value, 10);
    const nbPlace = parseInt(document.getElementById("nbPlace").value, 10);

    // Vérifier si les valeurs sont valides
    if (
        isNaN(nbRange) ||
        isNaN(nbTable) ||
        isNaN(nbPlace) ||
        nbRange < 1 ||
        nbTable < 1 ||
        nbPlace < 2
    ) {
        alert("Veuillez entrer des valeurs valides !");
        return;
    }

    // Réinitialiser la section pour éviter d'accumuler plusieurs résultats
    const section = document.getElementById("ma-section");
    section.innerHTML = "";

    // Appeler la fonction pour créer les éléments
    createRangesIlotsAndPlaces(nbRange, nbTable, nbPlace);
});

function createRangesIlotsAndPlaces(nbRange, nbTable, nbPlace) {
    // Sélectionner la section cible
    let section = document.getElementById("ma-section");
    let tableCounter = 1; // Compteur global pour numérotation unique des tables
    let placeCounter = 1; // Compteur global pour numérotation unique des places

    for (let i = 1; i <= nbRange; i++) {
        // Créer une nouvelle div pour la range
        let nouvelleRange = document.createElement("div");
        nouvelleRange.className = "range";
        nouvelleRange.innerHTML = `<h3>Rangée ${i}</h3>`;

        for (let j = 1; j <= nbTable; j++) {
            // Créer une nouvelle div pour l'ilot
            let nouvelleIlot = document.createElement("div");
            nouvelleIlot.className = "ilot";

            // Ajouter des places dans l'ilot
            let placesParRange = Math.floor(nbPlace / 2);

            // Première rangée de places
            let rangePlace1 = document.createElement("div");
            rangePlace1.className = "banc";

            for (let k = 1; k <= placesParRange; k++) {
                let place = document.createElement("div");
                place.className = "place";
                place.innerHTML = `${placeCounter}`;
                placeCounter++;
                rangePlace1.appendChild(place);
            }

            // Table unique
            let table = document.createElement("div");
            table.className = "table";
            table.innerHTML = `Table ${tableCounter}`;
            tableCounter++;

            // Deuxième rangée de places
            let rangePlace2 = document.createElement("div");
            rangePlace2.className = "banc";

            for (let l = 1; l <= placesParRange; l++) {
                let place = document.createElement("div");
                place.className = "place";
                place.innerHTML = ` ${placeCounter}`;
                placeCounter++;
                rangePlace2.appendChild(place);
            }

            // Ajouter les éléments dans l'ilot
            nouvelleIlot.appendChild(rangePlace1);
            nouvelleIlot.appendChild(table);
            nouvelleIlot.appendChild(rangePlace2);

            // Ajouter l'ilot à la range
            nouvelleRange.appendChild(nouvelleIlot);
        }

        // Ajouter la range à la section principale
        section.appendChild(nouvelleRange);
    }
}

// Fonction pour gérer la réservation de la place
function reservePlace(placeElement) {
    const placeId = placeElement.getAttribute("data-place-id");

    // Marquer la place comme réservée (ajout d'une classe ou changement de style)
    if (!placeElement.classList.contains("reserved")) {
        placeElement.classList.add("reserved");
        placeElement.style.backgroundColor = "red"; // Exemple : changer la couleur

        // Envoyer les données au serveur (simulateur de réservation)
        fetch("https://example.com/reserve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ placeId: placeId }),
        })
            .then((response) => {
                if (response.ok) {
                    alert(`Place ${placeId} réservée avec succès !`);
                } else {
                    alert(
                        `Erreur lors de la réservation de la place ${placeId}.`
                    );
                }
            })
            .catch((error) => {
                console.error("Erreur réseau : ", error);
                alert("Impossible de réserver la place pour le moment.");
            });
    } else {
        alert("Cette place est déjà réservée !");
    }
}
