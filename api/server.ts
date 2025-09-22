/**
 * local server entry file, for local development
 * Updated to trigger restart - port 9000
 */
import dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis le répertoire parent
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import app from "./app.ts";

/**
 * start server with port
 */
const PORT = process.env.API_PORT || process.env.PORT || 3002;

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
