/**
 * This is a API server
 */

import cors from "cors";
import dotenv from "dotenv";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import banqueRoutes from "./routes/banque.js";
import caisseRoutes from "./routes/caisse.js";
import carouselRoutes from "./routes/carousel.js";
import clubsRoutes from "./routes/clubs.js";
import comptesClientsRoutes from "./routes/comptes-clients.js";
import contactRoutes from "./routes/contact.js";
import drinksRoutes from "./routes/drinks.js";
import eventsRoutes from "./routes/events.js";
import homeContentRoutes from "./routes/home-content.js";
import membersRoutes from "./routes/members.js";
import membershipRoutes from "./routes/membership.js";
import siteSettingsRoutes from "./routes/site-settings.js";
import teamsRoutes from "./routes/teams.js";
import { detectSubdomain, enforceClubIsolation } from "./middleware/subdomain.js";

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * API Routes - Using a router to apply middlewares
 */
const apiRouter = express.Router();

// Global debugging middleware (can be removed in production)
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 API Request:', req.method, req.path);
  next();
});

// Apply subdomain detection middleware
apiRouter.use(detectSubdomain);



// Mount routes on API router
apiRouter.use("/auth", authRoutes);
apiRouter.use("/banque", banqueRoutes);
apiRouter.use("/caisse", caisseRoutes);
apiRouter.use("/clubs", clubsRoutes);
apiRouter.use("/comptes-clients", comptesClientsRoutes);
apiRouter.use("/events", eventsRoutes);
apiRouter.use("/members", membersRoutes);
apiRouter.use("/membership", membershipRoutes);
apiRouter.use("/contact", contactRoutes);
apiRouter.use("/teams", teamsRoutes);
apiRouter.use("/drinks", drinksRoutes);
apiRouter.use("/carousel", carouselRoutes);
apiRouter.use("/home-content", homeContentRoutes);
apiRouter.use("/site-settings", siteSettingsRoutes);

// Health check route
apiRouter.use("/health", (req: Request, res: Response, next: NextFunction): void => {
    res.json({ success: true, message: "ok" });
});

// Mount API router on application
app.use("/api", apiRouter);

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
    });
});

export default app;
