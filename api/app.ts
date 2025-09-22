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
import authRoutes from "./routes/auth.ts";
import carouselRoutes from "./routes/carousel.ts";
import clubsRoutes from "./routes/clubs.ts";
import contactRoutes from "./routes/contact.ts";
import drinksRoutes from "./routes/drinks.ts";
import eventsRoutes from "./routes/events.ts";
import homeContentRoutes from "./routes/home-content.ts";
import membersRoutes from "./routes/members.ts";
import membershipRoutes from "./routes/membership.js";
import siteSettingsRoutes from "./routes/site-settings.ts";
import teamsRoutes from "./routes/teams.ts";

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de débogage global pour tracer toutes les requêtes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 Global middleware - Request received:', req.method, req.url);
  console.log('🔍 Global middleware - Headers:', req.headers);
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * API Routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubsRoutes);

// Middleware de débogage spécifique pour /api/events
app.use("/api/events", (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 Before events router - Request:', req.method, req.url);
  console.log('🔍 Before events router - Path:', req.path);
  console.log('🔍 Before events router - Original URL:', req.originalUrl);
  next();
});

app.use("/api/events", eventsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/drinks", drinksRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/home-content", homeContentRoutes);
app.use("/api/site-settings", siteSettingsRoutes);

/**
 * health
 */
app.use(
    "/api/health",
    (req: Request, res: Response, next: NextFunction): void => {
        res.status(200).json({
            success: true,
            message: "ok",
        });
    }
);

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        success: false,
        error: "Server internal error",
    });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: "API not found",
    });
});

export default app;
