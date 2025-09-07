const mysql = require("mysql2/promise");

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "",
            database: "petanque_noveant",
        });

        // Insérer les types de membres
        await connection.execute(`
      INSERT IGNORE INTO member_types (nom, description, droits) VALUES
      ('Membre actif', 'Membre participant régulièrement aux activités', '{"vote": true, "competition": true}'),
      ('Membre honoraire', 'Ancien membre ayant rendu des services au club', '{"vote": true, "competition": false}'),
      ('Membre sympathisant', 'Personne soutenant le club sans participer activement', '{"vote": false, "competition": false}')
    `);
        console.log("✅ Types de membres insérés !");

        // Insérer quelques membres d'exemple
        await connection.execute(`
      INSERT IGNORE INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id) VALUES
      ('Dupont', 'Jean', '123 Rue de la Paix, Noveant', '03.87.12.34.56', 'jean.dupont@email.com', 'LIC001', '2020-01-15', '1965-03-20', 1),
      ('Martin', 'Marie', '456 Avenue des Fleurs, Noveant', '03.87.65.43.21', 'marie.martin@email.com', 'LIC002', '2019-09-10', '1970-07-12', 1),
      ('Durand', 'Pierre', '789 Boulevard du Stade, Noveant', '03.87.98.76.54', 'pierre.durand@email.com', 'LIC003', '2021-03-05', '1958-11-30', 2)
    `);
        console.log("✅ Membres d'exemple insérés !");

        await connection.end();
        console.log("✅ Base de données initialisée avec succès !");
    } catch (error) {
        console.error("❌ Erreur:", error.message);
    }
})();