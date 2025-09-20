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
import carouselRoutes from "./routes/carousel.js";
import contactRoutes from "./routes/contact.js";
import drinksRoutes from "./routes/drinks.js";
import eventsRoutes from "./routes/events.js";
import homeContentRoutes from "./routes/home-content.js";
import membersRoutes from "./routes/members.js";
import membershipRoutes from "./routes/membership.js";
import siteSettingsRoutes from "./routes/site-settings.js";
import teamsRoutes from "./routes/teams.js";

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
 * API Routes
 */
app.use("/api/auth", authRoutes);
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
