-- Migration pour ajouter la colonne teams_content à la table home_content
ALTER TABLE home_content ADD COLUMN teams_content TEXT AFTER club_description;

-- Initialiser avec une valeur par défaut
UPDATE home_content SET teams_content = 'Nos équipes participent régulièrement aux championnats locaux et régionaux.' WHERE id = 1;