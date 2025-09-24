const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "petanque_noveant",
};

async function checkDemoClub() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Vérifier si le club "demo" existe
        const [rows] = await connection.execute(
            "SELECT * FROM clubs WHERE subdomain = ?",
            ["demo"]
        );

        console.log('Clubs avec subdomain "demo":', rows);

        // Afficher tous les clubs
        const [allClubs] = await connection.execute("SELECT * FROM clubs");
        console.log("Tous les clubs:", allClubs);

        await connection.end();
    } catch (error) {
        console.error("Erreur:", error);
    }
}

checkDemoClub();
