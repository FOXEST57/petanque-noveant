-- Migration pour ajouter le champ title à la table home_carousel_images
-- Date: 2025-01-10

ALTER TABLE home_carousel_images 
ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER image_url;

-- Mettre à jour les titres existants avec des valeurs par défaut
UPDATE home_carousel_images 
SET title = CONCAT('Image ', display_order) 
WHERE title IS NULL;

SELECT 'Champ title ajouté à home_carousel_images avec succès!' as message;