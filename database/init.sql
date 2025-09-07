-- Script d'initialisation de la base de données MySQL pour Pétanque Noveant
-- Convertir de SQLite vers MySQL/MariaDB

-- Création de la base de données (optionnel, peut être fait manuellement)
-- CREATE DATABASE IF NOT EXISTS petanque_noveant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE petanque_noveant;

-- Table des types de membres
CREATE TABLE IF NOT EXISTS member_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    droits JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des membres
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(255),
    numero_licence VARCHAR(50),
    date_entree DATE,
    date_naissance DATE,
    type_membre_id INT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_membre_id) REFERENCES member_types(id) ON DELETE SET NULL,
    INDEX idx_nom (nom),
    INDEX idx_prenom (prenom),
    INDEX idx_type_membre (type_membre_id)
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    heure VARCHAR(10),
    lieu VARCHAR(255),
    publicCible VARCHAR(255),
    photos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date)
);

-- Table des photos d'événements
CREATE TABLE IF NOT EXISTS event_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
);

-- Table des boissons
CREATE TABLE IF NOT EXISTS drinks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Table des utilisateurs (pour l'authentification)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'guest') DEFAULT 'member',
    member_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Insertion des données de base

-- Types de membres par défaut
INSERT IGNORE INTO member_types (nom, description, droits) VALUES
('Membre actif', 'Membre participant régulièrement aux activités', '{"vote": true, "competition": true}'),
('Membre honoraire', 'Ancien membre ayant rendu des services au club', '{"vote": true, "competition": false}'),
('Membre sympathisant', 'Personne soutenant le club sans participer activement', '{"vote": false, "competition": false}');

-- Utilisateur administrateur par défaut (mot de passe: admin123)
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@petanque-noveant.fr', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'admin');

-- Quelques membres d'exemple
INSERT IGNORE INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id) VALUES
('Dupont', 'Jean', '123 Rue de la Paix, Noveant', '03.87.12.34.56', 'jean.dupont@email.com', 'LIC001', '2020-01-15', '1965-03-20', 1),
('Martin', 'Marie', '456 Avenue des Fleurs, Noveant', '03.87.65.43.21', 'marie.martin@email.com', 'LIC002', '2019-09-10', '1970-07-12', 1),
('Durand', 'Pierre', '789 Boulevard du Stade, Noveant', '03.87.98.76.54', 'pierre.durand@email.com', 'LIC003', '2021-03-05', '1958-11-30', 2);

-- Quelques événements d'exemple
INSERT IGNORE INTO events (title, description, date, heure, lieu, publicCible) VALUES
('Tournoi de Printemps', 'Tournoi annuel de pétanque pour tous les membres', '2024-04-15', '14:00', 'Terrain municipal de Noveant', 'Tous membres'),
('Assemblée Générale', 'Assemblée générale annuelle du club', '2024-03-20', '18:30', 'Salle des fêtes de Noveant', 'Tous membres'),
('Initiation Jeunes', 'Séance d\'initiation à la pétanque pour les jeunes', '2024-05-10', '16:00', 'Terrain municipal de Noveant', 'Jeunes 8-16 ans');

-- Quelques boissons d'exemple
INSERT IGNORE INTO drinks (name, price, description, stock) VALUES
('Bière pression', 2.50, 'Bière locale à la pression', 50),
('Coca-Cola', 2.00, 'Boisson gazeuse', 30),
('Eau minérale', 1.50, 'Bouteille d\'eau 50cl', 40),
('Café', 1.20, 'Café expresso', 100),
('Pastis', 3.00, 'Pastis traditionnel', 20);

-- Affichage des tables créées
SELECT 'Tables créées avec succès!' as message;
SHOW TABLES;