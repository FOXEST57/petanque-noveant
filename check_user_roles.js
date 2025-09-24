const mysql = require("mysql2/promise");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "petanque_noveant",
};

async function checkUserRoles() {
    let connection;

    try {
        console.log("🔍 Connexion à la base de données...");
        connection = await mysql.createConnection(dbConfig);

        console.log("📋 Récupération des utilisateurs actifs...");
        const [users] = await connection.execute(`
      SELECT u.id, u.nom, u.prenom, u.email, u.role, u.club_id, u.statut,
             c.nom as club_nom
      FROM users u
      LEFT JOIN clubs c ON u.club_id = c.id
      WHERE u.statut = 'actif'
      ORDER BY u.id
    `);

        console.log("\n👥 Utilisateurs actifs:");
        console.log("=".repeat(80));

        users.forEach((user) => {
            console.log(
                `ID: ${user.id} | ${user.prenom} ${user.nom} | ${user.email}`
            );
            console.log(
                `   Rôle: ${user.role} | Club: ${user.club_nom} (ID: ${user.club_id})`
            );
            console.log(`   Statut: ${user.statut}`);

            // Vérifier les permissions
            const canApprove = ["president", "vice_president"].includes(
                user.role
            );
            console.log(
                `   Peut approuver les demandes: ${
                    canApprove ? "✅ OUI" : "❌ NON"
                }`
            );
            console.log("-".repeat(80));
        });

        console.log(`\n📊 Total: ${users.length} utilisateur(s) actif(s)`);

        // Vérifier les demandes d'adhésion en attente
        console.log("\n📝 Demandes d'adhésion en attente:");
        const [requests] = await connection.execute(`
      SELECT id, nom, prenom, email, statut, club_id, created_at
      FROM membership_requests
      WHERE statut = 'en_attente'
      ORDER BY created_at DESC
    `);

        if (requests.length === 0) {
            console.log("   Aucune demande en attente");
        } else {
            requests.forEach((req) => {
                console.log(
                    `   ID: ${req.id} | ${req.prenom} ${req.nom} | ${req.email} | Club: ${req.club_id}`
                );
            });
        }
    } catch (error) {
        console.error("❌ Erreur:", error);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\n🔌 Connexion fermée");
        }
    }
}

checkUserRoles();
