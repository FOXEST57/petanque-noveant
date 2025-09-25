-- Migration pour ajouter la colonne club_id à la table team_members
-- Date: 2025-01-27

-- Ajouter la colonne club_id à la table team_members
ALTER TABLE team_members 
ADD COLUMN club_id INT NOT NULL DEFAULT 1,
ADD FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
ADD INDEX idx_club_id (club_id);

-- Mettre à jour les enregistrements existants avec le club_id approprié
-- basé sur le club_id de l'équipe
UPDATE team_members tm
JOIN teams t ON tm.team_id = t.id
SET tm.club_id = t.club_id;

-- Modifier la contrainte unique pour inclure club_id
ALTER TABLE team_members 
DROP INDEX unique_team_member,
ADD UNIQUE KEY unique_team_member_club (team_id, member_id, club_id);

SELECT 'Colonne club_id ajoutée à la table team_members avec succès!' as message;