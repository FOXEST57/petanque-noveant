-- Migration pour le système multi-club avec authentification et demandes d'adhésion
-- Date: 2024-01-20
-- Description: Ajout des tables clubs, refonte de users, ajout de membership_requests et modification des tables existantes

-- ========================================
-- 1. CRÉATION DE LA TABLE CLUBS
-- ========================================

CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    numero_ffpjp VARCHAR(20) NOT NULL UNIQUE COMMENT 'Numéro FFPJP unique du club',
    subdomain VARCHAR(100) NOT NULL UNIQUE COMMENT 'Sous-domaine pour [ville].petanque-club.fr',
    ville VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero_ffpjp (numero_ffpjp),
    INDEX idx_subdomain (subdomain),
    INDEX idx_ville (ville)
);

-- ========================================
-- 2. REFONTE DE LA TABLE USERS
-- ========================================

-- Sauvegarder l'ancienne table users
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Supprimer l'ancienne table users
DROP TABLE IF EXISTS users;

-- Créer la nouvelle table users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL COMMENT 'ID du club auquel appartient l\'utilisateur',
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    surnom VARCHAR(100) NULL COMMENT 'Surnom facultatif',
    email VARCHAR(255) NOT NULL COMMENT 'Email = ID de connexion',
    telephone VARCHAR(20) NOT NULL,
    numero_licence VARCHAR(50) NULL COMMENT 'Numéro de licence facultatif',
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('president', 'vice_president', 'secretaire', 'tresorier', 'membre', 'invite') DEFAULT 'membre',
    statut ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    photo_url VARCHAR(500) NULL COMMENT 'Photo de profil ou avatar',
    date_creation_compte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_email_club (email, club_id) COMMENT 'Un email peut exister dans plusieurs clubs',
    INDEX idx_club_id (club_id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_statut (statut)
);

-- ========================================
-- 3. CRÉATION DE LA TABLE MEMBERSHIP_REQUESTS
-- ========================================

CREATE TABLE IF NOT EXISTS membership_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL COMMENT 'ID du club pour lequel la demande est faite',
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    surnom VARCHAR(100) NULL COMMENT 'Surnom facultatif',
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    numero_licence VARCHAR(50) NULL COMMENT 'Numéro de licence facultatif',
    message TEXT NULL COMMENT 'Message de motivation',
    statut ENUM('en_attente', 'validee', 'refusee') DEFAULT 'en_attente',
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP NULL,
    traite_par_user_id INT NULL COMMENT 'ID de l\'utilisateur qui a traité la demande',
    commentaire_traitement TEXT NULL COMMENT 'Commentaire lors du traitement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (traite_par_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_club_id (club_id),
    INDEX idx_email (email),
    INDEX idx_statut (statut),
    INDEX idx_date_demande (date_demande)
);

-- ========================================
-- 4. AJOUT DE CLUB_ID AUX TABLES EXISTANTES
-- ========================================

-- Ajouter club_id à la table members
ALTER TABLE members 
ADD COLUMN club_id INT NOT NULL DEFAULT 1 COMMENT 'ID du club auquel appartient le membre',
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- Ajouter club_id à la table events
ALTER TABLE events 
ADD COLUMN club_id INT NOT NULL DEFAULT 1 COMMENT 'ID du club organisateur de l\'événement',
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- Ajouter club_id à la table drinks
ALTER TABLE drinks 
ADD COLUMN club_id INT NOT NULL DEFAULT 1 COMMENT 'ID du club propriétaire de la boisson',
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- Ajouter club_id à la table carousel_images
ALTER TABLE carousel_images 
ADD COLUMN club_id INT NOT NULL DEFAULT 1 COMMENT 'ID du club propriétaire de l\'image',
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- Ajouter club_id à la table member_types
ALTER TABLE member_types 
ADD COLUMN club_id INT NOT NULL DEFAULT 1 COMMENT 'ID du club propriétaire du type de membre',
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- ========================================
-- 5. DONNÉES D'EXEMPLE
-- ========================================

-- Insérer un club d'exemple (Noveant)
INSERT IGNORE INTO clubs (nom, numero_ffpjp, subdomain, ville, adresse, telephone, email, description) VALUES
('Pétanque Club de Noveant', 'FFPJP001', 'noveant', 'Noveant-sur-Moselle', 
 '123 Rue du Stade, 57680 Noveant-sur-Moselle', '03.87.12.34.56', 
 'contact@petanque-noveant.fr', 'Club de pétanque de Noveant-sur-Moselle fondé en 1985');

-- Créer un utilisateur président par défaut
INSERT IGNORE INTO users (club_id, nom, prenom, email, telephone, password_hash, role) VALUES
(1, 'Admin', 'Système', 'admin@petanque-noveant.fr', '03.87.12.34.56', 
 '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'president');

-- Exemple de demande d'adhésion en attente
INSERT IGNORE INTO membership_requests (club_id, nom, prenom, email, telephone, numero_licence, message) VALUES
(1, 'Nouveau', 'Membre', 'nouveau.membre@email.com', '06.12.34.56.78', 'LIC999', 
 'Bonjour, je souhaiterais rejoindre votre club de pétanque. J\'ai déjà une expérience de 2 ans dans un autre club.');

-- ========================================
-- 6. VÉRIFICATIONS
-- ========================================

-- Afficher les nouvelles tables
SELECT 'Migration terminée avec succès!' as message;
SHOW TABLES;

-- Vérifier la structure des nouvelles tables
DESCRIBE clubs;
DESCRIBE users;
DESCRIBE membership_requests;