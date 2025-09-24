import express, { type Request, type Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { authenticateToken, canManageTeams, ensureClubAccess } from '../middleware/auth.js';
import {
    addTeamMember,
    createTeam,
    deleteTeam,
    getTeamById,
    getTeamMembers,
    getTeams,
    removeTeamMember,
    updateTeam,
    updateTeamMemberRole,
} from "../../src/lib/database.js";

// Extend Request interface to include clubId
declare global {
    namespace Express {
        interface Request {
            clubId?: number;
        }
    }
}

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

// Ensure uploads/teams directory exists
const uploadsDir = path.join(process.cwd(), "uploads", "teams");
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

// GET /api/teams/public - Get all teams (public access, no authentication required)
router.get("/public", async (req: Request, res: Response) => {
    try {
        // Vérifier que req.clubId est défini par le middleware de sous-domaine
        if (!req.clubId) {
            return res.status(400).json({
                success: false,
                error: "Club non identifié. Veuillez accéder via un sous-domaine valide.",
            });
        }
        
        const teams = await getTeams(req.clubId);
        res.json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error("Error fetching teams (public):", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des équipes",
        });
    }
});

// GET /api/teams - Get all teams (requires authentication and club access)
router.get("/", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const clubId = req.user!.clubId;
        const teams = await getTeams(clubId);
        res.json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des équipes",
        });
    }
});

// GET /api/teams/:id - Get team by ID (requires authentication and club access)
router.get("/:id", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const teamId = parseInt(req.params.id);
        const clubId = req.user!.clubId;
        const team = await getTeamById(teamId, clubId);

        if (!team) {
            return res.status(404).json({
                success: false,
                error: "Équipe non trouvée",
            });
        }

        res.json({
            success: true,
            data: team,
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération de l'équipe",
        });
    }
});

// POST /api/teams - Create new team (requires authentication and management permissions)
router.post(
    "/",
    authenticateToken,
    canManageTeams,
    upload.single("photo"),
    async (req: Request, res: Response) => {
        try {
            const teamData = req.body;
            const clubId = req.user!.clubId;

            // Validation des données requises
            if (!teamData.name) {
                return res.status(400).json({
                    success: false,
                    error: "Le nom de l'équipe est requis",
                });
            }

            // Handle photo upload if present
            if (req.file) {
                const filename = generateUniqueFilename(req.file.originalname);
                const uploadPath = path.join(uploadsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, req.file.buffer);

                // Store relative path in database
                teamData.photo_url = `uploads/teams/${filename}`;
            }

            const result = await createTeam(teamData, clubId);

            res.status(201).json({
                success: true,
                data: {
                    id: result.lastInsertRowid,
                    ...teamData,
                },
            });
        } catch (error) {
            console.error("Error creating team:", error);
            res.status(500).json({
                success: false,
                error: "Erreur lors de la création de l'équipe",
            });
        }
    }
);

// PUT /api/teams/:id - Update team (requires authentication and management permissions)
router.put(
    "/:id",
    authenticateToken,
    canManageTeams,
    upload.single("photo"),
    async (req: Request, res: Response) => {
        try {
            const teamId = parseInt(req.params.id);
            const clubId = req.user!.clubId;

            // Debug logging
            console.log("PUT /api/teams/:id - req.body:", req.body);
            console.log(
                "PUT /api/teams/:id - req.file:",
                req.file ? "File present" : "No file"
            );

            // Extract and validate team data, filtering out undefined values
            const { name, category, description, competition } = req.body;
            const teamData: any = {};

            if (name !== undefined && name !== null && name !== "")
                teamData.name = name;
            if (category !== undefined && category !== null)
                teamData.category = category || "";
            if (description !== undefined && description !== null)
                teamData.description = description || "";
            if (competition !== undefined && competition !== null)
                teamData.competition = competition || "";

            console.log(
                "PUT /api/teams/:id - teamData before photo:",
                teamData
            );

            // Handle photo upload if present
            if (req.file) {
                const filename = generateUniqueFilename(req.file.originalname);
                const uploadPath = path.join(uploadsDir, filename);

                // Save file to disk
                await fs.promises.writeFile(uploadPath, req.file.buffer);

                // Store relative path in database
                teamData.photo_url = `uploads/teams/${filename}`;
            }

            console.log("PUT /api/teams/:id - final teamData:", teamData);
            console.log(
                "PUT /api/teams/:id - teamData keys:",
                Object.keys(teamData)
            );

            // Check if there are any fields to update
            if (Object.keys(teamData).length === 0 && !req.body.members) {
                return res.status(400).json({
                    success: false,
                    error: "Aucun champ valide à mettre à jour",
                });
            }

            const result = await updateTeam(teamId, teamData, clubId);

            // Handle team members update if provided
            if (req.body.members) {
                try {
                    const members = JSON.parse(req.body.members);
                    console.log("PUT /api/teams/:id - updating members:", members);
                    
                    // First, remove all existing members
                    const existingMembers = await getTeamMembers(parseInt(req.params.id));
                    for (const member of existingMembers) {
                        await removeTeamMember(parseInt(req.params.id), member.id);
                    }
                    
                    // Then add the new members
                    for (const member of members) {
                        await addTeamMember(parseInt(req.params.id), member.id, member.role || 'membre');
                    }
                } catch (memberError) {
                    console.error("Error updating team members:", memberError);
                    // Don't fail the entire update if members update fails
                }
            }

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Équipe non trouvée",
                });
            }

            res.json({
                success: true,
                data: {
                    id: parseInt(req.params.id),
                    ...teamData,
                },
            });
        } catch (error) {
            console.error("Error updating team:", error);
            res.status(500).json({
                success: false,
                error: "Erreur lors de la mise à jour de l'équipe",
            });
        }
    }
);

