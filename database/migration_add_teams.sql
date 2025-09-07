-- Migration pour ajouter les tables teams et team_members
-- Date: 2024-01-08

-- Table des équipes
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    photo_url VARCHAR(500),
    competition VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_competition (competition)
);

-- Table de liaison entre équipes et membres
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    member_id INT NOT NULL,
    role VARCHAR(100) DEFAULT 'Joueur',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_member (team_id, member_id),
    INDEX idx_team_id (team_id),
    INDEX idx_member_id (member_id)
);

-- Insertion de quelques équipes d'exemple
INSERT IGNORE INTO teams (name, category, description, competition) VALUES
('Équipe Seniors A', 'Seniors', 'Équipe principale des seniors', 'Championnat Départemental'),
('Équipe Vétérans', 'Vétérans', 'Équipe des joueurs vétérans', 'Coupe Vétérans'),
('Équipe Jeunes', 'Juniors', 'Équipe des jeunes joueurs', 'Tournoi Jeunes'),
('Équipe Seniors B', 'Seniors', 'Équipe secondaire des seniors', 'Championnat Local');

-- Liaison de quelques membres aux équipes (en utilisant les IDs des membres existants)
INSERT IGNORE INTO team_members (team_id, member_id, role) VALUES
(1, 1, 'Capitaine'),
(1, 2, 'Joueur'),
(2, 3, 'Capitaine'),
(3, 2, 'Entraîneur');

SELECT 'Tables teams et team_members créées avec succès!' as message;