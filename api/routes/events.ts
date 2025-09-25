import express, { type Request, type Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { authenticateToken, canManageEvents, ensureClubAccess } from '../middleware/auth.js';
import {
    createEvent,
    deleteEvent,
    getEvents,
    updateEvent,
    getEventPhotos,
    createEventPhoto,
    deleteEventPhoto,
    getEventPhotoById,
} from "../../src/lib/database.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
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

// Ensure uploads/events directory exists
const uploadsDir = path.join(process.cwd(), "uploads", "events");
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

// GET /api/events/public - Get all events (public access, no authentication required)
router.get("/public", async (req: Request, res: Response) => {
    try {
        // Vérifier que req.clubId est défini par le middleware de sous-domaine
        if (!req.clubId) {
            return res.status(400).json({
                success: false,
                error: "Club non identifié. Veuillez accéder via un sous-domaine valide.",
            });
        }
        
        const events = await getEvents(req.clubId);
        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error("Error fetching events (public):", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des événements",
        });
    }
});

// GET /api/events/test - Test route
router.get("/test", async (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Events router is working!",
        timestamp: new Date().toISOString()
    });
});

// GET /api/events/count - Get events count (requires authentication and club access)
router.get("/count", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const clubId = req.user!.clubId;
        const events = await getEvents(clubId);
        res.json({
            success: true,
            data: {
                count: events.length
            },
        });
    } catch (error) {
        console.error("Error fetching events count:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération du nombre d'événements",
        });
    }
});

// GET /api/events - Get all events (requires authentication and club access)
router.get("/", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const clubId = req.user!.clubId;
        const events = await getEvents(clubId);
        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des événements",
        });
    }
});

// GET /api/events/:id - Get event by ID (requires authentication and club access)
router.get("/:id", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        const clubId = req.user!.clubId;
        
        // Get all events and find the specific one
        const events = await getEvents(clubId);
        const event = events.find(e => e.id === eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: "Événement non trouvé",
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération de l'événement",
        });
    }
});

// POST /api/events - Create new event (requires authentication and event management permission)
router.post("/", authenticateToken, canManageEvents, upload.single("image"), async (req: Request, res: Response) => {
    try {
        const { name, description, date, location, maxParticipants } = req.body;
        const clubId = req.user!.clubId;

        // Validate required fields
        if (!name || !date) {
            return res.status(400).json({
                success: false,
                error: "Le nom et la date sont requis",
            });
        }

        let imagePath = null;
        if (req.file) {
            const filename = generateUniqueFilename(req.file.originalname);
            imagePath = path.join("uploads", "events", filename);
            const fullPath = path.join(process.cwd(), imagePath);
            fs.writeFileSync(fullPath, req.file.buffer);
        }

        const eventData = {
            title: name,
            description: description || null,
            date: new Date(date),
            heure: '',
            lieu: location || null,
            publicCible: maxParticipants ? parseInt(maxParticipants) : null,
            photos: imagePath ? [imagePath] : [],
        };

        const eventId = await createEvent(eventData, clubId);

        res.status(201).json({
            success: true,
            data: { id: eventId, ...eventData },
        });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la création de l'événement",
        });
    }
});

// PUT /api/events/:id - Update event (requires authentication and event management permission)
router.put("/:id", authenticateToken, canManageEvents, upload.single("image"), async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        const { title, description, date, heure, lieu, publicCible, photos } = req.body;
        const clubId = req.user!.clubId;

        // Check if event exists and belongs to the club
        const events = await getEvents(clubId);
        const existingEvent = events.find(e => e.id === eventId);
        
        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                error: "Événement non trouvé",
            });
        }

        // Prepare event data for update
        const eventData = {
            title,
            description,
            date,
            heure,
            lieu,
            publicCible,
            photos
        };

        // Update event in database
        await updateEvent(eventId, eventData, clubId);

        res.json({
            success: true,
            data: { id: eventId, ...eventData },
        });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour de l'événement",
        });
    }
});

// DELETE /api/events/:id - Delete event (requires authentication and event management permission)
router.delete("/:id", authenticateToken, canManageEvents, async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        const clubId = req.user!.clubId;

        // Check if event exists and belongs to the club
        const events = await getEvents(clubId);
        const existingEvent = events.find(e => e.id === eventId);
        
        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                error: "Événement non trouvé",
            });
        }

        // Delete associated image if it exists
        if (existingEvent.imagePath) {
            const imagePath = path.join(process.cwd(), existingEvent.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await deleteEvent(eventId);

        res.json({
            success: true,
            message: "Événement supprimé avec succès",
        });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la suppression de l'événement",
        });
    }
});

// GET /api/events/:id/photos - Get photos for an event
router.get("/:id/photos", async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        
        if (isNaN(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        const photos = await getEventPhotos(eventId);
        
        res.json(photos);
    } catch (error) {
        console.error("Error fetching event photos:", error);
        res.status(500).json({ error: "Failed to fetch event photos" });
    }
});

// POST /api/events/:id/photos - Upload photos for an event
router.post("/:id/photos", authenticateToken, canManageEvents, upload.array("photos", 10), async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No photos provided" });
        }

        // First, get the event to find its club_id
        const events = await getEvents();
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        const eventClubId = event.club_id;
        const uploadedPhotos = [];

        for (const file of files) {
            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = path.extname(file.originalname);
            const filename = `event_${eventId}_${timestamp}_${randomString}${extension}`;
            const filePath = path.join(uploadsDir, filename);

            // Save file to disk
            fs.writeFileSync(filePath, file.buffer);

            // Save to database
            const photoData = {
                event_id: eventId,
                filename: filename,
                original_name: file.originalname,
                file_path: `/uploads/events/${filename}`,
                file_size: file.size,
                mime_type: file.mimetype,
                club_id: eventClubId
            };

            const photoId = await createEventPhoto(photoData);
            uploadedPhotos.push({
                id: photoId,
                ...photoData
            });
        }

        res.json({
            success: true,
            message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
            photos: uploadedPhotos
        });
    } catch (error) {
        console.error("Error uploading photos:", error);
        res.status(500).json({ error: "Failed to upload photos" });
    }
});

// DELETE /api/events/photos/:id - Delete a specific photo
router.delete("/photos/:id", authenticateToken, canManageEvents, async (req: Request, res: Response) => {
    try {
        const photoId = parseInt(req.params.id);
        
        // Get photo info before deleting
        const photo = await getEventPhotoById(photoId);
        if (!photo) {
            return res.status(404).json({ error: "Photo not found" });
        }

        // Delete file from disk
        const filePath = path.join(process.cwd(), "uploads", "events", photo.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await deleteEventPhoto(photoId);

        res.json({ success: true, message: "Photo deleted successfully" });
    } catch (error) {
        console.error("Error deleting photo:", error);
        res.status(500).json({ error: "Failed to delete photo" });
    }
});

export default router;