# Historique des Opérations - Ajout de Photos aux Événements

## Date de début des opérations
Demande initiale d'ajout de photos aux événements

## 1. Modifications de la Base de Données SQLite

### Table `event_photos` créée
**Fichier modifié**: `database/init.sql`
```sql
CREATE TABLE IF NOT EXISTS event_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    photo_name TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

**Fichier modifié**: `database/setup.cjs`
- Ajout de l'initialisation de la table event_photos
- Script d'exécution pour créer la structure

## 2. API Backend - Routes pour Photos

### Fichier créé/modifié: `api/routes/events.ts`

#### Routes implémentées:
1. **POST /api/events/:id/photos** - Upload de photos
   - Middleware multer configuré
   - Stockage dans `uploads/events/`
   - Validation des types de fichiers (jpg, jpeg, png, gif)
   - Limite de taille: 5MB par fichier

2. **GET /api/events/:id/photos** - Récupération des photos
   - Retourne la liste des photos pour un événement

3. **DELETE /api/events/:id/photos/:photoId** - Suppression de photos
   - Suppression du fichier physique
   - Suppression de l'entrée en base

### Configuration Multer
```javascript
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  }
});
```

## 3. Dossier de Stockage

**Dossier créé**: `uploads/events/`
- Structure pour stocker les photos d'événements
- Permissions configurées pour l'écriture

## 4. Interface Admin - Composant d'Upload

### Fichier modifié: `src/pages/Admin.jsx`

#### Fonctionnalités ajoutées:
1. **État pour les photos existantes**:
```javascript
const [existingEventPhotos, setExistingEventPhotos] = useState([]);
```

2. **Composant d'upload multiple**:
   - Drag & drop pour les fichiers
   - Prévisualisation des images avant upload
   - Barre de progression
   - Validation côté client

3. **Gestion des photos existantes**:
   - Affichage en grille
   - Bouton de suppression pour chaque photo
   - Confirmation avant suppression

4. **Fonctions d'upload**:
```javascript
const handlePhotoUpload = async (eventId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('photos', file);
  });
  
  const response = await fetch(`/api/