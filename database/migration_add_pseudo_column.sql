-- Migration pour ajouter la colonne surnom à la table members
-- Date: 2025-01-27

-- Ajouter la colonne surnom après la colonne prenom
ALTER TABLE members ADD COLUMN surnom VARCHAR(100) DEFAULT NULL AFTER prenom;

-- Ajouter un index sur la colonne surnom pour optimiser les recherches
ALTER TABLE members ADD INDEX idx_surnom (surnom);

-- Message de confirmation
SELECT 'Colonne surnom ajoutée avec succès à la table members!' as message;