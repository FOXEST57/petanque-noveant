-- Migration pour ajouter le champ clubDescription à la table home_content
-- Date: 2025-01-15

ALTER TABLE home_content 
ADD COLUMN club_description TEXT DEFAULT 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année';

-- Mettre à jour l'enregistrement existant avec une valeur par défaut
UPDATE home_content 
SET club_description = 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année'
WHERE id = 1;

SELECT 'Champ club_description ajouté avec succès à la table home_content!' as message;