-- Migration pour ajouter la colonne club_id à la table team_members
-- Date: 2025-01-25

-- Ajouter la colonne club_id à la table team_members
ALTER TABLE team_members 
ADD COLUMN club_id INT NOT NULL DEFAULT 1;

-- Ajouter une clé étrangère vers la table clubs (si elle existe)
-- ALTER TABLE team_members 
-- ADD CONSTRAINT fk_team_members_club_id 
-- FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Ajouter un index pour améliorer les performances
CREATE INDEX idx_team_members_club_id ON team_members(club_id);

-- Mettre à jour tous les enregistrements existants avec club_id = 1
UPDATE team_members SET club_id = 1 WHERE club_id IS NULL OR club_id = 0;

-- Modifier la contrainte unique pour inclure club_id
-- D'abord supprimer l'ancienne contrainte unique si elle existe
ALTER TABLE team_members DROP INDEX IF EXISTS unique_team_member;

-- Ajouter la nouvelle contrainte unique incluant club_id
ALTER TABLE team_members 
ADD CONSTRAINT unique_team_member_club 
UNIQUE (team_id, member_id, club_id);