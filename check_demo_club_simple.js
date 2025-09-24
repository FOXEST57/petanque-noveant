const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "petanque_noveant",
};

async function checkDemoClub() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            "SELECT * FROM clubs WHERE subdomain = ?",
            ["demo"]
        );
        console.log('Clubs avec subdomain "demo":', rows);

        const [allClubs] = await connection.execute(
            "SELECT id, name, subdomain FROM clubs LIMIT 5"
        );
        console.log("Premiers clubs dans la base:", allClubs);
    } finally {
        await connection.end();
    }
}

checkDemoClub().catch(console.error);
