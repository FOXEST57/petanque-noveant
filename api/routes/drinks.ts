import express, { Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
    createDrink,
    deleteDrink,
    getDrinks,
    updateDrink,
} from "../../src/lib/database.js";
import { authenticateToken, canManageDrinks } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed") as any, false);
        }
    },
});

// Ensure uploads/drinks directory exists
const uploadsDir = path.join(process.cwd(), "uploads", "drinks");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `${timestamp}_${random}${extension}`;
};

// GET /api/drinks - Get all drinks (public access for visitors)
router.get("/", async (req: Request, res: Response) => {
    try {
        // Utiliser le clubId détecté par le middleware de sous-domaine
        const clubId = req.clubId;

        if (!clubId) {
            return res.status(400).json({
                success: false,
                error: "Club non identifié",
            });
        }

        const drinks = await getDrinks(clubId);
        res.json({ success: true, data: drinks });
    } catch (error) {
        console.error("Erreur lors de la récupération des boissons:", error);
        res.status(500).json({ success: false, error: "Erreur serveur" });
    }
});

// POST /api/drinks - Create new drink (requires authentication and management permissions)
router.post(
    "/",
    authenticateToken,
    canManageDrinks,
    upload.single("photo"),
    async (req: Request, res: Response) => {
        try {
            const { name, price, description, stock } = req.body;
            const clubId = req.user!.clubId;

            if (!name || !price) {
                return res.status(400).json({
                    success: false,
                    error: "Le nom et le prix sont requis",
                });
            }

            // Nettoyer les données pour éviter les valeurs undefined
            const cleanData: any = {
                name,
                price,
                description: description !== undefined ? description : null,
                stock: stock !== undefined ? stock : null,
            };

            // Handle photo upload if present
            if (req.file) {
                const filename = generateUniqueFilename(req.file.originalname);
                const uploadPath = path.join(uploadsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, req.file.buffer);

                // Store relative path in database
                cleanData.image_url = `uploads/drinks/${filename}`;
            }

            const result = await createDrink(cleanData, clubId);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error("Erreur lors de la création de la boisson:", error);
            res.status(500).json({ success: false, error: "Erreur serveur" });
        }
    }
);

// PUT /api/drinks/:id - Update drink (requires authentication and management permissions)
router.put(
    "/:id",
    authenticateToken,
    canManageDrinks,
    async (req: Request, res: Response) => {
        try {
            const drinkId = parseInt(req.params.id);
            const { name, price, description, stock, image_url } = req.body;
            const clubId = req.user!.clubId;

            // Logs de débogage
            console.log("=== DEBUG UPDATE DRINK (JSON) ===");
            console.log("ID:", drinkId);
            console.log("Request body:", req.body);
            console.log("Content-Type:", req.headers["content-type"]);
            console.log("Stock value:", stock, "Type:", typeof stock);

            // Nettoyer les données pour éviter les valeurs undefined
            const cleanData: any = {};

            if (name !== undefined && name !== null && name !== "")
                cleanData.name = name;
            if (price !== undefined && price !== null) cleanData.price = price;
            if (description !== undefined && description !== null)
                cleanData.description = description;
            if (stock !== undefined && stock !== null) cleanData.stock = stock;
            if (image_url !== undefined && image_url !== null)
                cleanData.image_url = image_url;

            // Handle photo upload if present
            if (req.file) {
                const filename = generateUniqueFilename(req.file.originalname);
                const uploadPath = path.join(uploadsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, req.file.buffer);

                // Store relative path in database
                cleanData.image_url = `uploads/drinks/${filename}`;
            }

            // Check if there are any fields to update
            if (Object.keys(cleanData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Aucun champ valide à mettre à jour",
                });
            }

            const result = await updateDrink(drinkId, cleanData, clubId);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour de la boisson:",
                error
            );
            res.status(500).json({ success: false, error: "Erreur serveur" });
        }
    }
);

// PUT /api/drinks/:id/upload - Update drink with file upload (requires authentication and management permissions)
router.put(
    "/:id/upload",
    authenticateToken,
    canManageDrinks,
    upload.single("photo"),
    async (req: Request, res: Response) => {
        try {
            const drinkId = parseInt(req.params.id);
            const { name, price, description, stock } = req.body;
            const clubId = req.user!.clubId;

            // Logs de débogage
            console.log("=== DEBUG UPDATE DRINK (WITH FILE) ===");
            console.log("ID:", drinkId);
            console.log("Request body:", req.body);
            console.log("File:", req.file);

            // Nettoyer les données pour éviter les valeurs undefined
            const cleanData: any = {};

            if (name !== undefined && name !== null && name !== "")
                cleanData.name = name;
            if (price !== undefined && price !== null) cleanData.price = price;
            if (description !== undefined && description !== null)
                cleanData.description = description;
            if (stock !== undefined && stock !== null) cleanData.stock = stock;

            // Gérer l'upload de fichier si présent
            if (req.file) {
                const fileName = `drink_${Date.now()}_${req.file.originalname}`;
                const filePath = path.join(
                    __dirname,
                    "../../public/uploads",
                    fileName
                );

                // Créer le dossier s'il n'existe pas
                const uploadDir = path.dirname(filePath);
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Sauvegarder le fichier
                fs.writeFileSync(filePath, req.file.buffer);
                cleanData.photo = `/uploads/${fileName}`;
            }

            // Vérifier qu'il y a au moins un champ à mettre à jour
            if (Object.keys(cleanData).length === 0) {
                return res
                    .status(400)
                    .json({
                        error: "Aucun champ valide fourni pour la mise à jour",
                    });
            }

            console.log("Clean data to update:", cleanData);

            // Mettre à jour la boisson
            const result = await updateDrink(drinkId, cleanData, clubId);

            if (!result) {
                return res.status(404).json({ error: "Boisson non trouvée" });
            }

            res.json({
                message: "Boisson mise à jour avec succès",
                drink: result,
            });
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour de la boisson avec fichier:",
                error
            );
            res.status(500).json({
                error: "Erreur lors de la mise à jour de la boisson",
            });
        }
    }
);

// DELETE /api/drinks/:id - Delete drink (requires authentication and management permissions)
router.delete(
    "/:id",
    authenticateToken,
    canManageDrinks,
    async (req: Request, res: Response) => {
        try {
            const drinkId = parseInt(req.params.id);
            const clubId = req.user!.clubId;
            const result = await deleteDrink(drinkId, clubId);
            res.json({ success: true, data: result });
        } catch (error) {
            console.error(
                "Erreur lors de la suppression de la boisson:",
                error
            );
            res.status(500).json({ success: false, error: "Erreur serveur" });
        }
    }
);

// POST /api/drinks/upload-image - Upload image separately
router.post(
    "/upload-image",
    authenticateToken,
    canManageDrinks,
    upload.single("image"),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "Aucune image fournie",
                });
            }

            const filename = generateUniqueFilename(req.file.originalname);
            const uploadPath = path.join(uploadsDir, filename);

            // Save file to disk
            await fs.promises.writeFile(uploadPath, req.file.buffer);

            // Return the image URL
            const imageUrl = `uploads/drinks/${filename}`;

            res.status(201).json({
                success: true,
                imageUrl: imageUrl,
            });
        } catch (error) {
            console.error("Erreur lors de l'upload de l'image:", error);
            res.status(500).json({ success: false, error: "Erreur serveur" });
        }
    }
);

export default router;
