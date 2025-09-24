const mysql = require("mysql2/promise");

async function checkDemo() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "petanque_noveant",
    });

    try {
        const [rows] = await connection.execute(
            "SELECT * FROM clubs WHERE subdomain = ?",
            ["demo"]
        );
        console.log("Club demo trouvé:", rows);

        if (rows.length === 0) {
            console.log("Création du club demo...");
            await connection.execute(
                "INSERT INTO clubs (nom, subdomain, created_at) VALUES (?, ?, NOW())",
                ["Club Demo", "demo"]
            );
            console.log("Club demo créé avec succès!");
        }
    } catch (error) {
        console.error("Erreur:", error);
    } finally {
        await connection.end();
    }
}

checkDemo();