// DELETE /api/teams/:id - Delete team (requires authentication and management permissions)
router.delete("/:id", authenticateToken, canManageTeams, async (req: Request, res: Response) => {
    try {
        const teamId = parseInt(req.params.id);
        const clubId = req.user!.clubId;

        const result = await deleteTeam(teamId, clubId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Équipe non trouvée",
            });
        }

        res.json({
            success: true,
            message: "Équipe supprimée avec succès",
        });
    } catch (error) {
        console.error("Error deleting team:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la suppression de l'équipe",
        });
    }
});

// GET /api/teams/:id/members - Get team members (requires authentication and club access)
router.get("/:id/members", authenticateToken, ensureClubAccess(), async (req: Request, res: Response) => {
    try {
        const teamId = parseInt(req.params.id);
        const clubId = req.user!.clubId;
        const members = await getTeamMembers(teamId, clubId);

        res.json({
            success: true,
            data: members,
        });
    } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de la récupération des membres de l'équipe",
        });
    }
});

// POST /api/teams/:id/members - Add team member (requires authentication and management permissions)
router.post("/:id/members", authenticateToken, canManageTeams, async (req: Request, res: Response) => {
    try {
        const teamId = parseInt(req.params.id);
        const { memberId, role } = req.body;
        const clubId = req.user!.clubId;

        if (!memberId) {
            return res.status(400).json({
                success: false,
                error: "L'ID du membre est requis",
            });
        }

        const result = await addTeamMember(
            teamId,
            memberId,
            role || "membre",
            clubId
        );

        res.status(201).json({
            success: true,
            data: {
                teamId: parseInt(req.params.id),
                memberId,
                role: role || "membre",
            },
        });
    } catch (error) {
        console.error("Error adding team member:", error);
        res.status(500).json({
            success: false,
            error: "Erreur lors de l'ajout du membre à l'équipe",
        });
    }
});

// DELETE /api/teams/:teamId/members/:memberId - Remove team member (requires authentication and management permissions)
router.delete(
    "/:teamId/members/:memberId",
    authenticateToken,
    canManageTeams,
    async (req: Request, res: Response) => {
        try {
            const teamId = parseInt(req.params.teamId);
            const memberId = parseInt(req.params.memberId);
            const clubId = req.user!.clubId;

            const result = await removeTeamMember(
                teamId,
                memberId,
                clubId
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Membre non trouvé dans cette équipe",
                });
            }

            res.json({
                success: true,
                message: "Membre retiré de l'équipe avec succès",
            });
        } catch (error) {
            console.error("Error removing team member:", error);
            res.status(500).json({
                success: false,
                error: "Erreur lors du retrait du membre de l'équipe",
            });
        }
    }
);

// PUT /api/teams/:teamId/members/:memberId - Update team member role (requires authentication and management permissions)
router.put(
    "/:teamId/members/:memberId",
    authenticateToken,
    canManageTeams,
    async (req: Request, res: Response) => {
        try {
            const teamId = parseInt(req.params.teamId);
            const memberId = parseInt(req.params.memberId);
            const { role } = req.body;
            const clubId = req.user!.clubId;

            if (!role) {
                return res.status(400).json({
                    success: false,
                    error: "Le rôle est requis",
                });
            }

            const result = await updateTeamMemberRole(
                teamId,
                memberId,
                role,
                clubId
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Membre non trouvé dans cette équipe",
                });
            }

            res.json({
                success: true,
                data: {
                    teamId,
                    memberId,
                    role,
                },
            });
        } catch (error) {
            console.error("Error updating team member role:", error);
            res.status(500).json({
                success: false,
                error: "Erreur lors de la mise à jour du rôle du membre",
            });
        }
    }
);

// GET /api/teams/photos/:filename - Servir les photos d'équipes
router.get("/photos/:filename", (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "Photo not found" });
        }

        res.sendFile(path.resolve(filePath));
    } catch (error) {
        console.error("Error serving team photo:", error);
        res.status(500).json({ error: "Failed to serve photo" });
    }
});

export default router;
