-- Script d'initialisation de la base de données SQLite pour l'application Pétanque Noveant

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des types de membres
CREATE TABLE IF NOT EXISTS member_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    droits TEXT, -- JSON string pour stocker les droits
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des membres du club
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    numero_licence TEXT UNIQUE,
    date_entree DATE,
    date_naissance DATE,
    type_membre_id INTEGER,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_membre_id) REFERENCES member_types(id)
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    photos TEXT, -- JSON string pour stocker les URLs des photos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des concours
CREATE TABLE IF NOT EXISTS concours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    prix_inscription DECIMAL(10,2),
    prix_a_gagner DECIMAL(10,2),
    statut TEXT DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des lotos
CREATE TABLE IF NOT EXISTS lotos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    prix_carton DECIMAL(10,2),
    lots_a_gagner TEXT,
    statut TEXT DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des boissons
CREATE TABLE IF NOT EXISTS drinks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des équipes
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des membres d'équipes
CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    role TEXT DEFAULT 'membre',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE(team_id, member_id)
);

-- Table des matchs
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    team1_id INTEGER NOT NULL,
    team2_id INTEGER NOT NULL,
    score_team1 INTEGER DEFAULT 0,
    score_team2 INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planifie' CHECK (status IN ('planifie', 'en_cours', 'termine')),
    match_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id)
);

-- Table des albums photos
CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table des photos
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Table des photos d'événements
CREATE TABLE IF NOT EXISTS event_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_members_type ON members(type_membre_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_concours_date ON concours(date);
CREATE INDEX IF NOT EXISTS idx_lotos_date ON lotos(date);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member ON team_members(member_id);
CREATE INDEX IF NOT EXISTS idx_matches_event ON matches(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id);

-- Données d'exemple

-- Types de membres
INSERT OR IGNORE INTO member_types (nom, description, droits) VALUES
('Président', 'Président du club', '["admin", "gestion_membres", "gestion_events", "gestion_finances"]'),
('Vice-Président', 'Vice-président du club', '["gestion_membres", "gestion_events"]'),
('Secrétaire', 'Secrétaire du club', '["gestion_membres", "redaction_comptes_rendus"]'),
('Trésorier', 'Trésorier du club', '["gestion_finances", "comptabilite"]'),
('Membre Actif', 'Membre actif du club', '["participation_events"]'),
('Membre Honoraire', 'Membre honoraire', '["participation_events"]');

-- Utilisateur administrateur par défaut
INSERT OR IGNORE INTO users (email, password_hash, role) VALUES
('admin@petanque-noveant.fr', '$2b$10$example_hash', 'admin');

-- Quelques membres d'exemple
INSERT OR IGNORE INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id) VALUES
('Dupont', 'Jean', '123 Rue de la Pétanque, Noveant', '03.87.XX.XX.XX', 'jean.dupont@email.com', 'LIC001', '2020-01-15', '1965-03-20', 1),
('Martin', 'Marie', '456 Avenue des Boules, Noveant', '03.87.XX.XX.XX', 'marie.martin@email.com', 'LIC002', '2020-02-10', '1970-07-15', 2),
('Durand', 'Pierre', '789 Place du Cochonnet, Noveant', '03.87.XX.XX.XX', 'pierre.durand@email.com', 'LIC003', '2021-03-05', '1968-11-30', 5);

-- Quelques équipes d'exemple
INSERT OR IGNORE INTO teams (name, description) VALUES
('Les Pointeurs', 'Équipe spécialisée dans le pointage'),
('Les Tireurs', 'Équipe de tireurs expérimentés'),
('Les Débutants', 'Équipe pour les nouveaux membres');

-- Quelques boissons d'exemple
INSERT OR IGNORE INTO drinks (name, price, description, stock) VALUES
('Bière Pression', 2.50, 'Bière pression 25cl', 50),
('Pastis', 3.00, 'Pastis 51 ou Ricard', 20),
('Café', 1.50, 'Café expresso', 100),
('Eau', 1.00, 'Bouteille d''eau 50cl', 30),
('Vin Rouge', 2.00, 'Verre de vin rouge', 25);

-- Événements d'exemple
INSERT OR IGNORE INTO events (title, description, date) VALUES
('Tournoi de Printemps', 'Grand tournoi de pétanque du printemps', '2024-04-15'),
('Concours de la Saint-Jean', 'Concours traditionnel de la Saint-Jean', '2024-06-24'),
('Championnat d''Été', 'Championnat d''été du club', '2024-07-20');

-- Concours d'exemple
INSERT OR IGNORE INTO concours (nom, date, description, prix_inscription, prix_a_gagner, statut) VALUES
('Concours des Débutants', '2024-05-10', 'Concours réservé aux débutants', 5.00, 50.00, 'planifie'),
('Tournoi Vétérans', '2024-06-15', 'Tournoi pour les joueurs vétérans', 10.00, 150.00, 'planifie');

-- Lotos d'exemple
INSERT OR IGNORE INTO lotos (nom, date, description, prix_carton, lots_a_gagner, statut) VALUES
('Loto de Printemps', '2024-03-30', 'Grand loto de printemps', 2.00, 'Jambon, bouteilles, bons d''achat', 'planifie'),
('Loto de Noël', '2024-12-15', 'Loto de fin d''année', 3.00, 'Dinde, champagne, cadeaux', 'planifie');

-- Albums d'exemple
INSERT OR IGNORE INTO albums (title, description, event_id) VALUES
('Photos Tournoi Printemps', 'Photos du tournoi de printemps 2024', 1),
('Concours Saint-Jean', 'Photos du concours de la Saint-Jean', 2);