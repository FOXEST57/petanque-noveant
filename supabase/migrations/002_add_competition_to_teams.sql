-- Migration pour ajouter le champ competition à la table teams
-- Date: 2024-01-08

ALTER TABLE teams ADD COLUMN competition VARCHAR(255);

-- Mise à jour des équipes existantes avec des compétitions par défaut
UPDATE teams SET competition = 'Championnat Départemental' WHERE category = 'Seniors';
UPDATE teams SET competition = 'Coupe Vétérans' WHERE category = 'Vétérans';
UPDATE teams SET competition = 'Tournoi Jeunes' WHERE category = 'Juniors';
UPDATE teams SET competition = 'Championnat Local' WHERE competition IS NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN teams.competition IS 'Compétition dans laquelle l''équipe évolue';