/**
 * local server entry file, for local development
 * Updated to trigger restart - port 3003
 */
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis le répertoire racine du projet
dotenv.config({ path: path.join(process.cwd(), '.env') });

import app from "./app.js";

/**
 * start server with port
 */
const PORT = process.env.API_PORT || process.env.PORT || 3007;

// Démarrer le serveur
const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT signal received");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

export default app;