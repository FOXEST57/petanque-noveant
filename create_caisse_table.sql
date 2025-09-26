-- Script SQL pour créer les tables nécessaires à la gestion de la caisse

USE petanque_noveant;

-- Ajouter le champ fond_caisse à la table clubs si il n'existe pas
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS fond_caisse DECIMAL(10,2) DEFAULT 0.00;

-- Ajouter le champ solde à la table members si il n'existe pas
ALTER TABLE members ADD COLUMN IF NOT EXISTS solde DECIMAL(10,2) DEFAULT 0.00;

-- Créer la table caisse_historique pour enregistrer toutes les opérations
CREATE TABLE IF NOT EXISTS caisse_historique (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    user_id INT NOT NULL,
    membre_id INT NULL,
    type_operation VARCHAR(50) NOT NULL COMMENT 'credit, transfert, fond',
    montant DECIMAL(10,2) NOT NULL COMMENT 'Montant positif ou négatif selon l''opération',
    description TEXT,
    date_operation DATETIME NOT NULL,
    
    -- Index pour optimiser les requêtes
    INDEX idx_club_date (club_id, date_operation),
    INDEX idx_type_operation (type_operation),
    
    -- Clés étrangères
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Initialiser le fond de caisse à 0 pour tous les clubs existants
UPDATE clubs SET fond_caisse = 0.00 WHERE fond_caisse IS NULL;

-- Initialiser le solde à 0 pour tous les membres existants
UPDATE members SET solde = 0.00 WHERE solde IS NULL;