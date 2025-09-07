-- Migration pour ajouter les champs heure, lieu et publicCible à la table events
-- À exécuter si la base de données existe déjà

ALTER TABLE events ADD COLUMN heure TEXT;
ALTER TABLE events ADD COLUMN lieu TEXT;
ALTER TABLE events ADD COLUMN publicCible TEXT;

-- Mise à jour des événements existants avec des valeurs par défaut
UPDATE events SET heure = '', lieu = '', publicCible = 'Tous' WHERE heure IS NULL;