import express from "express";
import fs from "fs";
import multer from "multer";
import mysql from "mysql2/promise";
import path from "path";
import { authenticateToken, ensureClubAccess } from "../middleware/auth.js";

const router = express.Router();

// Configuration multer pour les uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

// Créer les répertoires d'uploads s'ils n'existent pas
const uploadsDir = path.join(process.cwd(), "uploads", "logos");
const faviconsDir = path.join(process.cwd(), "uploads", "favicons");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(faviconsDir)) {
    fs.mkdirSync(faviconsDir, { recursive: true });
}

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `logo_${timestamp}_${random}${extension}`;
};

// Configuration de la base de données
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "petanque_noveant",
};

// GET /api/site-settings/public - Récupérer les paramètres publics du site (sans authentification)
router.get("/public", async (req, res) => {
    try {
        // Vérifier que req.clubId est défini par le middleware de sous-domaine
        if (!req.clubId) {
            return res.status(400).json({
                success: false,
                error: "Club non identifié. Veuillez accéder via un sous-domaine valide.",
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Récupérer les paramètres publics pour le club déterminé
        const [rows] = await connection.execute(
            "SELECT setting_key, setting_value, setting_type FROM site_settings WHERE club_id = ? AND setting_key IN ('site_name', 'site_subtitle', 'club_name', 'primary_color', 'logo_url', 'favicon_url') ORDER BY setting_key",
            [req.clubId]
        );

        await connection.end();

        // Transformer les résultats en objet clé-valeur
        const settings = {};
        (rows as any[]).forEach((row) => {
            let value = row.setting_value;

            // Convertir selon le type
            if (row.setting_type === "number") {
                value = parseFloat(value) || 0;
            } else if (row.setting_type === "boolean") {
                value = value === "true" || value === "1";
            } else if (row.setting_type === "json") {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = {};
                }
            }

            settings[row.setting_key] = value;
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error("Erreur lors de la récupération des paramètres publics:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des paramètres publics du site",
        });
    }
});

// GET /api/site-settings - Récupérer tous les paramètres du site (authentifié)
router.get("/", authenticateToken, ensureClubAccess(), async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            "SELECT setting_key, setting_value, setting_type FROM site_settings WHERE club_id = ? ORDER BY setting_key",
            [req.user.clubId]
        );

        await connection.end();

        // Transformer les résultats en objet clé-valeur
        const settings = {};
        (rows as any[]).forEach((row) => {
            let value = row.setting_value;

            // Convertir selon le type
            if (row.setting_type === "number") {
                value = parseFloat(value) || 0;
            } else if (row.setting_type === "boolean") {
                value = value === "true" || value === "1";
            } else if (row.setting_type === "json") {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = {};
                }
            }

            settings[row.setting_key] = value;
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des paramètres du site",
        });
    }
});

// PUT /api/site-settings - Mettre à jour les paramètres du site
router.put(
    "/",
    authenticateToken,
    ensureClubAccess(),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "favicon", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const settings = req.body;

            if (!settings || typeof settings !== "object") {
                return res.status(400).json({
                    success: false,
                    message: "Données invalides",
                });
            }

            const connection = await mysql.createConnection(dbConfig);
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };

            // Handle logo upload if present
            if (files && files.logo && files.logo[0]) {
                const logoFile = files.logo[0];
                const filename = generateUniqueFilename(logoFile.originalname);
                const uploadPath = path.join(uploadsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, logoFile.buffer);

                // Add logo_url to settings
                settings.logo_url = `uploads/logos/${filename}`;
            }

            // Handle favicon upload if present
            if (files && files.favicon && files.favicon[0]) {
                const faviconFile = files.favicon[0];
                const filename = generateUniqueFilename(
                    faviconFile.originalname
                );
                const uploadPath = path.join(faviconsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, faviconFile.buffer);

                // Add favicon_url to settings
                settings.favicon_url = `uploads/favicons/${filename}`;
            }

            // Mettre à jour chaque paramètre
            for (const [key, value] of Object.entries(settings)) {
                let stringValue = String(value);
                let settingType = "string";

                // Déterminer le type
                if (typeof value === "number") {
                    settingType = "number";
                } else if (typeof value === "boolean") {
                    settingType = "boolean";
                    stringValue = value ? "true" : "false";
                } else if (typeof value === "object" && value !== null) {
                    settingType = "json";
                    stringValue = JSON.stringify(value);
                }

                await connection.execute(
                    `INSERT INTO site_settings (setting_key, setting_value, setting_type, club_id) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         setting_type = VALUES(setting_type),
         updated_at = CURRENT_TIMESTAMP`,
                    [key, stringValue, settingType, req.user.clubId]
                );
            }

            await connection.end();

            res.json({
                success: true,
                message: "Paramètres du site mis à jour avec succès",
            });
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour des paramètres:",
                error
            );
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour des paramètres du site",
            });
        }
    }
);

// GET /api/site-settings/:key - Récupérer un paramètre spécifique
router.get("/:key", authenticateToken, ensureClubAccess(), async (req, res) => {
    try {
        const { key } = req.params;
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            "SELECT setting_value, setting_type FROM site_settings WHERE setting_key = ? AND club_id = ?",
            [key, req.user.clubId]
        );

        await connection.end();

        if ((rows as any[]).length === 0) {
            return res.status(404).json({
                success: false,
                message: "Paramètre non trouvé",
            });
        }

        const row = (rows as any[])[0];
        let value = row.setting_value;

        // Convertir selon le type
        if (row.setting_type === "number") {
            value = parseFloat(value) || 0;
        } else if (row.setting_type === "boolean") {
            value = value === "true" || value === "1";
        } else if (row.setting_type === "json") {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = {};
            }
        }

        res.json({ success: true, data: { [key]: value } });
    } catch (error) {
        console.error("Erreur lors de la récupération du paramètre:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du paramètre",
        });
    }
});

export default router;
