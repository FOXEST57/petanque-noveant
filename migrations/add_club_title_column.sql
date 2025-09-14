-- Migration pour ajouter la colonne club_title à la table home_content
-- Date: 2025-01-15

ALTER TABLE home_content ADD COLUMN IF NOT EXISTS club_title VARCHAR(255) DEFAULT 'Découvrez notre club' AFTER members;

-- Mettre à jour les enregistrements existants avec la valeur par défaut
UPDATE home_content SET club_title = 'Découvrez notre club' WHERE club_title IS NULL OR club_title = '';