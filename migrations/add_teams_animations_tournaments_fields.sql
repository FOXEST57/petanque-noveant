-- Migration pour ajouter les champs teams_content, animations_content et tournaments_content à la table home_content
-- Date: 2025-01-15

ALTER TABLE home_content 
ADD COLUMN teams_content TEXT;

ALTER TABLE home_content 
ADD COLUMN animations_content TEXT;

ALTER TABLE home_content 
ADD COLUMN tournaments_content TEXT;

-- Mettre à jour l'enregistrement existant avec les valeurs par défaut
UPDATE home_content 
SET 
    teams_content = 'Nos équipes évoluent dans différents championnats départementaux et régionaux. Que vous soyez débutant ou confirmé, vous trouverez votre place dans nos équipes compétitives.',
    animations_content = 'Tout au long de l\'année, nous organisons des animations conviviales : concours amicaux, soirées à thème, barbecues et événements festifs pour rassembler tous les membres.',
    tournaments_content = 'Participez à nos tournois réguliers ! Nous organisons des compétitions internes mensuelles et participons aux grands tournois de la région pour tous les niveaux.'
WHERE id = 1;