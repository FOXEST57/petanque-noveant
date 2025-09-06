import express, { type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { initDatabase, getEvents, createEvent, updateEvent, deleteEvent, getEventPhotos, createEventPhoto, deleteEventPhoto, getEventPhotoById } from '../../src/lib/database.js';

const router = express.Router();

// Initialize database connection
const init = async () => {
  try {
    await initDatabase();
    console.log('Database initialized for events API');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Initialize database on module load
init();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Helper function to generate unique filename
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName);
  return `${timestamp}_${random}${ext}`;
};

// Helper function to ensure upload directory exists
const ensureUploadDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// GET /api/events - Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await getEvents();
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// POST /api/events - Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.title || !eventData.date) {
      return res.status(400).json({
        success: false,
        error: 'Title and date are required'
      });
    }

    const result = await createEvent(eventData);
    
    res.status(201).json({
      success: true,
      data: { id: result.id, ...eventData }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event'
    });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventData = req.body;
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    const result = await updateEvent(eventId, eventData);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: { id: eventId, ...eventData }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }
    
    const result = await deleteEvent(eventId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

// GET /api/events/count - Get total number of events
router.get('/count', async (req: Request, res: Response) => {
  try {
    const events = await getEvents();
    res.json({
      success: true,
      data: { count: events.length }
    });
  } catch (error) {
    console.error('Error getting events count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get events count'
    });
  }
});

// GET /api/events/:id/photos - Get all photos for an event
router.get('/:id/photos', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const photos = await getEventPhotos(eventId);
    res.json(photos);
  } catch (error) {
    console.error('Error getting event photos:', error);
    res.status(500).json({ error: 'Failed to get event photos' });
  }
});

// POST /api/events/:id/photos - Upload photos for an event
router.post('/:id/photos', upload.array('photos', 10), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'events');
    ensureUploadDir(uploadDir);

    const uploadedPhotos = [];

    for (const file of files) {
      const filename = generateUniqueFilename(file.originalname);
      const filePath = path.join(uploadDir, filename);
      const relativePath = path.join('uploads', 'events', filename).replace(/\\/g, '/');

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Save to database
      const photoData = {
        event_id: eventId,
        filename: filename,
        original_name: file.originalname,
        file_path: relativePath,
        file_size: file.size,
        mime_type: file.mimetype
      };

      const result = await createEventPhoto(photoData);
      uploadedPhotos.push({
        id: result.lastID,
        ...photoData,
        upload_date: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// DELETE /api/events/:id/photos/:photoId - Delete a specific photo
router.delete('/:id/photos/:photoId', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    
    if (isNaN(eventId) || isNaN(photoId)) {
      return res.status(400).json({ error: 'Invalid event ID or photo ID' });
    }

    // Get photo info before deleting
    const photo = await getEventPhotoById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.event_id !== eventId) {
      return res.status(400).json({ error: 'Photo does not belong to this event' });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), photo.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await deleteEventPhoto(photoId);

    res.json({ message: 'Photo deleted successfully' });
   } catch (error) {
     console.error('Error deleting photo:', error);
     res.status(500).json({ error: 'Failed to delete photo' });
   }
 });

// GET /api/events/photos/:filename - Serve photo files
router.get('/photos/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'events', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.sendFile(filePath);
   } catch (error) {
     console.error('Error serving photo:', error);
     res.status(500).json({ error: 'Failed to serve photo' });
   }
 });

export default router;